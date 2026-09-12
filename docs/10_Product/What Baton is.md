---
title: "What Baton is"
type: reference
status: current
tags: [type/reference, topic/scope]
last-reviewed: 2026-09-12
---

# What Baton is

**Baton is an AI coworker that lives inside your team's Ambiguous workspace, watches the whole graph
of who owes whom what, and catches the work about to fall through the cracks, then hands it off
before it does, with every action human-approved and logged.**

Submission one-liner: *"A coworker that makes sure nothing gets dropped. Baton maps your team's real
workflow, spots the stalled ask, the overloaded person, the unbooked deadline and the single point
of failure, then rescues each one with a governed, one-click hand-off across your apps."*

Slogan: **Never drop the baton.**

It is **not a chatbot**. Its value is intrinsically cross-app and cannot exist in a standalone chat
window: it only works because it sees and acts across Mail, Chat, Tasks, Calendar, CRM and Sheets at
once. See [[Why this cannot be a chatbox]].

## The four detectors

Each one is a rule in an inspectable registry, not a judgement from a model.

| Detector | What it looks for | The proposed fix |
|---|---|---|
| `open_loop_ask` | a request directed at a named person, no reply from that person, past the threshold | draft a nudge in the existing thread, to that person alone |
| `stalled_task` | not done, no update in N days, due soon or overdue | comment, set a checkpoint, add a second owner |
| `unbooked_deadline` | a commitment with no calendar hold against it | create the hold everyone can make |
| `spof` | one person sole-owning more than K critical items, high betweenness | propose redistributing one item |

Three of the four are **purely deterministic**. Only the open loop needs a model, and only to answer
"is this message an ask, and to whom". See [[The deterministic and LLM split]].

## Who it is for

One workstream and its lead. Not a whole company. See [[The scoping decision]].

## The demo scenario

The regulatory affairs team at **Aldermere Bio**, eight people, pushing the **Sentrix filing**. Both
names are invented; see [[Demo facts]].

## Related

- [[The scoping decision]] · [[Why this cannot be a chatbox]] · [[The deterministic and LLM split]] · [[MOC-product]]
