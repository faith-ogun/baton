"""
Read-only ingest from the Ambiguous workspace.

Everything Baton knows about the workspace arrives through this module, and
nothing in here writes: acting is the executor's job, behind a human approval.

The paths are the verified ones from `docs/20_Architecture/The Ambiguous API,
verified.md`, read off the live OpenAPI spec. Four of the paths in the root
CLAUDE.md cheat-sheet do not exist, so do not copy them from there.

A failed call is logged and skipped rather than raised. A dashboard that shows
the tasks but not the calendar is useful; a dashboard that 500s because one
endpoint hiccuped in the middle of a demo is not.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx

log = logging.getLogger("baton.ingest")

BASE_URL = os.environ.get("AMBI_BASE_URL", "https://app.ambiguous.ai").rstrip("/")

# Written by `ambiguous auth`, gitignored, and read exactly once at startup.
# The token is never logged, never echoed and never returned by an endpoint.
_CONFIG_PATH = Path(
    os.environ.get("AMBI_CONFIG", Path(__file__).resolve().parent.parent / ".ambi" / "config.json")
)

_TIMEOUT = httpx.Timeout(connect=5.0, read=20.0, write=10.0, pool=5.0)
_MAX_PAGES = 20  # a runaway cursor loop would wedge the sweep, so it is capped


def load_token() -> str:
    """AMBI_TOKEN wins, then the CLI's config file. Raises if neither is there."""
    env = os.environ.get("AMBI_TOKEN")
    if env:
        return env.strip()
    try:
        with _CONFIG_PATH.open() as fh:
            token = json.load(fh).get("authToken")
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"no agent token: set AMBI_TOKEN or fix {_CONFIG_PATH} ({exc})") from exc
    if not token:
        raise RuntimeError(f"no authToken in {_CONFIG_PATH}; set AMBI_TOKEN instead")
    return str(token).strip()


def client(token: str | None = None) -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=BASE_URL,
        timeout=_TIMEOUT,
        headers={
            "Authorization": f"Bearer {token or load_token()}",
            "Accept": "application/json",
            "User-Agent": "baton/0.1 (+hackathon)",
        },
    )


# ---------------------------------------------------------------- parsing


def parse_dt(value: Any) -> datetime | None:
    """ISO 8601 to an aware UTC datetime. Tolerates a trailing Z and bare dates."""
    if not value or not isinstance(value, str):
        return None
    raw = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(raw)
    except ValueError:
        try:
            parsed = datetime.fromisoformat(raw[:10])  # a bare yyyy-mm-dd due date
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


OPEN_STATUSES = {"todo", "in_progress", "blocked"}
DONE_STATUSES = {"done", "cancelled"}


@dataclass
class Person:
    id: str
    name: str
    email: str
    kind: str  # 'human' or 'agent'
    username: str = ""

    @property
    def first(self) -> str:
        return self.name.split(" ")[0] if self.name else self.username


@dataclass
class Task:
    id: str
    title: str
    status: str
    priority: str
    assignee_id: str | None
    assignee_name: str | None
    due_date: datetime | None
    updated_at: datetime | None
    created_at: datetime | None
    creator_id: str | None = None
    project_id: str | None = None
    labels: list[str] = field(default_factory=list)
    comment_count: int = 0
    subscriber_ids: list[str] = field(default_factory=list)

    @property
    def open(self) -> bool:
        return self.status not in DONE_STATUSES

    @property
    def critical(self) -> bool:
        """Work that hurts if it stops: on a clock, or flagged as urgent."""
        return self.due_date is not None or self.priority in {"urgent", "high"}

    @property
    def due_on(self) -> date | None:
        return self.due_date.date() if self.due_date else None


@dataclass
class Event:
    id: str
    title: str
    start: datetime | None
    end: datetime | None
    status: str = "confirmed"
    attendee_ids: list[str] = field(default_factory=list)
    source: str = "calendar"  # 'calendar' or 'availability'

    def covers(self, day: date) -> bool:
        """Does this event hold time on that calendar day (UTC)."""
        if self.status == "cancelled" or not self.start:
            return False
        last = (self.end or self.start).date()
        return self.start.date() <= day <= last


@dataclass
class Snapshot:
    at: datetime
    workspace: str
    workspace_name: str
    me: Person | None
    people: list[Person]
    tasks: list[Task]
    events: list[Event]
    errors: list[str] = field(default_factory=list)

    @property
    def connected(self) -> bool:
        """True when the identity call came back. Drives the header's live chip."""
        return self.me is not None

    @property
    def self_id(self) -> str:
        """Baton's own user id, from the API rather than from the config file."""
        return self.me.id if self.me else ""

    @property
    def teammates(self) -> list[Person]:
        """
        Everyone in the workspace except Baton.

        Deliberately not "everyone whose type is human": the seeded team is
        provisioned as Ambiguous coworkers, so `type` is `agent` for most of
        them. The only identity that is special here is Baton's own, and that
        comes from GET /api/users/me.
        """
        return [p for p in self.people if p.id != self.self_id]

    def person(self, person_id: str | None) -> Person | None:
        if not person_id:
            return None
        return next((p for p in self.people if p.id == person_id), None)


# ---------------------------------------------------------------- HTTP


async def _get(cl: httpx.AsyncClient, path: str, params: dict[str, Any] | None = None) -> Any:
    """One GET, with the two retries that actually happen in practice: 429 and 5xx."""
    delay = 0.5
    last: Exception | None = None
    for attempt in range(3):
        try:
            res = await cl.get(path, params=params)
        except httpx.HTTPError as exc:  # DNS, timeout, reset
            last = exc
            await asyncio.sleep(delay)
            delay *= 2
            continue

        if res.status_code == 429:
            # Honour the server's own number when it gives one; it knows better
            # than a backoff curve does.
            hinted = res.headers.get("Retry-After")
            wait = min(float(hinted), 10.0) if (hinted or "").replace(".", "", 1).isdigit() else delay
            log.warning("429 on %s, waiting %.1fs", path, wait)
            await asyncio.sleep(wait)
            delay *= 2
            continue

        if res.status_code >= 500:
            last = httpx.HTTPStatusError(f"{res.status_code} on {path}", request=res.request, response=res)
            await asyncio.sleep(delay)
            delay *= 2
            continue

        res.raise_for_status()
        return res.json()

    raise last or RuntimeError(f"GET {path} failed")


async def _get_pages(cl: httpx.AsyncClient, path: str, params: dict[str, Any] | None = None) -> list[dict]:
    """Follow `next_cursor` to the end of a list endpoint."""
    out: list[dict] = []
    query = dict(params or {})
    query.setdefault("limit", 200)
    for _ in range(_MAX_PAGES):
        payload = await _get(cl, path, query)
        if isinstance(payload, list):
            out.extend(payload)
            return out
        out.extend(payload.get("data") or [])
        cursor = payload.get("next_cursor")
        if not payload.get("has_more") or not cursor:
            return out
        query["cursor"] = cursor
    log.warning("pagination cap hit on %s after %d pages", path, _MAX_PAGES)
    return out


# ---------------------------------------------------------------- pulls


def _person(row: dict) -> Person:
    return Person(
        id=row.get("id") or "",
        name=row.get("display_name") or row.get("username") or "Unknown",
        email=row.get("workspace_email") or row.get("primary_email") or "",
        kind=row.get("type") or "human",
        username=row.get("username") or "",
    )


def _task(row: dict) -> Task:
    assignee = row.get("assignee") or {}
    return Task(
        id=row.get("id") or "",
        title=row.get("title") or "Untitled task",
        status=row.get("status") or "todo",
        priority=row.get("priority") or "medium",
        assignee_id=row.get("assignee_id") or assignee.get("id"),
        assignee_name=assignee.get("display_name"),
        due_date=parse_dt(row.get("due_date")),
        updated_at=parse_dt(row.get("updated_at")) or parse_dt(row.get("created_at")),
        created_at=parse_dt(row.get("created_at")),
        creator_id=row.get("creator_id") or (row.get("creator") or {}).get("id"),
        project_id=row.get("project_id"),
        labels=[l.get("name") for l in (row.get("labels") or []) if isinstance(l, dict) and l.get("name")],
        comment_count=row.get("comment_count") or 0,
        subscriber_ids=[s for s in (row.get("subscriber_ids") or []) if isinstance(s, str)],
    )


def _event(row: dict) -> Event:
    attendees = row.get("attendees") or []
    return Event(
        id=row.get("id") or "",
        title=row.get("title") or "Untitled event",
        start=parse_dt(row.get("start_at")),
        end=parse_dt(row.get("end_at")),
        status=row.get("status") or "confirmed",
        attendee_ids=[
            a.get("user_id") or a.get("id")
            for a in attendees
            if isinstance(a, dict) and (a.get("user_id") or a.get("id"))
        ],
    )


def _availability_events(payload: Any) -> list[Event]:
    """
    Free/busy spans as events.

    The shape is `{"availability": {user_id: [{start, end, title}]}}` and the
    titles come back as "Busy", which is all the detector needs: it asks
    whether the day is held, not what by. Nothing here is a task projection,
    so this source needs no filtering.
    """
    if not isinstance(payload, dict):
        return []
    out: list[Event] = []
    for user_id, spans in (payload.get("availability") or {}).items():
        for i, span in enumerate(spans or []):
            start = parse_dt(span.get("start"))
            if not start:
                continue
            out.append(
                Event(
                    id=f"busy:{user_id[:8]}:{i}",
                    title=span.get("title") or "Busy",
                    start=start,
                    end=parse_dt(span.get("end")),
                    attendee_ids=[user_id],
                    source="availability",
                )
            )
    return out


async def pull(token: str | None = None, horizon_days: int = 60) -> Snapshot:
    """
    One full read of the workspace: identity, people, tasks, calendar.

    Full reads rather than `updated_min` deltas, because a stall is the absence
    of an event and there is no server-side query for absence: the detectors
    have to hold every open task and compare timestamps themselves. The
    workspace is one team, so a full read is cheap.
    """
    errors: list[str] = []
    now = datetime.now(timezone.utc)

    async with client(token) as cl:

        async def safe(name: str, coro):
            try:
                return await coro
            except Exception as exc:  # one dead endpoint must not kill the sweep
                # Deliberately logs the exception class and message only: a URL
                # is fine, a header is not.
                errors.append(f"{name}: {type(exc).__name__}")
                log.warning("ingest %s failed: %s: %s", name, type(exc).__name__, exc)
                return None

        window = {
            "start": (now - timedelta(days=7)).isoformat().replace("+00:00", "Z"),
            "end": (now + timedelta(days=horizon_days)).isoformat().replace("+00:00", "Z"),
            # Without singleEvents a recurring series is one record, and the
            # instance that actually covers a deadline is invisible.
            "singleEvents": "true",
        }

        me_raw, ws_raw, users_raw, tasks_raw, events_raw = await asyncio.gather(
            safe("users/me", _get(cl, "/api/users/me")),
            safe("workspace", _get(cl, "/api/workspace")),
            safe("users", _get_pages(cl, "/api/users")),
            safe("tasks", _get_pages(cl, "/api/tasks", {"show_archived": "false"})),
            safe("calendars/events", _get_pages(cl, "/api/calendars/events", window)),
        )

        me = _person(me_raw) if isinstance(me_raw, dict) else None
        people = [_person(r) for r in (users_raw or [])]

        # Free/busy across named members, which is the only workspace-wide view
        # of held time an agent token gets: GET /api/calendars only ever lists
        # Baton's own calendar, so a booking on a colleague's calendar would be
        # invisible and every date would look unbooked. It needs the ids, so it
        # cannot join the gather above.
        avail_raw = None
        if people:
            avail_raw = await safe(
                "calendars/availability",
                _get(
                    cl,
                    "/api/calendars/availability",
                    {"user_ids": ",".join(p.id for p in people if p.id), "start": window["start"], "end": window["end"]},
                ),
            )

    # The identity call is the authority on who Baton is; the config file's
    # userEmail is stale after a workspace merge. If /api/users has not listed
    # Baton itself, add it, because the graph needs the coworker on it.
    if me and not any(p.id == me.id for p in people):
        people.append(me)

    tasks = [_task(r) for r in (tasks_raw or [])]

    # Every task due date also comes back from /api/calendars/events as a
    # synthetic event flagged is_task, so a naive "is anything on that date"
    # check answers yes for every task and the detector finds nothing, ever.
    # A projection is the due date restated, not time anybody held, so it is
    # dropped here. is_task is the only reliable discriminator: some
    # projections carry a calendar_id too.
    real_events = [r for r in (events_raw or []) if not r.get("is_task")]
    projections = len(events_raw or []) - len(real_events)
    events = [_event(r) for r in real_events]
    events += _availability_events(avail_raw)
    if projections:
        log.info("dropped %d task projections from the calendar read", projections)

    ws = ws_raw if isinstance(ws_raw, dict) else {}
    slug = ws.get("slug") or "workspace"

    return Snapshot(
        at=now,
        workspace=f"{slug}.ambi.cc",
        workspace_name=ws.get("name") or slug,
        me=me,
        people=people,
        tasks=tasks,
        events=events,
        errors=errors,
    )
