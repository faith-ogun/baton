"""
The detectors, and the scoring they are ranked by.

All of it is deterministic: thresholds come from `rules.yaml`, facts come from
the workspace, and every risk carries the rule that fired in `because` so the
number on screen is never a black box. No model decides anything here, and
nothing in this module acts.

`score` and `health` are ports of `scoreRisk` and `healthFrom` in
`web/src/app/api.ts`, constant for constant, so the backend reproduces the
numbers the dashboard already shows.
"""

from __future__ import annotations

import logging
import math
from datetime import date, datetime
from typing import Any

from graph import Metrics, days_until, deadline_node_id, elapsed
from ingest import Snapshot, Task

log = logging.getLogger("baton.risk")

# The queue is a reading surface, not a report. Past a dozen cards nobody reads
# the twelfth, and the worst are always on top because the list is sorted.
MAX_RISKS = 12


def _jsround(x: float) -> int:
    """JavaScript's Math.round: halves go up. Python's round() goes to even,
    which would disagree with the front end on exactly the .5 cases."""
    return math.floor(x + 0.5)


def score(r: dict[str, Any], rules: dict[str, Any]) -> int:
    """Port of `scoreRisk` in web/src/app/api.ts. Keep the two in step."""
    w = rules["severity_weights"]

    # How close the clock is, on a ten-day horizon, shared by every detector so
    # that "due in two days" means the same amount of trouble whatever kind of
    # trouble it is.
    due = r.get("dueInDays")
    prox = 0.0 if due is None else max(0.0, min(1.0, 1 - due / 10))
    prox_term = prox * 22 * (w["deadline_proximity"] * 2)

    kind = r["type"]
    # `ageDays` carries its count in the registry's time_unit, so the name is a
    # little wrong when the unit is minutes. The field name is fixed by the
    # wire contract, and `because` always states the unit it was read in.
    age = r.get("ageDays") or 0
    due_or_far = 99 if due is None else due

    if kind == "open_loop_ask":
        s = (
            46
            + max(0.0, age - rules["open_loop_ask"]["unanswered_business_days"]) * 3.2
            + (18 if due_or_far <= rules["open_loop_ask"]["escalate_if_deadline_within_days"] else 0)
            + age * w["thread_age"] * 0.4
            + (16 if r.get("unowned") else 0)
        )
    elif kind == "stalled_task":
        s = (
            38
            + max(0.0, age - rules["stalled_task"]["no_update_days"]) * 4
            + (18 if due_or_far <= rules["stalled_task"]["at_risk_if_due_within_days"] else 0)
        )
    elif kind == "unbooked_deadline":
        # The missing hold *is* the violation, so it carries most of the weight.
        s = 24 + (22 if rules["deadline"]["require_calendar_hold"] else 0)
    elif kind == "spof":
        # The graph facts behind this one, measured rather than assumed. The
        # front end hardcodes 4 and 0.96 because its workspace is seeded; those
        # same values are the fallback here so a risk missing its facts scores
        # the way the mock does rather than crashing.
        sole = r.get("soleCount", 4)
        betweenness = r.get("betweenness", 0.96)
        s = (
            56
            + max(0, sole - rules["spof"]["max_sole_critical_items"]) * 10
            + max(0.0, betweenness - rules["spof"]["betweenness_percentile"]) * 100
            + w["seniority"] * 30
        )
    else:
        s = 20.0

    return max(4, min(99, _jsround(s + prox_term)))


def health(risks: list[dict[str, Any]]) -> int:
    """Port of `healthFrom`: what is left once the open queue has taken its bite."""
    open_ = [r for r in risks if r.get("status") in ("open", "working")]
    if not open_:
        return 98
    worst = max(r["severity"] for r in open_)
    weight = sum(r["severity"] for r in open_)
    return max(8, _jsround(100 - worst * 0.35 - weight * 0.045))


def rescore(risks: list[dict[str, Any]], rules: dict[str, Any]) -> list[dict[str, Any]]:
    """Re-run the registry over risks already detected, then rank."""
    out = [dict(r, severity=score(r, rules)) for r in risks]
    out.sort(key=lambda r: -r["severity"])
    return out


# ---------------------------------------------------------------- helpers


def _unit_words(n: float, unit: str) -> str:
    """"7 minutes", "1 day". The unit is always spelled out, never implied."""
    whole = int(n)
    word = unit[:-1] if whole == 1 and unit.endswith("s") else unit
    return f"{whole} {word}"


def _day_label(day: date) -> str:
    return day.strftime("%-d %B")


def _days(n: int) -> str:
    """"today", "1 day", "3 days", "2 days overdue". Never "1 days"."""
    if n == 0:
        return "today"
    if n < 0:
        return f"{abs(n)} day{'' if abs(n) == 1 else 's'} overdue"
    return f"{n} day{'' if n == 1 else 's'}"


def _owner_name(snap: Snapshot, t: Task) -> str:
    if t.assignee_name:
        return t.assignee_name
    p = snap.person(t.assignee_id)
    return p.name if p else "Nobody"


def _cover_for(snap: Snapshot, metrics: Metrics, exclude: set[str], project_id: str | None = None) -> Any:
    """
    Who could actually pick this up: the least loaded person already on the project.

    Load alone picks whoever has nothing on the board, which is usually someone
    with no involvement in the work at all, and a hand-off to them is not a
    hand-off. So the pool is narrowed to people with at least one open item on
    the same project first, and only falls back to the whole team when nobody
    qualifies. Ties break on name so the proposal does not move between sweeps.
    """
    pool = [p for p in snap.teammates if p.id not in exclude]
    if not pool:
        return None
    if project_id:
        on_project = [
            p for p in pool if any(t.project_id == project_id for t in metrics.open_items.get(p.id, []))
        ]
        pool = on_project or pool
    return min(pool, key=lambda p: (len(metrics.open_items.get(p.id, [])), p.name))


# ---------------------------------------------------------------- detectors


def _spof(snap: Snapshot, m: Metrics, rules: dict[str, Any], now: datetime) -> list[dict[str, Any]]:
    """
    Single point of failure: one person holding critical work nobody else can pick up.

    Structural, so it fires the moment the data exists and needs no waiting.
    Two triggers, either is enough: too many sole-owned critical items, or a
    betweenness above the registry's percentile, which catches the person every
    hand-off routes through even when their own list looks short.
    """
    max_sole = int(rules["spof"]["max_sole_critical_items"])
    pct_gate = float(rules["spof"]["betweenness_percentile"])
    impact = rules.get("impact_model", {})
    out = []

    for p in snap.teammates:
        items = sorted(
            m.sole_items.get(p.id, []),
            key=lambda t: (t.due_on or date.max, t.title),
        )
        sole = len(items)
        pct = m.betweenness_pct.get(p.id, 0.0)
        raw = m.betweenness.get(p.id, 0.0)

        # A shape with nothing behind it is not a risk: somebody central who
        # holds no uncovered critical work has nothing to be a single point of
        # failure for, and a card claiming otherwise would be false on screen.
        if not items:
            continue

        by_count = sole > max_sole
        by_shape = raw > 0 and pct >= pct_gate
        if not (by_count or by_shape):
            continue

        node_ids = [m.node_of_person[p.id]] + [m.node_of_task[t.id] for t in items]
        soonest = next((t for t in items if t.due_on), None)
        due_in = days_until(soonest.due_on, now) if soonest else None
        # Deliberately not put on the payload as `dueInDays`: this risk is
        # structural, and the shared proximity term would let one near date
        # push a shape problem above every live fire in the queue. The date is
        # stated in `detail` instead, where it belongs as context.

        # The proposed hand-off: the nearest-dated item, to whoever on the same
        # project is carrying least. The structure is the rule's; only the
        # wording is written.
        move = soonest or (items[0] if items else None)
        cover = _cover_for(snap, m, exclude={p.id}, project_id=move.project_id if move else None)

        because = (
            f"spof · {sole} sole-owned critical item{'' if sole == 1 else 's'} "
            f"{'>' if by_count else '<='} {max_sole}, "
            f"betweenness {pct:.2f} {'>' if by_shape else '<='} {pct_gate:.2f}"
        )
        titles = ", ".join(t.title for t in items[:4]) or "no named items"
        action: dict[str, Any] = {
            "kind": "task_patch",
            "label": "Redistribute one task",
            "summary": (
                f"Reassign {move.title} to {cover.name}, who is carrying the least."
                if move and cover
                else "Add a second owner so the work is not on one person."
            ),
            "app": "Tasks",
            "patch": {
                "from": p.name,
                "to": cover.name if cover else "a second owner",
                "task": move.title if move else "one item",
            },
            "draft": (
                f"{cover.first}, moving {move.title} to you. {p.first} is sole owner of "
                f"{sole} critical item{'' if sole == 1 else 's'} and nobody else is subscribed to any of them, "
                f"so the whole line stops if {p.first} is out for a day. Shout if that does not work "
                f"and I will put it back. Baton"
                if move and cover
                else f"{p.first} is the only owner of {sole} critical items and nobody else is subscribed. "
                f"This needs a second pair of hands before it needs anything else. Baton"
            ),
        }
        if move:
            action["patch"]["task_id"] = move.id

        out.append(
            {
                "id": f"r:spof:{p.id[:8]}",
                "type": "spof",
                "severity": 0,
                "title": f"{p.first} is the only owner of {sole} critical item{'' if sole == 1 else 's'}.",
                "detail": (
                    f"{titles}. Nobody else is assigned or subscribed, so there is no cover: "
                    f"{p.first}'s betweenness across the workspace graph is in the "
                    f"{int(round(pct * 100))}th percentile, which means the hand-offs route through "
                    f"one person. A day out of the office stops all of it"
                    + (f", and the first of them is due in {_days(due_in)}." if due_in is not None else ".")
                ),
                "people": [p.name],
                "nodes": node_ids,
                "because": because,
                "soleCount": sole,
                "betweenness": round(pct, 2),
                "impact": {
                    "days": sole * int(impact.get("per_sole_item_days", 2)),
                    "basis": (
                        f"{sole} sole-owned item{'' if sole == 1 else 's'} at "
                        f"{impact.get('per_sole_item_days', 2)} days each while cover is found"
                    ),
                },
                "action": action,
                "status": "open",
            }
        )
    return out


def _unbooked_deadline(snap: Snapshot, m: Metrics, rules: dict[str, Any], now: datetime) -> list[dict[str, Any]]:
    """
    A date the work is promised for, with no time held anywhere for it.

    Deterministic cross-check of task due dates against the calendar, so it
    also fires immediately on fresh data. Proximity is read in real days, never
    in the registry's time unit: a due date can be set to any real date, so
    there is nothing to work around here.
    """
    cfg = rules["deadline"]
    if not cfg.get("require_calendar_hold", True):
        return []
    warn = int(cfg["warn_within_days"])
    impact = rules.get("impact_model", {})
    out = []

    for day, tasks in sorted(m.deadlines.items()):
        due_in = days_until(day, now)
        if due_in is None or due_in > warn:
            continue
        if day in m.held:
            continue

        owners = []
        for t in tasks:
            name = _owner_name(snap, t)
            if name != "Nobody" and name not in owners:
                owners.append(name)
        nodes = [deadline_node_id(day)] + [m.node_of_task[t.id] for t in tasks]
        nodes += [m.node_of_person[t.assignee_id] for t in tasks if t.assignee_id in m.node_of_person]
        titles = ", ".join(t.title for t in tasks[:3])

        when = "is overdue" if due_in < 0 else ("is today" if due_in == 0 else f"is in {due_in} day{'' if due_in == 1 else 's'}")
        out.append(
            {
                "id": f"r:deadline:{day.isoformat()}",
                "type": "unbooked_deadline",
                "severity": 0,
                "title": f"The {_day_label(day)} deadline {when} with nothing booked.",
                "detail": (
                    f"{len(tasks)} item{'' if len(tasks) == 1 else 's'} due that day ({titles}) and no "
                    f"calendar event anywhere in the workspace covers it. Nothing will remind the team "
                    f"it exists, which is how a date that everyone knows about still gets missed."
                ),
                "people": owners,
                "nodes": list(dict.fromkeys(nodes)),
                "dueInDays": due_in,
                "unowned": not owners,
                "because": (
                    f"deadline · require_calendar_hold true, no event covers {day.isoformat()}, "
                    f"and due in {_days(due_in)} <= {warn} days"
                ),
                "impact": {
                    "days": int(impact.get("rebook_days", 2)),
                    "basis": (
                        f"{impact.get('rebook_days', 2)} days: one to re-book at short notice, "
                        f"one the owner loses to the scramble"
                    ),
                },
                "action": {
                    "kind": "calendar",
                    "label": "Book the hold",
                    "summary": f"Create a 45-minute hold on {_day_label(day)} for the {len(tasks)} item(s) due.",
                    "app": "Calendar",
                    "patch": {
                        "when": f"{_day_label(day)} 14:00 - 14:45",
                        "title": titles or "Deadline hold",
                        "attendees": str(max(1, len(owners))),
                        "date": day.isoformat(),
                    },
                },
                "status": "open",
            }
        )
    return out


def _stalled_task(snap: Snapshot, m: Metrics, rules: dict[str, Any], now: datetime) -> list[dict[str, Any]]:
    """
    An open task nothing has happened to.

    The elapsed threshold is read in the registry's time_unit. See rules.yaml:
    POST /api/tasks cannot backdate a timestamp, so on freshly seeded data the
    same rule and the same arithmetic are run over minutes instead of days, and
    the unit is quoted in `because`. Nothing is faked.

    Staleness alone fires the detector; a near due date escalates the score
    rather than gating it, which is why a quiet task that is not due for a
    fortnight still shows up, low down the queue, as a watch rather than an alarm.
    """
    cfg = rules["stalled_task"]
    unit = rules.get("time_unit", "days")
    threshold = float(cfg["no_update_days"])
    at_risk = int(cfg["at_risk_if_due_within_days"])
    impact = rules.get("impact_model", {})
    out = []

    for t in snap.tasks:
        if not t.open:
            continue
        age = elapsed(t.updated_at, now, unit)
        if age <= threshold:
            continue

        due_in = days_until(t.due_on, now)
        owner = _owner_name(snap, t)
        unowned = not t.assignee_id
        sharing = [o for o in m.deadlines.get(t.due_on, []) if o.id != t.id] if t.due_on else []

        nodes = [m.node_of_task[t.id]]
        if t.assignee_id in m.node_of_person:
            nodes.append(m.node_of_person[t.assignee_id])
        if t.due_on:
            nodes.append(deadline_node_id(t.due_on))

        escalated = due_in is not None and due_in <= at_risk
        because = (
            f"stalled_task · no update {_unit_words(age, unit)} > {int(threshold)}, "
            + (
                f"and due in {_days(due_in)} <= {at_risk} days"
                if escalated
                else (f"but due in {_days(due_in)} so not escalated" if due_in is not None else "and no due date set")
            )
        )

        if unowned:
            cover = _cover_for(snap, m, exclude=set(), project_id=t.project_id)
            action: dict[str, Any] = {
                "kind": "task_patch",
                "label": "Assign an owner",
                "summary": f"Put {t.title} on {cover.name if cover else 'a named owner'} with a 24-hour checkpoint.",
                "app": "Tasks",
                "patch": {
                    "owner": cover.name if cover else "a named owner",
                    "task": t.title,
                    "task_id": t.id,
                },
                "draft": (
                    f"{cover.first if cover else 'Team'}, {t.title} has had no owner and no movement for "
                    f"{_unit_words(age, unit)}. I have put it on you rather than leaving it unowned, because "
                    f"unowned is how work disappears. Say so here if it should sit with someone else. Baton"
                ),
            }
        else:
            action = {
                "kind": "task_comment",
                "label": "Post the check-in",
                "summary": f"Comment on {t.title}, set a 24-hour checkpoint and add a second owner.",
                "app": "Tasks",
                "patch": {"task": t.title, "checkpoint": "in 24 hours", "task_id": t.id},
                "draft": (
                    f"Flagging this one: no movement for {_unit_words(age, unit)}"
                    + (f" and it is due {'today' if due_in == 0 else f'in {_days(due_in)}'}" if due_in is not None else "")
                    + f". {owner.split(' ')[0]}, if something is blocking it, say so here and I will clear what I can "
                    f"from my end. Checkpoint set for 24 hours. Baton"
                ),
            }

        out.append(
            {
                "id": f"r:stall:{t.id[:8]}",
                "type": "stalled_task",
                "severity": 0,
                "title": (
                    f"{t.title} has not moved in {_unit_words(age, unit)}"
                    + (
                        (f", and it is due {_days(due_in)}." if due_in <= 0 else f", and it is due in {_days(due_in)}.")
                        if escalated
                        else "."
                    )
                ),
                "detail": (
                    f"{'Nobody owns it' if unowned else f'{owner} is the sole assignee'}. "
                    f"No comment, status change or edit has landed on it since "
                    f"{t.updated_at.strftime('%d %b %H:%M') if t.updated_at else 'it was created'} UTC"
                    + (
                        f", and {len(sharing)} other item{'' if len(sharing) == 1 else 's'} share its date."
                        if sharing
                        else "."
                    )
                ),
                "people": [] if unowned else [owner],
                "nodes": list(dict.fromkeys(nodes)),
                "ageDays": int(age),
                "dueInDays": due_in,
                "unowned": unowned,
                "because": because,
                "impact": {
                    "days": int(impact.get("restart_days", 2))
                    + len(sharing) * int(impact.get("per_blocked_item_days", 2)),
                    "basis": (
                        f"{impact.get('restart_days', 2)} days to get it moving again"
                        + (
                            f", plus {impact.get('per_blocked_item_days', 2)} days each for the {len(sharing)} "
                            f"item{'' if len(sharing) == 1 else 's'} on the same date"
                            if sharing
                            else ", with nothing else waiting on that date"
                        )
                    ),
                },
                "action": action,
                "status": "open",
            }
        )
    return out


def detect(snap: Snapshot, m: Metrics, rules: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Run every detector, score against the registry, rank.

    Detector order is the order they were trusted in: the two structural ones
    fire on data that exists now, the stall needs a clock. `open_loop_ask` is
    not implemented; the contract and the front end both tolerate its absence.
    """
    now = snap.at
    risks: list[dict[str, Any]] = []
    for name, fn in (("spof", _spof), ("unbooked_deadline", _unbooked_deadline), ("stalled_task", _stalled_task)):
        try:
            risks.extend(fn(snap, m, rules, now))
        except Exception as exc:  # one bad detector must not empty the queue
            log.exception("detector %s failed: %s", name, exc)

    ranked = rescore(risks, rules)
    if len(ranked) > MAX_RISKS:
        log.info("trimming queue from %d to %d risks", len(ranked), MAX_RISKS)
    return ranked[:MAX_RISKS]
