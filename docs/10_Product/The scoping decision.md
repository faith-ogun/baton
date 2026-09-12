---
title: "The scoping decision"
type: decision
status: current
tags: [type/decision, topic/scope]
last-reviewed: 2026-09-12
---

# The scoping decision

## The decision

Baton is scoped to **one workstream and answers to that workstream's lead**. A director who owns
several teams gets a switcher across their boards. Nobody gets a single merged view of a whole
company.

## Why

The argument is structural, not a product preference, and it is worth stating exactly because it is
the answer to the first question any judge asks.

Baton's output is always a message or a change **with a person's name on it**. So whoever approves
it needs the *standing to send it*. A chief executive cannot approve "Sally, this is the last
working day this can move" to somebody three levels down they have never worked with; it lands as a
summons, not a nudge, and the approval is worse than useless because it damages the thing it was
trying to fix.

The person who can send that sentence is the person accountable for the date. That is the lead.

Two supporting reasons:

1. **The detectors are team-scale.** "Frank asked Sally", "Priya owns four of five critical
   tasks". These are legible at five to thirty people and meaningless at nine hundred.
2. **The graph has to be readable.** A force-directed graph of a whole company is a hairball. The
   centrepiece of the product stops working at exactly the scale the board-level pitch wants.

## What was rejected, and why

| Option | Why it lost |
|---|---|
| **Board-level overview**, one view of the whole org | The obvious pitch for "we see the whole graph", and wrong on all three counts above. Kept on the site as a diagram **with a cross through it**, because showing the rejected option is a stronger argument than not mentioning it. |
| **Individual contributor view**, "my dropped things" | Collapses to a to-do list. The single point of failure and the open loop are only visible from above one person, so the whole moat disappears. |
| **Per-company deployment with per-team filters** | Same hairball, plus permissions work nobody has time for. The switcher gives a director what they need without merging anything. |

## What this constrains

- The header carries a **scope selector** naming the org, the team, the headcount and the lead, so
  the scope is visible rather than implied (`web/src/app/Dashboard.tsx`).
- The seeded workspace is **eight people**, not eighty.
- The site has a whole section making this argument (`web/src/landing/Who.tsx`), because otherwise
  the first question in the Q&A eats the answer.
- Baton is provisioned as a workspace **member**, so its permissions are the team's permissions and
  it structurally cannot reach further than the team can.

## Related

- [[What Baton is]] · [[Spine]] · [[The user journey]] · [[MOC-product]]
