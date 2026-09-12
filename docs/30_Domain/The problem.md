---
title: "The problem"
type: reference
status: current
tags: [type/reference, topic/cost-model]
last-reviewed: 2026-09-12
---

# The problem

## In one paragraph

Work does not usually fail because someone cannot do it. It fails at the **hand-off**: an ask nobody
answered, a task that stopped moving while still looking fine on the board, a date everyone agreed
and nobody booked, and one person quietly holding four critical things at once. None of these is
visible from inside a single app, and none of them has an owner whose job it is to notice.

## Why nobody notices

Each of the four is invisible for a *different structural reason*, which is why they need four
detectors rather than one.

| Failure | Why a person misses it |
|---|---|
| the open loop | a request sent to five people is addressed to no one. Everybody assumes somebody else has it |
| the stall | the card still says "in progress". It is the **absence** of updates that is the signal, and an absence is exactly what a human does not notice |
| the unbooked deadline | nothing in the workspace will ever surface it, because the only system that reminds you of dates is the calendar and it is not in there |
| the single point of failure | it is a property of the **shape** of the graph, not of any record. There is no document you could open that contains it |

## Why now

Two things have to be true for Baton to exist, and both only recently are:

1. **The work lives in one addressable environment.** A workspace with an API across mail, chat,
   tasks, calendar and CRM means the graph is constructible. Five disconnected SaaS tools with five
   OAuth flows is a different, much worse product.
2. **An agent can be a member rather than a tool.** Baton needs its own identity to send a nudge
   that does not read as coming from your manager. That is a property of the environment, not of the
   model.

## Related

- [[The cost model]] · [[Spine]] · [[MOC-domain]]
