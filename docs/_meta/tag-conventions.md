---
title: "Tag conventions"
type: reference
status: current
tags: [type/reference, topic/vault-structure]
last-reviewed: 2026-09-12
---

# Tag conventions

Folders answer *where does this live*. Links answer *what does this mean*. Tags answer *what kind of
thing is this*, and nothing else. Keep them to three namespaces and the vault stays searchable.

## `type/`

Mirrors the `type` field in frontmatter. One per note.

`type/decision` · `type/architecture` · `type/competitor` · `type/deliverable` · `type/reference`
· `type/log` · `type/person` · `type/moc`

## `status/`

Mirrors the `status` field. One per note.

`status/current` (live and being used) · `status/active` (in progress) · `status/done`
· `status/superseded` (replaced, kept for the reasoning) · `status/archived`

A superseded note keeps its content and links **forward** to whatever replaced it. Do not delete
it. The reasoning behind a reversed decision is the most valuable thing in a vault.

## `topic/`

The subject. As many as genuinely apply, usually one to three.

Established so far, reuse before inventing:

`topic/graph` · `topic/risk-engine` · `topic/rules-registry` · `topic/frontend` · `topic/governance`
· `topic/ambiguous` · `topic/scope` · `topic/cost-model` · `topic/branding` · `topic/demo`
· `topic/judging` · `topic/vault-structure`

Rules:

- lowercase, hyphenated: `topic/risk-engine`, not `topic/RiskEngine`
- **reuse before inventing.** Two tags meaning the same thing is worse than one imperfect tag
- name the subject, not the sprint. `topic/graph` outlives `topic/block-3`

## What not to tag

- Do not tag the folder. `20_Architecture/` already says that.
- Do not tag a one-off. If a tag will only ever have one note, it is a link, not a tag.
- Do not build hierarchies deeper than one level. `topic/frontend/graph/labels` is a folder wearing
  a costume.

## Related

- [[VAULT]] · [[MOC]] · [[callout-conventions]]
