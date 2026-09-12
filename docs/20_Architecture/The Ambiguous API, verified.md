---
title: "The Ambiguous API, verified"
type: architecture
status: current
tags: [type/architecture, topic/ambiguous]
last-reviewed: 2026-09-12
---

# The Ambiguous API, verified

Read off the live OpenAPI spec (`https://app.ambiguous.ai/api/openapi.json`, 939 paths) and
confirmed against the running workspace with our own agent token. **Where this disagrees with the
cheat-sheet in the root `CLAUDE.md`, this note is right**: that cheat-sheet was written from guesses
and four of its paths do not exist.

## Corrections to the cheat-sheet

| CLAUDE.md says | Actually |
|---|---|
| `GET /api/mail` | **does not exist.** Use `GET /api/mail/inbox`, `/api/mail/sent`, `/api/mail/search`, and `GET /api/mail/{id}` for one message |
| `POST /api/mail` to send | **`POST /api/mail/send`** |
| `GET /api/calendar` | **`GET /api/calendars/events`** |
| `GET /api/chat` | **`GET /api/channels`**, then `GET /api/channels/{channel_id}/messages` |

`GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `POST /api/tasks/:id/comments` and
`GET /api/crm/contacts` are all as described.

## Reads, with the query parameters that matter

`GET /api/tasks` takes a genuinely useful filter set, including exactly what the detectors need:

```
assignee_id · status · task_status_id · priority · project_id
due_date_start · due_date_end · has_due_date
updated_min          <- the incremental sweep hangs off this
q · sort · cursor · limit · offset · fields
```

> [!info] `updated_min` is for the sweep, not the stall
> It returns tasks updated **after** a cutoff, so it is how the 45-second sweep asks "what changed
> since last time" cheaply. A stall is the inverse (nothing happened), so the stalled-task detector
> still has to hold open tasks in state and compare `updatedAt` itself. There is no server-side
> query for absence, which is the whole reason a sweep exists at all.

`GET /api/calendars/events` takes `start`, `end`, `calendar_id`, `singleEvents`, `updatedMin`,
`timeZone`, `orderBy`. `singleEvents` matters: without it a recurring event comes back as one
record and the deadline cross-check would miss the instance that actually matters.

## Webhooks

```
GET    /api/webhooks/event-types      150 types, including a "*" wildcard
GET    /api/webhooks                  list
POST   /api/webhooks                  { url, name, events[], description }
GET    /api/webhooks/{id}/deliveries  the delivery log
POST   /api/webhooks/{id}/test        send a test ping to the URL
POST   /api/webhooks/{id}/rotate-secret
POST   /api/webhooks/{id}/revoke-previous-secret
```

> [!warning] The signing secret is shown once
> `POST /api/webhooks` returns the HMAC signing `secret` with **one-time visibility**. Every
> subsequent read omits it. Capture it into the backend's environment at creation time; if it is
> lost the only route back is `rotate-secret`.

### The subscription set for Baton

Chosen against the four detectors rather than subscribing to `*`, which would be 150 event types of
noise and would make the delivery log useless for debugging.

| Detector | Events |
|---|---|
| `open_loop_ask` | `email.received` · `email.sent` · `message.received` · `thread.reply` · `mention` |
| `stalled_task` | `task.created` · `task.updated` · `task.assigned` · `task.completed` · `comment.created` |
| `unbooked_deadline` | `event.created` · `event.updated` · `event.deleted` (plus due dates, which arrive on `task.updated`) |
| `spof` | none of its own. It is derived from the task events above, because it is a property of the graph rather than of an event |

`email.sent` is in there for a reason that is easy to miss: the open-loop detector needs to know when
the person who was asked **replies**, and a reply is a sent message. Subscribing only to
`email.received` would leave every resolved ask sitting in the queue for ever.

### `POST /api/webhooks/{id}/test` is the demo safety net

It fires a test ping at our own endpoint on demand. That is a real, first-party way to exercise the
live path on camera without depending on mail delivery timing, alongside the hand-triggered
`Inbound event` button already in the dashboard. Worth knowing before recording.

## Workspace and identity

```
GET  /api/users/me       identity, role, can_provision_coworkers
GET  /api/users          workspace members, i.e. the people in the graph
GET  /api/workspace      name + slug of the active workspace
GET  /api/workspaces     every workspace the CALLER can see
```

> [!warning] An agent token sees only its own workspace
> `GET /api/workspaces` returned exactly one row for our agent, and **not** the workspace owned by
> Faith's personal account. That asymmetry is what made the two-workspace situation confusing. See
> [[The Ambiguous workspace setup]].

## Acting, on approval only

```
POST  /api/mail/send                  the nudge. Idempotency-Key header
POST  /api/channels/{id}/messages     the chat one-liner
PATCH /api/tasks/{id}                 reassign, status, due date
POST  /api/tasks/{id}/comments        the check-in
POST  /api/tasks                      create and assign
POST  /api/calendars/events           the hold
GET,POST /api/sheets                  the audit log
```

## Related

- [[System architecture]] · [[The Ambiguous workspace setup]] · [[The risk engine and registry]] · [[MOC-architecture]]
