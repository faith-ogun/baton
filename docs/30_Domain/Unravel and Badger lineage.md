---
title: "Unravel and Badger lineage"
type: reference
status: current
tags: [type/reference, topic/governance]
last-reviewed: 2026-09-12
---

# Unravel and Badger lineage

Baton is the third project in a row built on the same pattern, and the pattern is the transferable
asset. Worth stating in the write-up, because "I have built this shape three times" is a stronger
credential than any single feature.

## The shared pattern

| Piece | Unravel | Badger | Baton |
|---|---|---|---|
| The thing nobody owns | a reclassified variant nobody re-reads | a denial nobody appeals | a hand-off nobody notices |
| The deterministic core | ACMG posterior, cited evidence ledger | funding-regime resolution, deadline clocks, citations | the rules registry, graph metrics, the cost model |
| What the model is for | adjudication and drafting | reading the letter, drafting the appeal | is this an ask, and drafting the nudge |
| Where it stops | draft FHIR, a clinician sends | drafts only, a prescriber signs | drafts only, the lead approves |
| The audit | hash-chained trail | tamper-evident, Ed25519-signed | rows in a Sheet inside the workspace |

## The one sentence version

**An agent that watches something nobody's job is to watch, reasons about it with rules rather than
vibes, and stops at a human who has the standing to act.**

## What carried over concretely

- the **brain/hands split**: the model reasons, deterministic tools do the auditable work
- **draft-only** as a design guarantee rather than a safety setting
- an **honest unknown**: Unravel withholds on low-confidence flips, Badger prepares both doors when
  the letter is ambiguous, and Baton's equivalent is the watch-level risk it surfaces but does not
  escalate
- a **facts note** separating verified, derived and unverified before anything reaches a judge. See
  [[Demo facts]]

## Related

- [[The deterministic and LLM split]] · [[Governance and human-in-the-loop]] · [[MOC-domain]]
