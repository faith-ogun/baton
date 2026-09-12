"""
Baton's backend.

One in-memory `WorkspaceState`, refreshed by a 45 second sweep and by verified
Ambiguous webhooks, served to the dashboard at `GET /api/state` and pushed over
`WS /live`. The shape on the wire is the `WorkspaceState` type in
`web/src/types.ts`; nothing here may drift from it.

Read-only, with one exception: `POST /api/risks/{id}/approve`, which is the
human approval and is the only path to an action. The acting itself lives in
`executor.py` and `audit.py`, which this module calls and does not duplicate.

Run: uvicorn main:app --port 8000 --reload
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import hmac
import json
import logging
import os
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from fastapi import Body, FastAPI, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import graph as graph_mod
import ingest
import risk as risk_mod

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("baton")

HERE = Path(__file__).resolve().parent
RULES_PATH = HERE / "rules.yaml"


def _load_dotenv() -> None:
    """
    Read server/.env before anything reads the environment.

    The webhook signing secret has one-time visibility, so it needs somewhere
    to live that is not a shell history line. The file is gitignored. Anything
    already exported wins, so a one-off override on the command line still works.
    """
    path = HERE / ".env"
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


_load_dotenv()

SWEEP_SECONDS = int(os.environ.get("BATON_SWEEP_SECONDS", "45"))
WEBHOOK_SECRET = os.environ.get("AMBI_WEBHOOK_SECRET", "").strip()
REPLAY_WINDOW_SECONDS = 300

# The executor and the audit sheet writer are a separate concern, written in
# parallel. Import them if they are there; if they are not, the server still
# starts and the approve route says why rather than 500ing mid-demo.
try:
    # execute(risk, state) performs the one action and returns an Executed;
    # audit_entry(risk, done) shapes it into the AuditEntry the front end
    # wants; append_audit(entry) writes the row and returns whether the
    # workspace took it. This module calls all three and implements none.
    from executor import audit_entry, execute
    from audit import append_audit

    _CAN_ACT = True
except ImportError as exc:  # pragma: no cover - depends on a sibling file existing
    execute = None  # type: ignore[assignment]
    audit_entry = None  # type: ignore[assignment]
    append_audit = None  # type: ignore[assignment]
    _CAN_ACT = False
    log.warning("executor/audit not importable yet (%s); approve will answer 503", exc)


# ---------------------------------------------------------------- state


class Store:
    """
    The whole of Baton's memory.

    One state object behind one lock. There is no database because the audit
    sheet in the workspace is the persistence, and because a demo that depends
    on a migration is a demo that does not run.
    """

    def __init__(self) -> None:
        self.lock = asyncio.Lock()
        self.rules: dict[str, Any] = load_rules()
        self.state: dict[str, Any] = empty_state(self.rules)
        self.audit: list[dict[str, Any]] = []
        self.token: str | None = None
        self.me: ingest.Person | None = None


def load_rules() -> dict[str, Any]:
    with RULES_PATH.open() as fh:
        rules = yaml.safe_load(fh) or {}
    # Days is the honest default: minutes is a demo affordance and has to be
    # asked for in the file, never assumed.
    rules.setdefault("time_unit", "days")
    return rules


def empty_state(rules: dict[str, Any]) -> dict[str, Any]:
    """What the dashboard gets before the first sweep has landed."""
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "workspace": "connecting",
        "scope": {"org": "", "team": os.environ.get("BATON_TEAM", "Whole workspace"), "lead": "", "headcount": 0, "siblings": []},
        "health": 98,
        "connected": False,
        "graph": {"nodes": [], "edges": []},
        "risks": [],
        "audit": [],
        "rules": rules,
    }


STORE = Store()


class Sockets:
    """Every dashboard currently watching. A dead socket is dropped, not retried."""

    def __init__(self) -> None:
        self.live: set[WebSocket] = set()

    async def add(self, ws: WebSocket) -> None:
        await ws.accept()
        self.live.add(ws)

    def drop(self, ws: WebSocket) -> None:
        self.live.discard(ws)

    async def send(self, event: dict[str, Any]) -> None:
        for ws in list(self.live):
            try:
                await ws.send_json(event)
            except Exception:
                self.drop(ws)


SOCKETS = Sockets()


# ---------------------------------------------------------------- the sweep


def _scope(snap: ingest.Snapshot, risks: list[dict[str, Any]], health: int) -> dict[str, Any]:
    """
    Who is looking.

    The API has no team or reporting structure, so the team name is whatever
    BATON_TEAM says and otherwise the literal truth: the whole workspace. The
    lead is the first human member, which is the only ordering the API gives.
    """
    team = os.environ.get("BATON_TEAM", "Whole workspace")
    open_count = len([r for r in risks if r["status"] in ("open", "working")])
    # The lead is BATON_LEAD if it is set, otherwise the first teammate the API
    # lists, which is the only ordering it gives us.
    mates = snap.teammates
    return {
        "org": snap.workspace_name,
        "team": team,
        "lead": os.environ.get("BATON_LEAD") or (mates[0].name if mates else "unassigned"),
        "headcount": len(snap.people),
        # One board, itself. The roll-up exists in the contract for a lead with
        # several teams; inventing siblings would be inventing an org chart.
        "siblings": [{"id": "this", "team": team, "open": open_count, "health": health}],
    }


async def refresh(reason: str) -> dict[str, Any]:
    """Pull, rebuild, re-detect, publish. The only writer of `STORE.state`."""
    started = time.monotonic()
    snap = await ingest.pull(STORE.token)

    async with STORE.lock:
        rules = STORE.rules
        view = graph_mod.build(snap, rules)
        risks = risk_mod.detect(snap, view.metrics, rules)
        graph_mod.apply_risks(view.nodes, risks)
        health = risk_mod.health(risks)

        previous = {r["id"] for r in STORE.state.get("risks", [])}
        # Approvals and dismissals live in memory, so a sweep must not undo one.
        settled = {r["id"]: r["status"] for r in STORE.state.get("risks", []) if r["status"] in ("done", "dismissed")}
        for r in risks:
            if r["id"] in settled:
                r["status"] = settled[r["id"]]

        STORE.state = {
            "generatedAt": snap.at.isoformat().replace("+00:00", "Z"),
            "workspace": snap.workspace,
            "scope": _scope(snap, risks, health),
            "health": health,
            "connected": snap.connected,
            "graph": {"nodes": view.nodes, "edges": view.edges},
            "risks": risks,
            "audit": list(STORE.audit),
            "rules": rules,
        }
        fresh = [r for r in risks if r["id"] not in previous and r["status"] == "open"]
        state = STORE.state

    await SOCKETS.send(
        {"type": "graph_update", "nodes": state["graph"]["nodes"], "edges": state["graph"]["edges"], "health": state["health"]}
    )
    for r in fresh:
        await SOCKETS.send({"type": "new_risk", "risk": r})

    log.info(
        "sweep(%s): %d people, %d tasks, %d events, %d risks, health %d, %.0fms%s",
        reason,
        len(snap.people),
        len(snap.tasks),
        len(snap.events),
        len(risks),
        state["health"],
        (time.monotonic() - started) * 1000,
        f", errors: {snap.errors}" if snap.errors else "",
    )
    return state


async def sweep_forever() -> None:
    """
    The fallback clock.

    Webhooks carry the live moments, but a stall and an unbooked date are the
    absence of an event and no webhook will ever fire for them, so the state has
    to be recomputed on a timer as well.
    """
    while True:
        try:
            await asyncio.sleep(SWEEP_SECONDS)
            await refresh("sweep")
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            log.warning("sweep failed, carrying on: %s: %s", type(exc).__name__, exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        STORE.token = ingest.load_token()
    except RuntimeError as exc:
        log.error("no agent token: %s", exc)
    if not WEBHOOK_SECRET:
        log.warning(
            "AMBI_WEBHOOK_SECRET is unset: webhook verification is unconfigured and POST /webhooks will answer 503"
        )
    try:
        # Identity from the API, never from the config file, whose userEmail is
        # stale after a workspace merge.
        state = await refresh("startup")
        who = state["graph"]["nodes"]
        log.info("connected as %s in %s (%d nodes)", STORE.state["scope"]["org"] or "?", STORE.state["workspace"], len(who))
    except Exception as exc:
        log.error("startup pull failed: %s: %s", type(exc).__name__, exc)
    task = asyncio.create_task(sweep_forever())
    try:
        yield
    finally:
        task.cancel()


app = FastAPI(title="Baton", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        # Firebase Hosting origins for the deployed front end.
        "https://baton-hack-2026.web.app",
        "https://baton-hack-2026.firebaseapp.com",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- reads


@app.get("/health")
async def liveness() -> dict[str, Any]:
    return {"ok": True, "connected": STORE.state["connected"], "risks": len(STORE.state["risks"])}


@app.get("/api/state")
async def get_state() -> dict[str, Any]:
    async with STORE.lock:
        return STORE.state


@app.get("/rules")
@app.get("/api/rules")
async def get_rules() -> dict[str, Any]:
    async with STORE.lock:
        return STORE.rules


@app.put("/rules")
@app.put("/api/rules")
async def put_rules(patch: dict[str, Any] = Body(...)) -> dict[str, Any]:
    """
    Move a threshold and the queue re-scores against it.

    A shallow merge per group, so the drawer can send one slider rather than the
    whole registry. Detection is re-run rather than only the scoring, because a
    threshold decides what fires as well as how hard.

    The change is held in memory and rules.yaml is not rewritten. Dumping the
    file back would strip every comment out of it, and those comments are the
    registry's explanation of itself; a restart returning to the documented
    values is the better trade.
    """
    async with STORE.lock:
        merged = dict(STORE.rules)
        for key, value in (patch or {}).items():
            if isinstance(value, dict) and isinstance(merged.get(key), dict):
                merged[key] = {**merged[key], **value}
            else:
                merged[key] = value
        STORE.rules = merged
    await refresh("rules")
    async with STORE.lock:
        return STORE.rules


@app.websocket("/live")
async def live(ws: WebSocket) -> None:
    await SOCKETS.add(ws)
    try:
        async with STORE.lock:
            state = STORE.state
        # An arriving dashboard gets the current picture straight away rather
        # than an empty graph until the next sweep.
        await ws.send_json(
            {"type": "graph_update", "nodes": state["graph"]["nodes"], "edges": state["graph"]["edges"], "health": state["health"]}
        )
        while True:
            # Nothing the client says is acted on. The socket is a one-way push
            # and reading it only keeps the connection honest about closing.
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        SOCKETS.drop(ws)


# ---------------------------------------------------------------- webhooks

_SIGNATURE_HEADERS = (
    "x-ambiguous-signature",
    "x-ambi-signature",
    "x-webhook-signature",
    "x-signature",
    "x-hub-signature-256",
)
_TIMESTAMP_HEADERS = ("x-ambiguous-timestamp", "x-ambi-timestamp", "x-webhook-timestamp", "x-timestamp")


def _digests(secret: str, timestamp: str, body: bytes) -> set[str]:
    """
    Every encoding of the signature we are prepared to accept.

    The header name and the exact signing string are not in the OpenAPI spec, so
    both the Stripe-style `timestamp.body` payload and a bare body are computed,
    in hex and base64. What is not negotiable is the secret: an unsigned or
    wrongly signed request never reaches the state.
    """
    out: set[str] = set()
    payloads = [body]
    if timestamp:
        payloads.append(f"{timestamp}.".encode() + body)
    for payload in payloads:
        mac = hmac.new(secret.encode(), payload, hashlib.sha256)
        out.add(mac.hexdigest())
        out.add(base64.b64encode(mac.digest()).decode())
    return out


def _timestamp_age(raw: str) -> float | None:
    """Seconds since the header's timestamp. Epoch seconds, millis or ISO."""
    if not raw:
        return None
    try:
        value = float(raw)
        if value > 1e11:  # milliseconds
            value /= 1000.0
        return time.time() - value
    except ValueError:
        parsed = ingest.parse_dt(raw)
        if not parsed:
            return None
        return (datetime.now(timezone.utc) - parsed).total_seconds()


@app.post("/webhooks")
async def receive_webhook(request: Request) -> Response:
    """
    An Ambiguous event. Verified first, believed never.

    Two checks, and they answer two different questions. The HMAC proves the
    request came from something holding the signing secret, which stops anyone
    who knows the URL from writing to Baton's state. The timestamp window stops
    a request that was genuinely signed being captured and replayed later, which
    a signature alone cannot detect because it stays valid for ever.

    After that the payload is still not treated as fact. It is a signal to go
    and re-read the workspace through the API, which is both the honest design
    and the reason a crafted payload cannot put anything on the dashboard.
    """
    if not WEBHOOK_SECRET:
        return JSONResponse(
            {"error": "webhook verification unconfigured", "detail": "set AMBI_WEBHOOK_SECRET to the secret returned by POST /api/webhooks"},
            status_code=503,
        )

    body = await request.body()
    headers = {k.lower(): v for k, v in request.headers.items()}
    supplied = next((headers[h] for h in _SIGNATURE_HEADERS if h in headers), "")
    timestamp = next((headers[h] for h in _TIMESTAMP_HEADERS if h in headers), "")

    if not supplied:
        log.warning("webhook rejected: no signature header (saw %s)", sorted(h for h in headers if h.startswith("x-")))
        return JSONResponse({"error": "unsigned"}, status_code=401)

    candidate = supplied.split("=", 1)[1] if supplied.startswith("sha256=") else supplied
    if not any(hmac.compare_digest(candidate, good) for good in _digests(WEBHOOK_SECRET, timestamp, body)):
        log.warning("webhook rejected: signature mismatch")
        return JSONResponse({"error": "bad signature"}, status_code=401)

    age = _timestamp_age(timestamp)
    if age is not None and abs(age) > REPLAY_WINDOW_SECONDS:
        log.warning("webhook rejected: %.0fs outside the %ds replay window", age, REPLAY_WINDOW_SECONDS)
        return JSONResponse({"error": "stale"}, status_code=401)
    if age is None:
        # No timestamp header means the replay check cannot run. The signature
        # still has to verify, so this is logged rather than silently accepted.
        log.info("webhook accepted with no timestamp header: replay window not checked")

    try:
        event = json.loads(body or b"{}")
        kind = event.get("event") or event.get("type") or "unknown"
    except json.JSONDecodeError:
        kind = "unparsed"

    # Re-read rather than trust. The event says something moved; the API says what.
    await refresh(f"webhook:{kind}")
    return JSONResponse({"ok": True, "event": kind})


# ---------------------------------------------------------------- the one write


@app.post("/api/risks/{risk_id}/approve")
async def approve(risk_id: str) -> Response:
    """
    The human approval, and the only path from a risk to an action.

    The work is `executor.execute`, which acts through the Ambiguous API, and
    `audit.append_audit`, which writes the row to the audit sheet. This route
    only finds the risk, records the outcome and tells the dashboard.
    """
    async with STORE.lock:
        risk = next((r for r in STORE.state["risks"] if r["id"] == risk_id), None)
        state = STORE.state
    if risk is None:
        return JSONResponse({"error": "unknown risk", "id": risk_id}, status_code=404)
    if not _CAN_ACT:
        return JSONResponse(
            {"error": "executor unavailable", "detail": "server/executor.py and server/audit.py are not importable"},
            status_code=503,
        )
    # Only an open risk can be approved. "working" deliberately does not count:
    # a second click arriving while the first is still in flight would otherwise
    # pass this guard and fire the action twice, and the calendar endpoint does
    # not honour Idempotency-Key (two identical POSTs create two events, tested
    # against the live API), so the header is not a safety net there. A failed
    # action already resets the status to "open", so nothing legitimate needs
    # "working" to be approvable.
    if risk["status"] != "open":
        return JSONResponse({"error": "already handled", "status": risk["status"]}, status_code=409)

    async with STORE.lock:
        risk["status"] = "working"

    try:
        done = await execute(risk, state)
    except Exception as exc:
        # The action did not happen, so the card goes back in the queue.
        async with STORE.lock:
            risk["status"] = "open"
        log.exception("approve %s failed", risk_id)
        return JSONResponse({"error": "action failed", "detail": f"{type(exc).__name__}: {exc}"}, status_code=502)

    entry = done if isinstance(done, dict) else audit_entry(risk, done)
    # append_audit never raises and returns whether the row landed. A failed
    # log must not roll back an action that already happened in somebody's
    # inbox, so the honest answer is "done, and the log write failed".
    logged = await append_audit(entry)
    if not logged:
        log.warning("action for %s succeeded but the audit row did not land", risk_id)

    async with STORE.lock:
        risk["status"] = "done"
        if isinstance(entry, dict):
            entry.setdefault("riskId", risk_id)
            STORE.audit.insert(0, entry)
            STORE.state["audit"] = list(STORE.audit)
        # Cool the nodes the action touched, so the graph settles back the way
        # the dashboard does it locally.
        touched = set(risk.get("nodes", []))
        for n in STORE.state["graph"]["nodes"]:
            if n["id"] in touched:
                n["risk"] = round(max(0.0, n["risk"] - 0.55), 3)
        for e in STORE.state["graph"]["edges"]:
            if e["source"] in touched and e["target"] in touched:
                e.pop("open", None)
        STORE.state["health"] = risk_mod.health(STORE.state["risks"])
        health = STORE.state["health"]

    await SOCKETS.send({"type": "action_logged", "entry": entry, "riskId": risk_id, "health": health})
    return JSONResponse({"ok": True, "entry": entry, "health": health, "logged": logged})
