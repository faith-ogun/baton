---
title: "System architecture"
type: architecture
status: current
tags: [type/architecture, topic/ambiguous]
last-reviewed: 2026-09-12
---

# System architecture

## What it does

Baton is provisioned as a **member** of an Ambiguous workspace. It subscribes to the workspace
webhooks, reads across every app, scores risk deterministically, proposes a fix, waits for a human,
then writes back into the workspace under its own identity and logs what it did.

## The shape

```
Ambiguous workspace (Mail, Chat, Tasks, Calendar, CRM, Sheets)
      |  webhooks (task.assigned, email.received, document.shared)  +  REST reads
      v
FastAPI backend (Python)
  - ingest:    pull state via REST/CLI, receive and verify webhooks
  - graph:     NetworkX graph of people <-> work items <-> threads
  - risk:      deterministic rules registry -> scored drop risks
  - reason:    OpenAI Agents SDK, ONLY for "is this an ask" and drafting text
  - executor:  on human approval, act via the Ambiguous API + append the audit Sheet
  - realtime:  WebSocket push to the front end
      |
      v
Vite + React 19 front end
  - the live force graph, the drop-risk queue, one-click approve, the audit trail
```

## Why Vite and not Next

The spec said Next.js. It is Vite because the dashboard is a single client-rendered canvas app with
a WebSocket: server rendering buys it nothing, and it costs an `ssr: false` dance around
`react-force-graph-2d`, which is the one component that must not break. The marketing site is in the
same app, which also means one set of design tokens rather than two.

## The two surfaces

| Route | What it is | Theme |
|---|---|---|
| `/` | the marketing site. Light, editorial, cream and navy, straight off the logo board | light only |
| `/app` | mission control. The live graph, the queue, the audit strip, the registry drawer | light and dark, defaults to light |

## The wire contract

`web/src/types.ts` is the single contract. `GET /api/state` returns a `WorkspaceState`; `WS /live`
pushes `LiveEvent`s that patch it. The seeded workspace in `web/src/app/mock.ts` implements exactly
that shape, so the real backend drops in without touching a component.

`VITE_API_BASE` gates the network entirely. Unset, the app makes no request at all, which is why a
dev server with no backend prints nothing. This replaced a Vite proxy that spewed `ECONNREFUSED` on
every page load and buried real errors.

## Failure handling worth showing

- HMAC verification and a timestamp replay check on every webhook
- `Idempotency-Key` on mail sends, so a retry can never double-send
- `Retry-After` honoured on 429
- a 45-second sweep as a fallback, because a **stall has no event**: nothing happening is the whole
  problem, so an event-only design would never fire

## Related

- [[The graph layer]] · [[The risk engine and registry]] · [[The deterministic and LLM split]] · [[MOC-architecture]]
