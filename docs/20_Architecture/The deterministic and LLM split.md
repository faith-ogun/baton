---
title: "The deterministic and LLM split"
type: architecture
status: current
tags: [type/architecture, topic/risk-engine, topic/governance]
last-reviewed: 2026-09-12
---

# The deterministic and LLM split

## What it does

Draws a hard line between what rules decide and what a model is allowed to touch. This is the
credibility moat and it should be stated explicitly in the write-up, because it is what separates
Baton from a wrapper.

## The split

**Deterministic, rules and the graph:**

- every detection and every severity score
- who is involved, what is late, and by how much
- which structural action is proposed
- the ranking of the queue
- the audit trail
- the cost model

**The model, OpenAI Agents SDK, three jobs only:**

1. is this message an ask, and to whom
2. which project a message belongs to, when it is named loosely (fuzzy entity linking)
3. the wording of the nudge a human will read

## Why

Three reasons, in order of how much they matter to a judge:

1. **Reproducibility.** The same workspace produces the same queue in the same order every time. A
   scoring pass that runs through a model cannot promise that, and a risk register that reshuffles
   itself is not a risk register.
2. **Inspectability.** Every score traces to a threshold in one readable file. Each card in the UI
   quotes the rule that fired: `open_loop_ask · unanswered 6 business days > 3, and deadline within
   2 days < 2`. There is no second, hidden set of thresholds inside a prompt.
3. **The model cannot be wrong about anything that matters.** The worst a bad generation can do is
   write an awkward sentence that a human then edits. It cannot mis-score, mis-rank, or act.

## The rule that is never broken

> The model never decides **whether** to act, and never fires an action. Humans approve; rules
> decide structure.

This mirrors the clinical-agent pattern from [[Unravel and Badger lineage]]: the agent reasons, the
deterministic tools do the auditable work.

## Related

- [[The risk engine and registry]] · [[System architecture]] · [[Governance and human-in-the-loop]] · [[MOC-architecture]]
