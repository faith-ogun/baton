---
title: "Spine"
type: competitor
status: current
tags: [type/competitor, topic/graph]
last-reviewed: 2026-09-12
---

# Spine

**What it is:** an AI organisational-intelligence platform. Builds a graph from a company's email
and reports on the org's health.
**Where:** https://github.com/kvrancic/spine · https://spine-hackathon.vercel.app/

## What it does well

It is genuinely adjacent and genuinely good, and the overlap should be acknowledged rather than
talked around.

- a **force-directed communication graph** of who talks to whom, with sentiment
- **dead-man-switch scoring** to identify who the organisation cannot afford to lose
- **Louvain community detection**, the real org structure against the official chart
- an **org health score**, 0 to 100, with sub-scores
- GraphRAG question answering over the graph, and generated diagnostic reports
- runs on the Enron corpus, 520k emails and 150 employees, which is a smart choice of the only large
  public corporate email dataset

The stack overlaps heavily: NetworkX, FastAPI, `react-force-graph-2d`, Tailwind. Its framing line is
sharp too: companies pay consultancies six figures for an org assessment that takes months and is
stale on delivery.

## Where it stops

Spine is **diagnostic**. It reads a corpus, computes metrics, and produces an assessment: a score, a
report, a recommendation. The output is *knowledge about the organisation*.

Three boundaries follow from that:

1. **It reads one signal, retrospectively.** Email, in bulk, after the fact. There is no live event,
   no calendar, no task state, so it cannot know that an unanswered ask has a deadline in two days.
2. **It does not act.** Nothing is written back anywhere. A report telling you that Priya is a
   dead-man switch still leaves someone to work out which of her four tasks to move, draft the
   message, and send it.
3. **Its unit is the org.** That is the right unit for a diagnostic and the wrong one for an
   intervention, for the reasons in [[The scoping decision]].

## What this means for Baton

> Spine tells you your organisation is unhealthy. Baton fixes the specific thing that is about to
> drop, this morning, with one click and an audit row.

The differentiators to say out loud:

- **Live, not retrospective.** Webhooks in about a tenth of a second, plus a 45-second sweep because
  a stall has no event.
- **Multi-app, not single-signal.** Three of the four detectors are impossible on email alone. The
  open loop needs mail **and** the calendar to know it is urgent.
- **It acts, under its own identity, and logs it.** Detection is half the product; the hand-off is
  the other half and is where the name comes from.
- **Scoped where the standing to fix things is**, not where the most data is.

One honest overlap to handle rather than hide: our SPOF detector and their dead-man switch are the
same idea, and theirs is arguably the better-known name for it. The difference is not the metric, it
is that Baton then **proposes the redistribution and executes it on approval**.

> [!info] Useful framing borrowed, not copied
> Their "you pay six figures for a stale assessment" line is a good shape for a problem statement.
> Baton's equivalent is a live number rather than a report: £43.2k currently on this board.

## Related

- [[The scoping decision]] · [[Why this cannot be a chatbox]] · [[The graph layer]] · [[MOC-domain]]
