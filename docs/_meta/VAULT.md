---
title: "Vault guide"
type: reference
status: current
tags: [type/reference, topic/vault-structure]
last-reviewed: 2026-09-12
---

# Vault guide

The operating manual for the Baton vault, written for the human. The agent-facing version of the
same rules is in `CLAUDE.md` at the vault root. If you change one, change both.

## What this vault is for

This is the second brain for **Baton**, Faith Ogundimu's entry to the "Agents, Everywhere" global
hackathon (AI Tinkerers x OpenAI, 12 September 2026). Baton is an AI coworker that lives inside a
team's Ambiguous workspace, holds the whole graph of who owes whom what, and catches the work about
to fall through the cracks, then hands it off before it does, with every action human-approved and
logged.

The vault holds the durable decisions (what Baton is, who it is for, how it is built, why it wins)
and the timestamped record of the build, so a fresh agent session can pick the project up from the
notes rather than from anyone's memory. Success is: nothing that mattered in the first hour gets
lost, and every claim in the submission traces back to the note behind it.

## The reframe

This is not a system to build. It is a system to **wire together and instrument**. The pieces
already exist: there are files, there is an agent, there is a hackathon on a deadline. What was
missing was a place for the durable facts and the timestamped record to live, and a written
convention so an agent can find its way around without being told twice.

The build cost is near zero on purpose. If it starts costing real time, something has gone wrong.

## The five harness pieces

| Piece | What it is | Where it lives |
|---|---|---|
| Procedural memory | how the agent should behave | `CLAUDE.md`, this file, `99_Templates/` |
| Tools | what the agent can actually do | the agent's file access, plus any connectors added |
| A loop with a stop | multi-step work that ends with a human | the one loop below |
| Semantic memory | durable facts | `10_` to `50_`, and `people/` |
| Episodic memory | what happened and when | `90_Log/`, and `00_Inbox/` before it is filed |

## The rooms

| Folder | What goes in it |
|---|---|
| `00_Inbox/` | anything unsorted. cleared regularly, never permanent |
| `10_Product/` | what Baton is and why it wins: identity, scope, naming, the wow |
| `20_Architecture/` | how it is built: the graph, the registry, the split, the front end |
| `30_Domain/` | the problem and the field: dropped work, competitors, the cost model |
| `40_Deliverables/` | anything with an audience: README, submission text, demo script, facts |
| `50_Hackathon/` | the event itself: rules, timings, judging criteria |
| `90_Log/` | one note per build iteration. append-only |
| `99_Templates/` | the shape of each note type |
| `_meta/` | how the vault works, and the Maps of Content |
| `people/` | one note per human |

## The naming rule

Real, human titles. Never a date alone, never a code alone. Obsidian rewrites every link when you
rename, so a decent title today costs nothing and can be improved forever.

## The one loop

Instrument **one** loop properly before adding a second. For a hackathon build it is the
decision-capture loop:

1. a decision gets made in the middle of building, usually out loud
2. the agent writes it into the right room as a note, with the reasoning and the rejected options
3. the current log note in `90_Log/` records that it happened
4. **the agent links it** to the notes it constrains and anything it supersedes
5. Faith approves, or sends it back

Step 4 is the one that compounds. Step 5 is not optional.

The reason this is the loop worth instrumenting on a four-hour build: decisions made under time
pressure are exactly the ones nobody remembers the reasoning for, and the submission has to explain
every one of them.

## The weekly review, or in a hackathon, the pre-submission review

Three questions, fifteen minutes:

1. Does every claim in the submission trace to a note?
2. Is anything in the demo asserted rather than shown?
3. What broke, and is it written down?

Then: `00_Inbox/` to zero, and check nothing in `40_Deliverables/` contradicts
[[Demo facts]].

## Guardrails

> [!warning] Your moat is the work, not the workflow
> This vault makes the build legible and the submission honest. It is not the thing being judged.
> If it starts competing with the build for attention, the vault loses.

> [!warning] The facts note is load-bearing
> [[Demo facts]] is the single place that says what is invented, what is derived and what is not
> verified. Nothing in `40_Deliverables/` may contradict it, and any number that reaches a judge
> has to appear there first.

## Related

- [[MOC]] · [[tag-conventions]] · [[callout-conventions]]
