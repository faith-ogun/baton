---
title: "Scope guards"
type: decision
status: current
tags: [type/decision, topic/demo]
last-reviewed: 2026-09-12
---

# Scope guards

## The decision

A list of things deliberately **not** built, kept so that "we did not have time" and "we decided
not to" stay distinguishable.

## Not built, on purpose

| Not built | Why |
|---|---|
| Auth, login, multi-workspace, onboarding, settings pages | None of it is scored, all of it is a day. One dashboard. |
| A database | The audit Sheet inside the workspace **is** the persistence, which also deepens the integration. |
| A bulletproof ask detector across a whole inbox | Solid on the planted demo cases; structured task and calendar signals are the reliable backbone. Over-claiming here is the fastest way to fail live. |
| An autonomous mode | Not a missing feature. Its absence is the governance claim. Nothing auto-sends, and there is no setting that changes that. |
| A dark theme for the marketing site | The site is an editorial page and light only. The **dashboard** is themed both ways. See [[The theme decision]]. |

## Stretch, not core

- **Cloud Run deploy.** The demo runs locally for reliability. A working local demo plus a public
  repo satisfies submission.
- **CopilotKit Slack mirror.** Only if the core loop is recorded. Ambiguous is the environment that
  wins the category; diluting it would be a mistake.

## What this constrains

If the build falls behind, cut in this order: the rules drawer, the SPOF detector, Cloud Run. Never
cut: the live graph, the approve-to-act loop, the audit trail.

## Related

- [[What Baton is]] · [[Demo facts]] · [[MOC-product]]
