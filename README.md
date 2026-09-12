# Baton

**Never drop the baton.**

The AI coworker that catches the work about to fall through the cracks, and hands it off
before it does. Baton lives inside your team's Ambiguous workspace, maps the whole graph of
who owes whom what, spots the stalled ask, the overloaded person, the unbooked deadline and
the single point of failure, then rescues each one with a governed, one-click hand-off across
your apps. Nothing auto-sends; every action is human-approved and logged.

Its value cannot exist in a chatbox: it only works because it sees and acts across Mail, Chat,
Tasks, Calendar and CRM at once.

Built for the "Agents, Everywhere: Bots, Channels & More" global hackathon
(AI Tinkerers x OpenAI), 12 September 2026. Target: Best Use of Ambiguous AI.

## Where it lives

Baton the *coworker* lives inside the Ambiguous workspace: it is provisioned as a member with
its own identity and inbox, it subscribes to the workspace webhooks, and it reads and writes
across Mail, Chat, Tasks, Calendar, CRM and Sheets. The workspace is the environment, not a
data source.

Baton the *screen* is this repo: a dashboard of our own, because a workspace cannot render a
live force-directed graph of itself. Two surfaces, one brand:

- `/` the site. Light, editorial, cream and navy, straight off the logo board.
- `/app` mission control. Dark, dense, the live graph, the drop-risk queue and the audit trail.

## Run it

```bash
cd web
npm install
npm run dev          # http://localhost:5173
```

The dashboard boots on a **seeded workspace** (a regulatory team pushing a Moderna submission,
with an unanswered ask, a stalled critical task, a sole owner carrying four of them and an
unbooked deadline) so the front end never blocks on the backend. It probes `GET /api/state`
and opens `WS /live` on start; when the FastAPI server is up it switches over and the header
chip changes from `seeded workspace` to `webhooks live`. The wire contract both sides implement
is [`web/src/types.ts`](web/src/types.ts).

`Inbound event` in the header replays the webhook path by hand, so the live-event moment in the
demo does not depend on mail delivery timing.

## The rules registry

Detection and severity are deterministic and the thresholds are one readable file. The drawer
behind the `Rules` button is that registry, live: move `no_update_days` from 5 to 2 and the
stalled-task risks re-score from 83 and 44 to 95 and 56 in front of you. The model is used for
exactly three things, all of them language: is this message an ask and to whom, does "the
Moderna thing" mean this project, and the wording of the nudge a human will read. It never
decides whether to act.

## Stack

Vite + React 19 + Tailwind 4 + `react-force-graph-2d` + d3-force (frontend) · FastAPI +
NetworkX + OpenAI Agents SDK (backend) · Ambiguous AI (workspace: MCP / CLI / REST + webhooks) ·
Google Cloud Run (deploy).

Vite rather than Next here: the dashboard is a single client-rendered canvas app with a
WebSocket, so server rendering buys it nothing and costs a `ssr: false` dance around the force
graph.

See `CLAUDE.md` for the full build spec.
