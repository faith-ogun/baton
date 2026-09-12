---
title: "Governance and human-in-the-loop"
type: architecture
status: current
tags: [type/architecture, topic/governance]
last-reviewed: 2026-09-12
---

# Governance and human-in-the-loop

## What it does

Guarantees that nothing Baton does reaches another person without a human approving it, and that
everything it did is recoverable afterwards.

## The four guarantees

1. **Nothing auto-sends.** Every intervention is a draft until a person approves it. There is no
   mode, flag or setting that changes this. Its absence is the feature.
2. **Recipients are confirmed server-side.** The approval names the exact address. An
   `Idempotency-Key` on the send means a retry can never double-send.
3. **Baton acts as Baton.** Its own workspace identity, its own permissions. No message ever appears
   to come from the person who approved it, which is what makes a nudge socially usable: from a
   manager it is a reprimand, from the system it is a reminder.
4. **Everything is logged twice.** A row in the dashboard's audit strip, and a row in an audit Sheet
   **inside the workspace**. That Sheet is also where Baton reads its own history, so it never
   chases the same thing twice, and it is the persistence layer, so there is no database.

## Why the audit lives in the workspace

Two reasons, and the second is the better one.

- It is the deepest possible integration with the environment, which is the category being judged.
- It puts the record where the **team** can see it, not where only the operator can. An audit trail
  the audited party cannot read is not accountability.

## Related

- [[The deterministic and LLM split]] · [[What Baton is]] · [[MOC-architecture]]
