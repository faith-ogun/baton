---
title: "Ask, grounded and read-only"
type: architecture
status: current
tags: [type/architecture, topic/governance, topic/graph]
last-reviewed: 2026-09-12
---

# Ask, grounded and read-only

## What it does

Answers plain-language questions about the team's workspace, from the graph. `/` opens it.
`web/src/app/answer.ts` is the engine, `web/src/app/Ask.tsx` the panel.

## Why it exists

Two prompts, a day apart. [[Spine]] ships GraphRAG question answering and it is a genuinely good
feature, so not having an equivalent was a real gap. And the requirement attached to it was the
important half: it should be grounded and read-only, and it should not divulge things it has no
business divulging. That is the [[Unravel and Badger lineage]] pattern again.

## The three properties, and why each is structural

None of these is a promise made in a prompt. Each is a property of how the thing is built, which is
the only kind of guarantee worth stating to a judge.

1. **Computed, not generated.** Every answer is derived from the `WorkspaceState` by lookups and
   arithmetic. That is what makes it possible to list the exact nodes behind each answer as chips,
   and clicking one lights it up in the graph, so the grounding is **checkable** rather than
   claimed. It also means the same question always returns the same answer, which a generated
   paragraph cannot promise.
2. **Read-only by construction.** There is no code path from `answer.ts` to the executor. So
   "it cannot act" is not a rule it follows; it is a thing it is unable to do. Asked to send a
   nudge it says so, and points at the Approve button as the only route to an action.
3. **It refuses outside its scope, and says why.** Three guards, each with a reason rather than a
   flat no:

| Asked | Answer |
|---|---|
| pay, performance, personnel | out of scope. Baton reads work items and hand-offs, and its permissions are the team's permissions, so it could not reach them if asked |
| another team, the whole company | names the boards the lead owns and says to switch, which is [[The scoping decision]] enforced rather than merely documented |
| anything the graph does not contain | says so, and lists what it can answer. It does not guess |

## What the model's job is here

Mapping a question onto one of the intents, and phrasing the result. The facts stay computed. The
suggestion list in the panel deliberately ends with **"Send Sally a nudge"** and **"What are
everyone's salaries?"**, both of which get turned down, so a first-time viewer sees the guardrails
work rather than being told about them.

## Verified

> [!success] All four paths, checked in the browser
> `Send Sally a nudge` returns the read-only refusal. `What are everyone's salaries?` returns the
> scope refusal. `Show me the clinical ops team` names CMC / quality and Clinical operations and
> says to switch. `What is the weather` returns the honest empty. `What is blocking the filing?`
> returns four blockers with four clickable citation chips and the basis
> `4 open edges of kind "blocks"`.

## Related

- [[The deterministic and LLM split]] · [[Spine]] · [[Governance and human-in-the-loop]] · [[MOC-architecture]]
