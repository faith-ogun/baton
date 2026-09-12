"""
The workspace as a graph, and the structural facts only a graph can see.

People and work items are nodes; who owes whom what is the edges. The detector
that matters here is the single point of failure: it is a property of the shape
of the team, not of any one record, which is exactly why nobody inside their
own inbox can see it.

Node and edge shapes are the `GraphNode` and `GraphEdge` types in
`web/src/types.ts`. `risk` and `load` are both 0..1; the front end turns them
into colour and radius, so nothing here may exceed that range.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any

import networkx as nx

from ingest import Event, Person, Snapshot, Task

log = logging.getLogger("baton.graph")

# Baton's own node id is fixed rather than derived: the dashboard's Ask panel
# excludes `u:baton` by name when it lists the team, so the coworker has to
# keep that id.
BATON_NODE = "u:baton"


def person_node_id(p: Person, self_id: str) -> str:
    """
    Baton keeps the fixed id; everyone else is keyed by username.

    The test is identity, not `type`: the seeded team is provisioned as
    Ambiguous coworkers, so most of them report `type: agent` too, and keying
    off that would collapse the whole team onto one node.
    """
    if p.id and p.id == self_id:
        return BATON_NODE
    return f"u:{p.username or p.id[:8]}"


def task_node_id(t: Task) -> str:
    return f"t:{t.id}"


def deadline_node_id(day: date) -> str:
    return f"d:{day.isoformat()}"


def _clamp(x: float) -> float:
    return max(0.0, min(1.0, x))


def days_until(day: date | None, now: datetime) -> int | None:
    """Whole calendar days, so "due in 2 days" means what a person means by it."""
    if day is None:
        return None
    return (day - now.date()).days


def elapsed(since: datetime | None, now: datetime, unit: str) -> float:
    """Age of a timestamp in the registry's time unit. See rules.yaml on why."""
    if since is None:
        return 0.0
    seconds = max(0.0, (now - since).total_seconds())
    return seconds / 60.0 if unit == "minutes" else seconds / 86400.0


@dataclass
class Metrics:
    """The structural facts the detectors read, computed once per sweep."""

    betweenness: dict[str, float] = field(default_factory=dict)
    betweenness_pct: dict[str, float] = field(default_factory=dict)
    sole_items: dict[str, list[Task]] = field(default_factory=dict)
    open_items: dict[str, list[Task]] = field(default_factory=dict)
    deadlines: dict[date, list[Task]] = field(default_factory=dict)
    held: dict[date, Event] = field(default_factory=dict)
    node_of_person: dict[str, str] = field(default_factory=dict)
    node_of_task: dict[str, str] = field(default_factory=dict)


@dataclass
class GraphView:
    nodes: list[dict[str, Any]]
    edges: list[dict[str, Any]]
    metrics: Metrics


def _sole_owners(snap: Snapshot, tasks: list[Task]) -> dict[str, list[Task]]:
    """
    Critical open items that rest on one person only.

    An Ambiguous task has a single `assignee_id`, so assignment alone would
    make every task sole-owned and the signal would be meaningless. The real
    question is whether anyone else could pick it up, so a subscriber counts as
    cover, with three exceptions.

    The assignee and Baton are excluded for the obvious reasons. The creator is
    excluded because Ambiguous auto-subscribes whoever filed the task, and the
    person who filed it is not cover for doing it: without this, one person
    seeding a board would make every item on it look covered. Where a workspace
    carries no subscribers at all this degrades to plain assignment, which is
    the honest floor.
    """
    baton_id = snap.self_id
    out: dict[str, list[Task]] = {}
    for t in tasks:
        if not (t.open and t.critical and t.assignee_id):
            continue
        cover = [s for s in t.subscriber_ids if s not in {t.assignee_id, baton_id, t.creator_id}]
        if cover:
            continue
        out.setdefault(t.assignee_id, []).append(t)
    return out


def _percentiles(values: dict[str, float]) -> dict[str, float]:
    """
    Fraction of the team strictly below each person.

    A team of two has no meaningful distribution, and an all-zero betweenness
    would otherwise put someone in the 100th percentile of nothing, so both
    cases return zero and the sole-owner count carries the detector alone.
    """
    ids = list(values)
    if len(ids) < 3 or not any(values.values()):
        return {i: 0.0 for i in ids}
    out = {}
    for i in ids:
        below = sum(1 for j in ids if values[j] < values[i])
        out[i] = below / (len(ids) - 1)
    return out


def build(snap: Snapshot, rules: dict[str, Any]) -> GraphView:
    """One pass over the snapshot: NetworkX for the structure, dicts for the wire."""
    now = snap.at
    unit = rules.get("time_unit", "days")
    stall_threshold = float(rules["stalled_task"]["no_update_days"]) or 1.0
    warn_within = int(rules["deadline"]["warn_within_days"])
    max_sole = int(rules["spof"]["max_sole_critical_items"])

    m = Metrics()
    m.node_of_person = {p.id: person_node_id(p, snap.self_id) for p in snap.people}
    m.node_of_task = {t.id: task_node_id(t) for t in snap.tasks}
    m.sole_items = _sole_owners(snap, snap.tasks)
    for t in snap.tasks:
        if t.open and t.assignee_id:
            m.open_items.setdefault(t.assignee_id, []).append(t)
    for t in snap.tasks:
        if t.open and t.due_on:
            m.deadlines.setdefault(t.due_on, []).append(t)
    for day in m.deadlines:
        hold = next((e for e in snap.events if e.covers(day)), None)
        if hold:
            m.held[day] = hold

    g = nx.Graph()

    # ------------------------------------------------------------ nodes
    nodes: list[dict[str, Any]] = []
    max_open = max((len(v) for v in m.open_items.values()), default=0)

    task_risk: dict[str, float] = {}
    for t in snap.tasks:
        if not t.open:
            task_risk[t.id] = 0.04
            continue
        age = elapsed(t.updated_at, now, unit)
        stale = _clamp(age / stall_threshold)
        due_in = days_until(t.due_on, now)
        prox = 0.0 if due_in is None else _clamp(1 - due_in / 10)
        task_risk[t.id] = _clamp(0.55 * stale + 0.45 * prox)

    for p in snap.people:
        nid = m.node_of_person[p.id]
        mine = m.open_items.get(p.id, [])
        sole = len(m.sole_items.get(p.id, []))
        is_baton = p.id == snap.self_id
        load = 0.5 if is_baton else _clamp(0.3 + 0.7 * (len(mine) / max_open if max_open else 0.0))
        risk = 0.0 if is_baton else _clamp(max((task_risk[t.id] for t in mine), default=0.0) * 0.9)
        nodes.append(
            {
                "id": nid,
                "kind": "person",
                "label": p.name,
                "risk": round(risk, 3),
                "load": round(load, 3),
                "sole": sole > max_sole,
                # The API exposes no job title, so the honest filler is a
                # phrase that reads as one wherever the UI drops it in.
                "meta": "AI coworker" if is_baton else "on the team",
            }
        )
        g.add_node(nid, kind="person")

    for t in snap.tasks:
        nid = m.node_of_task[t.id]
        due_in = days_until(t.due_on, now)
        age = elapsed(t.updated_at, now, unit)
        who = t.assignee_name or (snap.person(t.assignee_id).name if snap.person(t.assignee_id) else "Unassigned")
        bits = [who.split(" ")[0] if who else "Unassigned"]
        if not t.open:
            bits.append(t.status)
        else:
            bits.append(f"no update {int(age)} {unit[:-1] if int(age) == 1 else unit}")
            if due_in is not None:
                bits.append("overdue" if due_in < 0 else f"due in {due_in}d")
        nodes.append(
            {
                "id": nid,
                "kind": "task",
                "label": t.title,
                "risk": round(task_risk[t.id], 3),
                "load": round(_clamp(0.3 + (0.25 if t.critical else 0.0) + (0.2 if (due_in or 99) <= 3 else 0.0)), 3),
                "meta": " · ".join(bits),
            }
        )
        g.add_node(nid, kind="task")

    for day, blocked in sorted(m.deadlines.items()):
        nid = deadline_node_id(day)
        due_in = days_until(day, now) or 0
        held = day in m.held
        risk = _clamp(0.35 + 0.5 * _clamp(1 - due_in / 10) - (0.25 if held else 0.0))
        nodes.append(
            {
                "id": nid,
                "kind": "deadline",
                "label": day.strftime("%-d %b deadline"),
                "risk": round(risk, 3),
                "load": round(_clamp(0.5 + 0.4 * _clamp(1 - due_in / 10)), 3),
                "meta": ("overdue" if due_in < 0 else f"in {due_in}d")
                + (" · held" if held else " · no hold")
                + f" · {len(blocked)} item{'' if len(blocked) == 1 else 's'}",
            }
        )
        g.add_node(nid, kind="deadline")

    # ------------------------------------------------------------ edges
    edges: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()

    def add_edge(source: str, target: str, kind: str, open_: bool = False) -> None:
        key = (source, target, kind)
        if source == target or key in seen or not g.has_node(source) or not g.has_node(target):
            return
        seen.add(key)
        edge: dict[str, Any] = {"source": source, "target": target, "kind": kind}
        if open_:
            edge["open"] = True
        edges.append(edge)
        g.add_edge(source, target)

    for t in snap.tasks:
        owner = m.node_of_person.get(t.assignee_id or "")
        if owner:
            add_edge(owner, task_node_id(t), "assigned")
        if t.open and t.due_on:
            # A task and its date are the same commitment seen twice, so the
            # task blocks the date and the edge runs hot while it is unmet.
            add_edge(task_node_id(t), deadline_node_id(t.due_on), "blocks", open_=True)

    # Baton is joined to the dates it is watching. Without an edge the coworker
    # drifts off as an isolated node in a force layout, which reads as broken
    # rather than as idle.
    for day in m.deadlines:
        add_edge(BATON_NODE, deadline_node_id(day), "participates")

    # ------------------------------------------------------------ centrality
    try:
        raw = nx.betweenness_centrality(g) if g.number_of_nodes() > 2 else {}
    except Exception as exc:  # never let a metric take the sweep down
        log.warning("betweenness failed: %s", exc)
        raw = {}
    m.betweenness = {p.id: float(raw.get(m.node_of_person[p.id], 0.0)) for p in snap.teammates}
    m.betweenness_pct = _percentiles(m.betweenness)

    return GraphView(nodes=nodes, edges=edges, metrics=m)


def apply_risks(nodes: list[dict[str, Any]], risks: list[dict[str, Any]]) -> None:
    """
    Let the scored risks colour the nodes they name, in place.

    A node is at least as hot as the worst risk that names it, so a red card in
    the queue always has a red node behind it and the two halves of the screen
    can never disagree.
    """
    worst: dict[str, float] = {}
    for r in risks:
        if r.get("status") not in (None, "open", "working"):
            continue
        level = float(r.get("severity", 0)) / 100.0
        for nid in r.get("nodes", []):
            worst[nid] = max(worst.get(nid, 0.0), level)
    for n in nodes:
        if n["id"] in worst:
            n["risk"] = round(max(float(n["risk"]), worst[n["id"]]), 3)
