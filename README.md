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

The dashboard boots on a **seeded workspace**: the regulatory affairs team at Aldermere Bio,
eight people, pushing the Sentrix filing, with an unanswered ask, a stalled critical task, a
sole owner carrying four of them and an unbooked deadline. Aldermere Bio and Sentrix are
invented; the scenario is not. See [`docs/demo-facts.md`](docs/demo-facts.md) for what is
invented, what is derived and what still needs verifying.

Set `VITE_API_BASE` to talk to the backend (see `web/.env.example`). Left unset, the app makes
no network call at all, which is why a dev server with no backend prints nothing. With it set,
the app probes `GET /api/state`, opens `WS /live`, and the header chip flips from
`seeded workspace` to `webhooks live`. The wire contract both sides implement is
[`web/src/types.ts`](web/src/types.ts).

`Inbound event` in the header replays the webhook path by hand, so the live-event moment in the
demo does not depend on mail delivery timing. `Tour` walks a first-time viewer through the six
things on the screen.

## Who it is for

One workstream and its lead, not a whole company. Baton's output is always a message or a
change with somebody's name on it, so whoever approves it needs the standing to send it: a
chief executive cannot approve "Sally, this is the last working day this can move" to someone
three levels down. A director who owns several teams gets a switcher across their boards, not a
merged view. The scope selector in the header makes that visible rather than implied.

## What it is worth

Each risk declares the person-days it costs if it lands, with the basis in words, and the money
is those days times the blended rate in `rules.cost_model`. The seeded board totals 82
person-days, £43.2k. The site's calculator runs the same model on the reader's own numbers.
Deliberately not a borrowed market statistic: a sum somebody dialled in themselves is one they
already believe.

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
graph. The site is light only; the dashboard is themed light and dark and defaults to light.

One deployment note: `/app` is a client route, so any static host needs a rewrite of unknown
paths to `index.html`. The Vite dev server and `vite preview` already do this.

See `CLAUDE.md` for the full build spec.
