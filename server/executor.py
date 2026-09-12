"""Act in the workspace, once a human has approved.

This module is the only place in Baton that writes to another person's world,
so the rules are narrow on purpose:

  * It is never called by a detector, a sweep, a webhook or the Ask panel. The
    single caller is the approve route, which a person triggers. There is no
    autonomous path to here, and that is a property of the call graph rather
    than a setting.
  * Every send carries an `Idempotency-Key` derived from the risk id, so a
    retry after a timeout cannot produce a second message. This matters more
    than it looks: the failure we must never have is nudging somebody twice.
  * The recipient is resolved server-side from the workspace directory, never
    taken from the client. A client that could name the recipient would be a
    way to make Baton mail anyone.

British English, no em dashes.
"""

from __future__ import annotations

import json
import os
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx

BASE = os.environ.get("AMBI_BASE", "https://api.ambiguous.ai")
CONFIG = Path(__file__).resolve().parent.parent / ".ambi" / "config.json"


def _token() -> str:
    """Baton's own key. Env var wins, so a deployment need not ship the file."""
    if env := os.environ.get("AMBI_TOKEN"):
        return env
    return json.loads(CONFIG.read_text())["authToken"]


def _headers(idempotency: str | None = None) -> dict[str, str]:
    h = {
        "Authorization": f"Bearer {_token()}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "baton-executor",
    }
    if idempotency:
        h["Idempotency-Key"] = idempotency
    return h


@dataclass
class Executed:
    """What actually happened, as opposed to what was proposed."""

    verb: str
    detail: str
    app: str
    href: str | None = None


class ExecutionError(RuntimeError):
    """Raised when the workspace refused the action. Never swallowed."""


async def _directory(client: httpx.AsyncClient) -> dict[str, dict[str, Any]]:
    """Workspace members by display name, so recipients resolve server-side."""
    r = await client.get(f"{BASE}/api/users", headers=_headers())
    r.raise_for_status()
    rows = r.json().get("data", [])
    return {u.get("display_name", ""): u for u in rows}


async def _calendar_id(client: httpx.AsyncClient) -> str:
    """The calendar to book on.

    There is no `POST /api/calendars/events`: an event is always created inside
    a named calendar, `POST /api/calendars/{calendar_id}/events`. An agent token
    only ever sees its own calendar from `GET /api/calendars`, which is the
    honest shape of the permission anyway, so Baton books the hold on Baton's
    calendar and invites the owner as an attendee. That is also the better
    behaviour: the hold arrives as an invitation the person can decline, not as
    a write into their private calendar.
    """
    r = await client.get(f"{BASE}/api/calendars", headers=_headers())
    r.raise_for_status()
    rows = r.json().get("data", [])
    if not rows:
        raise ExecutionError("Refusing to book: this token can see no calendar to write to.")
    return rows[0]["id"]


def _window(patch: dict[str, Any]) -> tuple[str, str]:
    """Turn the card's human time into the pair of instants the API wants.

    The risk card carries `date` ("2026-09-15") and `when` ("15 September
    14:00 - 14:45"); it does not carry machine timestamps, so the clock is read
    back out of the label rather than assumed. Doing it this way means the time
    printed on the card and the time actually booked cannot drift apart, which
    is the failure a viewer would spot instantly.

    Times are sent as UTC. The API stores and returns Z-suffixed instants, so a
    naive local reading would land the hold an hour or two off the card.
    """
    date = (patch or {}).get("date")
    if not date:
        raise ExecutionError("Refusing to book: the risk carries no date to book against.")
    try:
        day = datetime.fromisoformat(date).replace(tzinfo=timezone.utc)
    except ValueError as exc:
        raise ExecutionError(f"Refusing to book: unreadable date {date!r} ({exc}).") from exc

    label = str((patch or {}).get("when") or "")
    clock = re.findall(r"(\d{1,2}):(\d{2})", label)
    if len(clock) >= 2:
        start = day.replace(hour=int(clock[0][0]), minute=int(clock[0][1]))
        end = day.replace(hour=int(clock[1][0]), minute=int(clock[1][1]))
    else:
        # A card with no readable clock still deserves a hold rather than an
        # error, so fall back to the 45 minutes the detector proposes.
        start = day.replace(hour=14, minute=0)
        end = start + timedelta(minutes=45)
    if end <= start:
        end = start + timedelta(minutes=45)

    fmt = "%Y-%m-%dT%H:%M:%S.000Z"
    return start.strftime(fmt), end.strftime(fmt)


async def execute(risk: dict[str, Any], state: dict[str, Any] | None = None) -> Executed:
    """Perform the one action this risk proposed. Raises on refusal.

    `risk` is a Risk from the wire contract. The action's `kind` decides the
    call; nothing else about the action is trusted, and in particular the
    recipient is looked up rather than read from the payload.
    """
    action = risk.get("action") or {}
    kind = action.get("kind")
    # One key per risk, so the same approval retried is the same request.
    key = f"baton-{risk.get('id', uuid.uuid4())}"

    async with httpx.AsyncClient(timeout=20.0) as client:
        people = await _directory(client)

        if kind == "mail":
            # The card names a person; we resolve their address ourselves.
            target_name = next((p for p in risk.get("people", []) if p in people), None)
            if not target_name:
                raise ExecutionError(
                    "Refusing to send: the named recipient is not a member of this workspace."
                )
            to = people[target_name].get("primary_email") or people[target_name].get(
                "workspace_email"
            )
            if not to:
                raise ExecutionError(f"Refusing to send: no address on file for {target_name}.")

            r = await client.post(
                f"{BASE}/api/mail/send",
                headers=_headers(key),
                json={
                    "to": [to],
                    "subject": f"Re: {risk.get('project') or 'your workspace'}",
                    # The field is body_text, not body. A "body" key 400s, which
                    # is worth a comment because the OpenAPI name is not obvious.
                    "body_text": action.get("draft") or action.get("summary") or "",
                    # Belt and braces: the header AND the body field, since the
                    # API accepts an idempotency_key in the payload too.
                    "idempotency_key": key,
                },
            )
            if r.status_code >= 400:
                raise ExecutionError(f"Mail refused ({r.status_code}): {r.text[:200]}")
            return Executed("Sent the nudge", f"Mailed {target_name}. {action.get('summary','')}", "Mail")

        if kind in {"task_comment", "task_patch"}:
            task_id = (action.get("patch") or {}).get("task_id") or risk.get("task_id")
            if not task_id:
                # Resolve by title rather than guessing. The name to match on is
                # the patch's own `task` field, not the risk title: a risk is
                # titled after the pattern it found ("Priya is the only owner of
                # 4 critical items"), so matching against that never hits, and
                # the fallback would only ever raise.
                wanted = (action.get("patch") or {}).get("task") or ""
                if not wanted:
                    raise ExecutionError("Refusing to act: the risk names no task to act on.")
                r = await client.get(f"{BASE}/api/tasks", headers=_headers(), params={"limit": 100})
                r.raise_for_status()
                match = next(
                    (
                        t
                        for t in r.json().get("data", [])
                        if (t.get("title") or "").strip().lower() == wanted.strip().lower()
                    ),
                    None,
                )
                if not match:
                    raise ExecutionError(
                        f"Refusing to act: no task in this workspace is titled {wanted!r}."
                    )
                task_id = match["id"]

            if kind == "task_comment":
                r = await client.post(
                    f"{BASE}/api/tasks/{task_id}/comments",
                    headers=_headers(key),
                    # The field is `content`, not `body`. `body` is the mail
                    # spelling and it is the one that trips you up, because a
                    # comment posted with the wrong key 400s rather than
                    # quietly posting an empty note.
                    json={"content": action.get("draft") or action.get("summary") or ""},
                )
                if r.status_code >= 400:
                    raise ExecutionError(f"Comment refused ({r.status_code}): {r.text[:200]}")
                return Executed("Posted the check-in", action.get("summary", ""), "Tasks")

            patch = action.get("patch") or {}
            new_assignee = patch.get("to")
            body: dict[str, Any] = {}
            if new_assignee and new_assignee in people:
                body["assignee_id"] = people[new_assignee]["id"]
            if not body:
                raise ExecutionError("Refusing to patch: nothing concrete to change.")
            r = await client.patch(
                f"{BASE}/api/tasks/{task_id}", headers=_headers(key), json=body
            )
            if r.status_code >= 400:
                raise ExecutionError(f"Task patch refused ({r.status_code}): {r.text[:200]}")
            return Executed("Reassigned the task", action.get("summary", ""), "Tasks")

        if kind == "calendar":
            patch = action.get("patch") or {}
            start_at, end_at = _window(patch)
            calendar_id = await _calendar_id(client)
            # Attendees must be user UUIDs. An email string is accepted by the
            # schema but a name is not, and anything unresolvable is dropped
            # silently, so the hold would look booked with nobody on it. The
            # names come from the risk and are resolved through the directory.
            attendees = [people[p]["id"] for p in risk.get("people", []) if p in people]
            r = await client.post(
                f"{BASE}/api/calendars/{calendar_id}/events",
                headers=_headers(key),
                json={
                    "title": patch.get("title") or f"{risk.get('project')} hold",
                    # start_at / end_at, not start / end.
                    "start_at": start_at,
                    "end_at": end_at,
                    # attendees, not attendee_ids.
                    "attendees": attendees,
                    "description": action.get("summary") or "",
                },
            )
            if r.status_code >= 400:
                raise ExecutionError(f"Calendar refused ({r.status_code}): {r.text[:200]}")
            booked = r.json() if r.content else {}
            who = ", ".join(p for p in risk.get("people", []) if p in people)
            detail = action.get("summary", "")
            if who:
                detail = f"{detail} Invited {who}.".strip()
            return Executed(
                "Booked the hold",
                detail,
                "Calendar",
                href=f"/calendar/{booked.get('id')}" if booked.get("id") else None,
            )

        if kind == "chat":
            raise ExecutionError("Chat actions are not wired yet; approve a mail or task risk.")

        raise ExecutionError(f"Unknown action kind: {kind!r}")


def audit_entry(risk: dict[str, Any], done: Executed) -> dict[str, Any]:
    """Shape the AuditEntry the front end expects."""
    return {
        "id": f"a:{uuid.uuid4().hex[:10]}",
        "at": datetime.now(timezone.utc).isoformat(),
        "verb": done.verb,
        "detail": done.detail,
        "app": done.app,
        "riskId": risk.get("id"),
        "href": done.href,
    }
