---
title: "Paste into portal"
type: deliverable
status: active
tags: [type/deliverable, topic/judging]
last-reviewed: 2026-09-12
---

# Paste into the portal

Everything below is final copy. Nothing here needs editing.

## Title

Baton

## Tagline

Never drop the baton.

## Links

| Field | Value |
|---|---|
| Repo | https://github.com/faith-ogun/baton |
| Live dashboard | https://baton-hack-2026.web.app/app |
| Live API | https://baton-ng6xxpqrja-ew.a.run.app/api/state |
| Video | *paste the link* |

## Description (paste as-is)

Baton is an AI coworker that lives inside your team's Ambiguous workspace, holds the graph of who
owes whom what, and catches the work about to fall through the cracks.

Rachel Foster leads regulatory affairs at Aldermere Bio: seven people, one filing date. On Monday
morning Baton shows her the things about to drop, and the top one is an ask she never knew existed
because she was not on the thread. Five minutes and three approvals later, her team health has
moved.

It finds four failures with four detectors: the unanswered ask, the stalled task, the unbooked
deadline, and the single point of failure. Three of the four are pure graph and rules, so they
cannot go differently on a second run. Each one comes with a governed fix: reply in the existing
thread, add a second owner, book the hold. Nothing auto-sends. Every action is a draft until a
person approves it, the recipient is resolved server-side from the workspace directory rather than
trusted from the client, and an idempotency key means a retry can never double-send.

This cannot be a chatbox. A chatbot answers the question you thought to ask; every risk Baton
raises is one you did not, and three of the four are invisible from inside any single app. You
cannot see that an ask has gone unanswered for six days without reading mail and the calendar and
the task board at the same time, and holding the people graph across all three.

The integration goes as deep as the environment allows. Baton is provisioned as a workspace member
with its own identity and the team's permissions, subscribes to workspace webhooks (HMAC verified,
with a replay window), reads across mail, chat, tasks, calendar, CRM and sheets, acts back into
them as itself, and writes its audit log into a Sheet inside the workspace. That Sheet is the
persistence layer, and it rehydrates the on-screen trail on restart. The log lives where the
audited team can read it, not where only the operator can.

The model's job is small and stated: classify whether a message is an ask and to whom, link a
loosely named project, read a typed question, and phrase the sentence a human will approve. It
never decides whether to act, who is at risk, or how badly. A registry you can read decides that,
and moving a threshold re-scores the queue in front of you.

Stack: FastAPI and NetworkX, the OpenAI Agents SDK for the reading and the phrasing, React and
Vite with a live force-directed graph, deployed on Cloud Run and Firebase Hosting.

## Social post

Built Baton at @aitinkerers x @OpenAI Agents, Everywhere today.

It is a coworker that lives in your @AmbiguousAI workspace and catches the work about to fall
through the cracks: the ask nobody answered, the task that stalled, the deadline nobody booked, the
person who is the only one who can do it.

It proposes the fix. You approve it. It acts as itself and logs the row.

Nothing auto-sends. Never drop the baton.

https://github.com/faith-ogun/baton

## What we built during the event

All of it. The planning note (CLAUDE.md) and the brand mark predate the window; every line of the
backend, the detectors, the front end, the Ambiguous workspace, the deploy and the video were built
between 11:15 and 15:30.

## Related

- [[Submission text]] · [[Demo facts]] · [[MOC-deliverables]]
