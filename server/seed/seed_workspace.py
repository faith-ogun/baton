#!/usr/bin/env python3
"""Seed the live Aldermere Bio Ambiguous workspace with the Baton demo scenario.

Idempotent: re-running will not duplicate the project, tasks, comments, calendar
events or the open-loop mail. Everything is created as the person who would really
have authored it, using that person's own API key, so the graph shows real
authorship rather than Baton talking to itself.

Create only. This script never deletes anything, and only ever modifies records it
seeded itself (adding the project link to a task it already created).

IMPORTANT, learned by probing the live API:

  * GET /api/tasks is scoped to the CALLER. A member sees a task only if they are
    its creator, its assignee or a subscriber. Baton is none of those, so Baton
    saw zero tasks. The fix is a project with visibility "workspace": every task
    attached to it becomes readable by every workspace member, Baton included.
    Without this the whole board is invisible to Baton's detectors.

  * GET /api/calendars/events returns VIRTUAL entries for task due dates, flagged
    "is_task": true with a nested "task" object. They are not real bookings. Any
    unbooked-deadline detector must filter is_task out, or every task will look
    as though it already has a calendar hold.

  * Calendar attendees must be passed as user UUIDs. The OpenAPI description says
    an email string is accepted, but in practice email entries are silently
    dropped and only the organiser is registered. Pass ids.

Usage:
    python3 server/seed/seed_workspace.py            # seed, then verify
    python3 server/seed/seed_workspace.py --verify   # verify only, create nothing
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://api.ambiguous.ai"
AMBI_DIR = Path(__file__).resolve().parents[2] / ".ambi"

# The story dates. Today is Saturday 12 September 2026; the filing deadline is
# 14 September. The workspace is Aldermere Bio (aldermere).
PROJECT_NAME = "Module 3 filing"
PROJECT_DESCRIPTION = (
    "Aldermere Bio Module 3 regulatory filing, due 14 September 2026."
)

# Rachel Foster is the team lead whose board this is, so she owns the project and
# files the work. Baton is never an assignee.
BOARD_OWNER = "Rachel Foster"


# ---------------------------------------------------------------------------
# credentials (never printed)
# ---------------------------------------------------------------------------

def load_credentials() -> tuple[str, dict]:
    cfg = json.loads((AMBI_DIR / "config.json").read_text())
    agents = json.loads((AMBI_DIR / "seed-agents.json").read_text())
    return cfg["authToken"], agents


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

class ApiError(RuntimeError):
    def __init__(self, status: int, body: str, method: str, path: str):
        self.status, self.body = status, body
        super().__init__(f"{method} {path} -> {status}: {body[:400]}")


def call(method: str, path: str, key: str, body=None, *, attempts: int = 4):
    """One API call, retrying on 429 (honouring Retry-After) and on 5xx."""
    payload = json.dumps(body).encode() if body is not None else None
    last: Exception | None = None
    for attempt in range(attempts):
        req = urllib.request.Request(BASE + path, data=payload, method=method)
        req.add_header("Authorization", f"Bearer {key}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=40) as resp:
                raw = resp.read().decode()
                return json.loads(raw) if raw.strip() else {}
        except urllib.error.HTTPError as exc:
            text = exc.read().decode()
            if exc.code == 429:
                wait = float(exc.headers.get("Retry-After") or (2 ** attempt))
                time.sleep(min(wait, 30))
                last = ApiError(exc.code, text, method, path)
                continue
            if 500 <= exc.code < 600 and attempt < attempts - 1:
                time.sleep(2 ** attempt)
                last = ApiError(exc.code, text, method, path)
                continue
            raise ApiError(exc.code, text, method, path) from None
        except urllib.error.URLError as exc:
            last = exc
            time.sleep(2 ** attempt)
    raise last if isinstance(last, Exception) else RuntimeError("request failed")


def unwrap(resp) -> list:
    """Ambiguous list endpoints wrap rows in {"data": [...]}."""
    if isinstance(resp, list):
        return resp
    if isinstance(resp, dict):
        for field in ("data", "tasks", "items", "events", "messages", "comments"):
            value = resp.get(field)
            if isinstance(value, list):
                return value
    return []


def paged(path: str, key: str) -> list:
    out, offset = [], 0
    joiner = "&" if "?" in path else "?"
    while True:
        resp = call("GET", f"{path}{joiner}limit=100&offset={offset}", key)
        rows = unwrap(resp)
        out.extend(rows)
        if not isinstance(resp, dict) or not resp.get("has_more") or not rows:
            return out
        offset += len(rows)
        if offset > 1000:
            return out


def all_tasks_everyone_can_see(admin: str, agents: dict) -> dict:
    """Union of every member's visible task list, keyed by id.

    GET /api/tasks is caller-scoped, so no single key is guaranteed to see the
    whole board. For idempotency checks we must look through every pair of eyes,
    otherwise a task created by someone else would be invisible and duplicated.
    """
    found: dict[str, dict] = {}
    for key in [admin] + [m["api_key"] for m in agents.values()]:
        try:
            for task in paged("/api/tasks", key):
                if task.get("id"):
                    found[task["id"]] = task
        except ApiError:
            continue
    return found


# ---------------------------------------------------------------------------
# read-shape helpers. The read shape differs from the write shape: on read a task
# carries both assignee_id (string) and assignee (nested object).
# ---------------------------------------------------------------------------

def task_assignee_id(task: dict):
    value = task.get("assignee_id")
    if value:
        return value
    nested = task.get("assignee")
    return nested.get("id") if isinstance(nested, dict) else None


def task_assignee_name(task: dict):
    nested = task.get("assignee")
    if isinstance(nested, dict):
        return nested.get("display_name")
    return None


# ---------------------------------------------------------------------------
# the scenario
# ---------------------------------------------------------------------------

TASKS = [
    # 1. Single point of failure: four high-priority items, all sole-owned by
    #    Priya, all landing on or before the 14 September filing.
    dict(title="Reconcile CMC batch records", assignee="Priya Raman",
         due_date="2026-09-14", priority="high", status="todo", author=BOARD_OWNER,
         description="Batch records for lots 24-A through 24-D need reconciling against "
                     "the Module 3 batch analysis before the filing goes out."),
    dict(title="Stability data tables", assignee="Priya Raman",
         due_date="2026-09-13", priority="high", status="todo", author=BOARD_OWNER,
         description="Final 24-month stability tables for Module 3, formatted for the dossier."),
    dict(title="Method validation appendix", assignee="Priya Raman",
         due_date="2026-09-14", priority="high", status="todo", author=BOARD_OWNER,
         description="Assemble the analytical method validation appendix, including the "
                     "assay transfer report."),
    dict(title="Impurity qualification memo", assignee="Priya Raman",
         due_date="2026-09-14", priority="high", status="todo", author=BOARD_OWNER,
         description="Qualification rationale for the two new degradants seen at 24 months."),

    # 2. The unbooked deadline: due 15 September with deliberately no real
    #    calendar booking. Note the virtual is_task entry the API projects for it.
    dict(title="Safety training deck", assignee="Sally Ahmed",
         due_date="2026-09-15", priority="medium", status="todo", author=BOARD_OWNER,
         description="Site safety training deck for the investigator meeting. The deadline "
                     "is firm and there is no time booked to build it."),

    # 4. Healthy contrast: real owners, comfortable dates, recent activity, moving.
    dict(title="Align SAP with Module 5", assignee="Tomas Lind",
         due_date="2026-09-21", priority="medium", status="in_progress", author=BOARD_OWNER,
         description="Reconcile the statistical analysis plan with the Module 5 clinical "
                     "summary so the endpoints read consistently.",
         comment=dict(
             author="Tomas Lind",
             content="Worked through sections 3 and 4 this morning. Endpoint definitions now "
                     "match the Module 5 summary; only the sensitivity analysis wording is "
                     "outstanding. On track for the 21st.")),
    dict(title="Draft cover letter", assignee="Rachel Foster",
         due_date="2026-09-16", priority="medium", status="in_progress", author=BOARD_OWNER,
         description="Cover letter for the filing, referencing the Module 3 and Module 5 "
                     "content and the agreed review timeline.",
         comment=dict(
             author="Rachel Foster",
             content="First draft is done and sitting with me for a read-through. Will "
                     "circulate it for comment once Module 3 sign-off lands.")),
]

# 2 (continued). Two events that ARE properly booked, on days other than
# 15 September, so an unbooked-deadline detector is finding a real gap rather than
# an empty calendar. Each covers a healthy task's due date.
EVENTS = [
    dict(title="Module 5 SAP alignment review",
         owner="Tomas Lind",
         start_at="2026-09-21T09:00:00Z", end_at="2026-09-21T10:00:00Z",
         attendees=["Tomas Lind", "Rachel Foster", "Frank Bouvier"],
         description="Walk the aligned statistical analysis plan against the Module 5 "
                     "clinical summary before it is locked."),
    dict(title="Filing cover letter review",
         owner="Rachel Foster",
         start_at="2026-09-16T13:00:00Z", end_at="2026-09-16T14:00:00Z",
         attendees=["Rachel Foster", "Frank Bouvier"],
         description="Read the cover letter together and agree the final wording for the "
                     "filing package."),
]

# 3. The open loop: Frank asks, four people receive it, nobody owns it, nobody replies.
MAIL = dict(
    author="Frank Bouvier",
    to=["Sally Ahmed"],
    cc=["Priya Raman", "Tomas Lind", "Rachel Foster"],
    subject="Module 3 sign-off needed before the 14 September filing",
    body_markdown=(
        "Hi Sally,\n\n"
        "We need your sign-off on Module 3 before the filing goes out on 14 September. "
        "The CMC sections are close to final and the stability tables are being reconciled "
        "now, so the only thing standing between us and the submission is clinical ops "
        "confirming that the Module 3 content lines up with what we have told the sites.\n\n"
        "Could you confirm sign-off, or tell me what is still outstanding? If anything needs "
        "changing I would rather know now than on the 13th.\n\n"
        "Priya, Tomas and Rachel are copied for visibility.\n\n"
        "Thanks,\n"
        "Frank"
    ),
    idempotency_key="baton-seed-module3-signoff-20260912",
)


# ---------------------------------------------------------------------------
# seeding
# ---------------------------------------------------------------------------

def ensure_project(admin: str, key_of: dict, report: dict) -> str | None:
    """A workspace-visible project, so every member (and Baton) can read the board."""
    for proj in paged("/api/projects", admin):
        if proj.get("name") == PROJECT_NAME:
            if proj.get("visibility") != "workspace":
                report["failed"].append(
                    f"project {PROJECT_NAME!r} exists but visibility is "
                    f"{proj.get('visibility')!r}, not 'workspace'; Baton may not see tasks")
            else:
                report["skipped"].append(f"project {PROJECT_NAME!r} already exists")
            return proj.get("id")

    try:
        call("POST", "/api/projects", key_of[BOARD_OWNER], {
            "name": PROJECT_NAME,
            "description": PROJECT_DESCRIPTION,
            "visibility": "workspace",
        })
    except ApiError as exc:
        report["failed"].append(f"create project {PROJECT_NAME!r}: {exc}")
        return None

    # The create response envelope is not documented reliably, so read it back.
    for proj in paged("/api/projects", admin):
        if proj.get("name") == PROJECT_NAME:
            report["created"].append(
                f"project {PROJECT_NAME!r} (visibility=workspace) owned by {BOARD_OWNER}")
            return proj.get("id")
    report["failed"].append(f"created project {PROJECT_NAME!r} but could not read it back")
    return None


def seed(admin: str, agents: dict) -> dict:
    email_of = {n: m["email"] for n, m in agents.items()}
    id_of = {n: m["id"] for n, m in agents.items()}
    key_of = {n: m["api_key"] for n, m in agents.items()}

    report = {"created": [], "skipped": [], "failed": []}

    project_id = ensure_project(admin, key_of, report)

    # --- tasks ---------------------------------------------------------------
    by_title = {t.get("title"): t
                for t in all_tasks_everyone_can_see(admin, agents).values()}

    for spec in TASKS:
        title = spec["title"]
        if title in by_title:
            report["skipped"].append(
                f"task {title!r} already exists ({by_title[title].get('id')})")
            continue
        body = {
            "title": title,
            "description": spec["description"],
            "status": spec["status"],
            "priority": spec["priority"],
            "assignee_id": id_of[spec["assignee"]],
            "due_date": spec["due_date"],
        }
        if project_id:
            body["project_id"] = project_id
        try:
            call("POST", "/api/tasks", key_of[spec["author"]], body)
            report["created"].append(
                f"task {title!r} -> {spec['assignee']}, due {spec['due_date']}, "
                f"{spec['priority']} priority, {spec['status']}")
        except ApiError as exc:
            report["failed"].append(f"task {title!r}: {exc}")

    # Re-read so ids are canonical rather than trusted from a create response.
    by_title = {t.get("title"): t
                for t in all_tasks_everyone_can_see(admin, agents).values()}

    # Backfill the project link on any task this script seeded earlier without it,
    # otherwise Baton cannot see it.
    if project_id:
        for spec in TASKS:
            task = by_title.get(spec["title"])
            if not task or task.get("project_id") == project_id:
                continue
            try:
                call("PATCH", f"/api/tasks/{task['id']}",
                     key_of[spec["author"]], {"project_id": project_id})
                report["created"].append(
                    f"linked task {spec['title']!r} to project {PROJECT_NAME!r}")
            except ApiError as exc:
                report["failed"].append(f"link {spec['title']!r} to project: {exc}")

    # --- comments ------------------------------------------------------------
    for spec in TASKS:
        comment = spec.get("comment")
        if not comment:
            continue
        title = spec["title"]
        task = by_title.get(title)
        if not task or not task.get("id"):
            report["failed"].append(
                f"comment on {title!r}: task not found on re-read, cannot comment")
            continue
        author_key = key_of[comment["author"]]
        try:
            have = unwrap(call("GET", f"/api/tasks/{task['id']}/comments", author_key))
        except ApiError as exc:
            report["failed"].append(f"read comments on {title!r}: {exc}")
            continue
        wanted = comment["content"].strip()
        if any((c.get("content") or c.get("body") or "").strip() == wanted for c in have):
            report["skipped"].append(f"comment on {title!r} already present")
            continue
        try:
            call("POST", f"/api/tasks/{task['id']}/comments",
                 author_key, {"content": comment["content"]})
            report["created"].append(f"comment on {title!r} by {comment['author']}")
        except ApiError as exc:
            report["failed"].append(f"comment on {title!r}: {exc}")

    # --- calendar events -----------------------------------------------------
    for spec in EVENTS:
        owner = spec["owner"]
        okey = key_of[owner]
        try:
            cals = unwrap(call("GET", "/api/calendars", okey))
        except ApiError as exc:
            report["failed"].append(f"list calendars for {owner}: {exc}")
            continue
        cal = next((c for c in cals if c.get("is_default")), cals[0] if cals else None)
        if not cal:
            report["failed"].append(f"no calendar for {owner}")
            continue

        day = spec["start_at"][:10]
        wanted_ids = [id_of[n] for n in spec["attendees"]]
        try:
            found = unwrap(call(
                "GET",
                f"/api/calendars/events?start={day}T00:00:00Z&end={day}T23:59:59Z"
                "&singleEvents=true", okey))
        except ApiError as exc:
            report["failed"].append(f"read events for {owner}: {exc}")
            continue
        # Ignore the virtual task projections when checking for a real booking.
        existing = next((e for e in found
                         if e.get("title") == spec["title"] and not e.get("is_task")), None)

        if existing:
            report["skipped"].append(f"event {spec['title']!r} already booked on {day}")
            event_id = existing.get("id")
        else:
            body = {
                "title": spec["title"],
                "start_at": spec["start_at"],
                "end_at": spec["end_at"],
                "description": spec["description"],
                "status": "confirmed",
                # Attendees MUST be user ids; email strings are silently dropped.
                "attendees": wanted_ids,
            }
            try:
                call("POST", f"/api/calendars/{cal['id']}/events", okey, body)
            except ApiError as exc:
                report["failed"].append(f"event {spec['title']!r}: {exc}")
                continue
            refound = unwrap(call(
                "GET",
                f"/api/calendars/events?start={day}T00:00:00Z&end={day}T23:59:59Z"
                "&singleEvents=true", okey))
            existing = next((e for e in refound
                             if e.get("title") == spec["title"] and not e.get("is_task")), None)
            event_id = existing.get("id") if existing else None
            report["created"].append(
                f"event {spec['title']!r} {spec['start_at']} on {owner}'s calendar")

        if not event_id:
            report["failed"].append(
                f"event {spec['title']!r}: created but could not read it back, "
                "attendees and RSVPs not set")
            continue

        # Self-heal the attendee list, then have each attendee accept, so the
        # booking is genuinely confirmed rather than merely proposed.
        current = {a.get("user_id") or a.get("id")
                   for a in (existing.get("attendees") or [])
                   if isinstance(a, dict)}
        if not set(wanted_ids).issubset(current):
            try:
                call("PATCH", f"/api/calendars/events/{event_id}", okey,
                     {"attendees": wanted_ids})
                report["created"].append(
                    f"attendees on {spec['title']!r}: {', '.join(spec['attendees'])}")
            except ApiError as exc:
                report["failed"].append(f"attendees on {spec['title']!r}: {exc}")

        for person in spec["attendees"]:
            try:
                call("POST", f"/api/calendars/events/{event_id}/rsvp",
                     key_of[person], {"rsvp": "accepted"})
            except ApiError as exc:
                report["failed"].append(
                    f"RSVP for {person} on {spec['title']!r}: {exc}")

    # --- the open-loop mail, sent as Frank ----------------------------------
    fkey = key_of[MAIL["author"]]
    try:
        sent = unwrap(call("GET", "/api/mail/sent?limit=50", fkey))
    except ApiError as exc:
        sent = []
        report["failed"].append(f"read {MAIL['author']}'s sent mail: {exc}")
    if any((m.get("subject") or "") == MAIL["subject"] for m in sent):
        report["skipped"].append(f"mail {MAIL['subject']!r} already sent by {MAIL['author']}")
    else:
        body = {
            "to": [email_of[n] for n in MAIL["to"]],
            "cc": [email_of[n] for n in MAIL["cc"]],
            "subject": MAIL["subject"],
            "body_markdown": MAIL["body_markdown"],
            "idempotency_key": MAIL["idempotency_key"],
        }
        try:
            call("POST", "/api/mail/send", fkey, body)
            report["created"].append(
                f"mail {MAIL['subject']!r} from {MAIL['author']} to 1 recipient, 3 cc")
        except ApiError as exc:
            report["failed"].append(f"mail {MAIL['subject']!r}: {exc}")

    return report


# ---------------------------------------------------------------------------
# verification: re-read the workspace and print what is actually there
# ---------------------------------------------------------------------------

def verify(admin: str, agents: dict) -> None:
    name_of = {m["id"]: n for n, m in agents.items()}
    for u in unwrap(call("GET", "/api/users", admin)):
        name_of[u["id"]] = u.get("display_name") or u.get("username") or u["id"]

    print("\n" + "=" * 80)
    print("PROJECTS (GET /api/projects as Baton)")
    print("=" * 80)
    for p in paged("/api/projects", admin):
        print(f"  {p.get('name')!r} visibility={p.get('visibility')} "
              f"tasks={p.get('task_count')} id={p.get('id')}")

    print("\n" + "=" * 80)
    print("TASKS (GET /api/tasks as BATON, the agent's own view)")
    print("=" * 80)
    baton_tasks = paged("/api/tasks", admin)
    if not baton_tasks:
        print("  (none visible to Baton)")
    for t in sorted(baton_tasks, key=lambda x: (x.get("due_date") or "9999", x.get("title") or "")):
        print(f"  {t.get('title'):<30} | {str(task_assignee_name(t)):<14} "
              f"| due {str(t.get('due_date')):<11} | {str(t.get('status')):<12} "
              f"| {str(t.get('priority')):<7} | upd {t.get('updated_at')} "
              f"| comments={t.get('comment_count')}")
    print(f"\n  Baton sees {len(baton_tasks)} task(s).")

    everyone = all_tasks_everyone_can_see(admin, agents)
    print(f"  Union across all 7 members: {len(everyone)} task(s) "
          f"(if this exceeds Baton's count, some work is invisible to the agent).")

    if baton_tasks:
        s = baton_tasks[0]
        print("\n  --- field names on a task as read back ---")
        print("  " + ", ".join(sorted(s.keys())))
        print("\n  --- the fields a detector needs ---")
        print(f"  assignee_id     = {s.get('assignee_id')!r}")
        print(f"  assignee        = {s.get('assignee')!r}")
        print(f"  due_date        = {s.get('due_date')!r}")
        print(f"  due_date_source = {s.get('due_date_source')!r}")
        print(f"  updated_at      = {s.get('updated_at')!r}")
        print(f"  created_at      = {s.get('created_at')!r}")
        print(f"  completed_at    = {s.get('completed_at')!r}")
        print(f"  first_response_at = {s.get('first_response_at')!r}")

    print("\n" + "=" * 80)
    print("COMMENTS")
    print("=" * 80)
    any_comment = False
    for t in baton_tasks:
        for c in unwrap(call("GET", f"/api/tasks/{t['id']}/comments", admin)):
            any_comment = True
            # On read a comment carries a nested "author" object.
            author = c.get("author") if isinstance(c.get("author"), dict) else {}
            who = author.get("display_name") or name_of.get(author.get("id"), "?")
            text = (c.get("content") or "").replace("\n", " ")
            print(f"  {t.get('title')!r}")
            print(f"     by {who} at {c.get('created_at')}: {text[:90]}")
    if not any_comment:
        print("  (none)")

    print("\n" + "=" * 80)
    print("CALENDAR: REAL BOOKINGS vs VIRTUAL TASK PROJECTIONS")
    print("=" * 80)
    real, virtual = {}, {}
    for name, meta in agents.items():
        rows = unwrap(call(
            "GET",
            "/api/calendars/events?start=2026-09-01T00:00:00Z&end=2026-10-01T00:00:00Z"
            "&singleEvents=true", meta["api_key"]))
        for e in rows:
            bucket = virtual if e.get("is_task") else real
            key = e.get("id")
            if key in bucket:
                bucket[key]["seen_by"].append(name)
            else:
                bucket[key] = {"e": e, "seen_by": [name]}

    print(f"\n  REAL calendar bookings ({len(real)}):")
    for row in sorted(real.values(), key=lambda r: r["e"].get("start_at") or ""):
        e = row["e"]
        atts = [a for a in (e.get("attendees") or []) if isinstance(a, dict)]
        print(f"    {e.get('title'):<30} | {e.get('start_at')} -> {e.get('end_at')}")
        print(f"      is_task={e.get('is_task')} status={e.get('status')} "
              f"| visible to {', '.join(row['seen_by'])}")
        for a in atts:
            print(f"        - {a.get('display_name')} rsvp={a.get('rsvp')} "
                  f"organiser={a.get('is_organizer')}")

    print(f"\n  VIRTUAL task-due projections ({len(virtual)}), NOT real bookings:")
    for row in sorted(virtual.values(), key=lambda r: r["e"].get("start_at") or ""):
        e = row["e"]
        print(f"    {e.get('title'):<30} | {str(e.get('start_at'))[:10]} "
              f"| is_task={e.get('is_task')} calendar_id={e.get('calendar_id')!r}")

    booked_days = {str(r["e"].get("start_at"))[:10] for r in real.values()}
    print(f"\n  Days with a real booking: {sorted(booked_days)}")
    print("  15 September (Safety training deck deadline) has a real booking: "
          f"{'2026-09-15' in booked_days}")

    print("\n" + "=" * 80)
    print("MAIL")
    print("=" * 80)

    def addrs(v):
        if not v:
            return []
        if isinstance(v, str):
            return [v]
        out = []
        for a in v:
            out.append(a.get("email") or a.get("address") or str(a)
                       if isinstance(a, dict) else a)
        return out

    fkey = agents[MAIL["author"]]["api_key"]
    sent = unwrap(call("GET", "/api/mail/sent?limit=20", fkey))
    print(f"  {MAIL['author']} GET /api/mail/sent -> {len(sent)} message(s)")
    for m in sent:
        full = call("GET", f"/api/mail/{m['id']}", fkey) if m.get("id") else {}
        det = full.get("data", full) if isinstance(full, dict) else {}
        src = det or m
        print(f"    subject : {src.get('subject')}")
        print(f"    from    : {src.get('from_email') or src.get('from') or src.get('sender')}")
        print(f"    to      : {', '.join(str(a) for a in addrs(src.get('to') or src.get('to_addresses')))}")
        print(f"    cc      : {', '.join(str(a) for a in addrs(src.get('cc') or src.get('cc_addresses')))}")
        print(f"    sent_at : {src.get('sent_at') or src.get('created_at')}")
        print(f"    thread  : {src.get('thread_id')}")

    for name in MAIL["to"] + MAIL["cc"]:
        rows = unwrap(call("GET", "/api/mail/inbox?limit=20", agents[name]["api_key"]))
        got = sum(1 for m in rows if (m.get("subject") or "") == MAIL["subject"])
        role = "to" if name in MAIL["to"] else "cc"
        print(f"  {name:<14} ({role}) inbox: {got} matching message(s)")

    replies = [m for m in sent if (m.get("subject") or "").lower().startswith("re:")]
    sally_sent = unwrap(call("GET", "/api/mail/sent?limit=20",
                             agents["Sally Ahmed"]["api_key"]))
    print(f"  replies in {MAIL['author']}'s sent: {len(replies)}")
    print(f"  Sally Ahmed has sent {len(sally_sent)} message(s) "
          f"-> the open loop stays open: {len(sally_sent) == 0}")


def main() -> int:
    admin, agents = load_credentials()

    if "--verify" not in sys.argv:
        report = seed(admin, agents)
        print("=" * 80)
        print("SEED RESULT")
        print("=" * 80)
        for label in ("created", "skipped", "failed"):
            rows = report[label]
            print(f"\n{label.upper()} ({len(rows)}):")
            for row in rows:
                print(f"  - {row}")
        if report["failed"]:
            print("\nSOME ITEMS FAILED, see above.")

    verify(admin, agents)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
