# CLAUDE.md - Baton

> Drop this in the repo root as `CLAUDE.md` at 11:15. It is the single source of truth for
> the build. Read it fully before writing code. Go fast, protect the wow, ship the video.

You are helping Faith Ogundimu build **Baton** at the "Agents, Everywhere" global hackathon
(AI Tinkerers x OpenAI, Sat 12 Sep 2026, one build window 11:15-15:30 CEST, submit by 15:30).
Solo build. The single target is **Best Use of Ambiguous AI (prize: NVIDIA DGX Spark)**, while
also competing for 1st overall. Everything below is optimised for the judging rubric.

Conventions: British English. **No em dashes anywhere** (use commas, semicolons or a plain
hyphen). Keep commits small. Do NOT create the repo or write feature code before the 11:15
start (net-new rule); this file and any notes are planning only.

---

## 1. What Baton is (one sentence)

**Baton is an AI coworker that lives inside your team's Ambiguous workspace, watches the whole
graph of who owes whom what, and catches the work about to fall through the cracks, then hands
it off before it does, with every action human-approved and logged.**

Submission one-liner: *"A coworker that makes sure nothing gets dropped. Baton maps your team's
real workflow, spots the stalled ask, the overloaded person, the unbooked deadline and the
single point of failure, then rescues each one with a governed, one-click hand-off across your
apps."*

It is **not** a chatbot. Its value is intrinsically cross-app and cannot exist in a standalone
chat window: it only works because it sees and acts across Mail, Chat, Tasks, Calendar and CRM
at once. That is the exact thing the rubric rewards with a 5.

---

## 2. The bet: how Baton scores 5 on every judging criterion

Four criteria, scored 1-5. Build to hit 5 on each.

1. **Core Requirements & Functionality (works end to end in a real environment).**
   Baton is a provisioned Ambiguous coworker that reads the workspace and takes real actions in
   it. The core loop (detect a dropped ball -> propose a fix -> human approves -> Baton acts in
   the workspace -> logged) must run end to end on camera.
2. **Innovation & Theme Alignment (surprising pattern impossible in a chatbox).**
   A coworker that perceives the *whole org graph* and intervenes to prevent dropped work is a
   new pattern. Say this explicitly in the writeup and video: "this value cannot be reproduced
   in a chatbox because it depends on seeing and acting across every app at once."
3. **Technical Execution & Integration (orchestration, reliability, failure handling, depth).**
   Real webhooks from Ambiguous, a deterministic graph + risk engine, an action executor that
   writes back through the API, an audit trail, and a hybrid design (rules for decisions, LLM
   only for reading messy text). Handle failures (retries, idempotency keys on mail).
4. **Usefulness & Agentic Experience (clear value, native, controllable).**
   Human-in-the-loop: nothing auto-sends. Every intervention is a draft the user approves. The
   agent feels native (it *is* a workspace member with its own identity) and gives the user full
   control. Lead the writeup with a named user and a number.

**Deep Ambiguous use is the category moat:** Baton is provisioned as a coworker, subscribes to
Ambiguous webhooks, reads across all apps, acts across all apps, and writes its audit log back
into the workspace as a Sheet. That is the deepest possible integration, which wins the DGX Spark.

---

## 3. The wow moment (design everything around this)

The 60 seconds that must land in the video:

1. A polished dark dashboard shows a **live force-directed graph** of the workspace: people and
   work items as nodes, edges = who owes whom. Nodes glow by risk (green -> amber -> red).
2. An email arrives in the workspace (you trigger it live). A webhook fires, the graph
   **animates in real time**, and a node flares red.
3. A **"Drop Risk" panel** lists what is about to fall through the cracks, in plain English:
   - *"Nicolas asked Sally about the Moderna submission 6 days ago. No reply. Deadline in 2 days."*
   - *"Priya is the only owner of 4 stalled tasks on the critical path (single point of failure)."*
   - *"The safety-training deadline is unbooked."*
4. Each card has a **proposed governed action** and an **Approve** button. Faith clicks Approve.
5. Baton **acts in the workspace live**: it sends the nudge (Mail/Chat), reassigns a task,
   books the calendar slot, and writes a row to the **audit Sheet**, all as its own identity.
6. The graph settles back towards green. Cut.

If a judge can watch that and instantly get it, you win the category. Everything else is
supporting cast. Build this path first and make it beautiful.

---

## 4. Architecture

Use Faith's known-fluent stack (matches her pinned repos: React/Tailwind/Framer Motion + FastAPI + GCP).

```
Ambiguous workspace (Mail, Chat, Tasks, Calendar, CRM, Sheets)
      |  webhooks (task.assigned, email.received, document.shared)  +  REST reads
      v
FastAPI backend (Python)
  - ingest:   pull state via REST/CLI, receive webhooks
  - graph:    NetworkX graph of people <-> work items <-> threads
  - risk:     deterministic rules registry -> scored "drop risks"
  - reasoning: OpenAI (Agents SDK) ONLY for "is this an ask / draft the nudge"
  - executor: on human approval, act via Ambiguous API (mail/tasks/calendar/chat) + write audit Sheet
  - realtime: WebSocket push to the frontend
      |
      v
Next.js frontend (React + Tailwind + shadcn/ui + Framer Motion + react-force-graph-2d)
  - live graph, Drop Risk panel, one-click Approve, audit timeline
```

Deploy target: **Google Cloud Run** (Faith uses it) for backend, and Cloud Run or Vercel for
the frontend. **The demo runs locally (localhost) for reliability**; Cloud Run deploy is a
stretch for the public URL in the repo. Do not risk the demo on a live deploy.

Sponsors to lean on (each nudges scores and unlocks credits):
- **Ambiguous AI**: the environment. Primary. This is the category.
- **OpenAI Agents SDK**: the reasoning layer (marquee sponsor; 1st-place prize is OpenAI credits).
- **Google Cloud Run**: deploy.
- Optional stretch: **Exa** to enrich a nudge with a relevant link; **CopilotKit channels** to
  also surface a Baton alert in Slack/Teams (only if core is done, see section 12).

---

## 5. Ambiguous integration cheat-sheet (exact, tested against their docs)

**Self-serve during the build:** if you need an exact endpoint or field, do not guess. Use the
public docs MCP (no credentials): `https://www.ambiguous.ai/docs/mcp` with `search_docs` and
`read_doc`, or fetch the OpenAPI at `https://app.ambiguous.ai/api/openapi.json`. Recipes:
`https://www.ambiguous.ai/agents/recipes`. CLI: `https://www.ambiguous.ai/agents/cli`.

**Install + auth (CLI), provisions the coworker identity + workspace + API key:**
```
npm install -g ambiguous
npx ambiguous auth signup --name "Baton" --human-email faithogun12@gmail.com
# -> writes API key to ./.ambi/config.json, assigns a workspace email, gives an MCP endpoint
npx ambiguous auth status
```

**Provision the agent via REST (alternative):** `POST /api/admin/users/provision-agent`
(returns agent user + API key). Base URL `https://app.ambiguous.ai`. Auth: Bearer API key.

**Read state (REST, from the FastAPI backend with httpx):**
```
GET  /api/tasks                       # status, assignee, due date, updatedAt
GET  /api/tasks/:id                   # detail + comments
GET  /api/mail        (or mail list)  # messages: from, to, thread, timestamp, body
GET  /api/chat                        # messages/threads
GET  /api/calendar                    # events, times, attendees
GET  /api/crm/contacts   ->  npx ambiguous crm contacts list --json
GET  /api/sheets/<id>/range?spec=Sheet1!A1:D10
```
CLI equivalents exist for all of these (`npx ambiguous <app> ...`); the CLI mirrors REST/MCP.

**Act (only after human approval):**
```
# nudge
npx ambiguous mail send --to sally@ws --subject "Moderna submission" --body-markdown "..."
POST /api/mail        # include Idempotency-Key header (<=255 chars) so retries never double-send
# create / reassign / complete a task
POST  /api/tasks                      # create
PATCH /api/tasks/:id                  # reassign, change status, set due date
POST  /api/tasks/:id/comments         # leave a note
# calendar hold
POST /api/calendar                    # create event / propose time
# chat nudge
POST /api/chat                        # message a thread
# audit log
npx ambiguous docs create --type sheet ... ; then append a row per action
```

**Real-time (the wow depends on this):** register webhooks so Baton reacts instantly.
```
POST /api/webhooks   body: { events: ["task.assigned","email.received","document.shared"], url: "<backend>/webhooks" }
# returns webhook id + HMAC signing secret. Verify with crypto HMAC-SHA256 + timestamp replay check.
# events fire in ~100ms. On event: re-pull the affected slice, recompute risk, push to the UI.
```
Also run a **periodic sweep** (every 30-60s) as a fallback so stale tasks/deadlines surface even
without an event.

**Build safely first:** develop the task logic against the **disposable sandbox** (synthetic
task CRUD, no signup, 1-hour expiry): `https://app.ambiguous.ai/sandbox`, its OpenAPI at
`/sandbox/openapi.json`. Mail/automation/MCP are not in the sandbox, so switch to the real
workspace for the seeded demo.

**Safety rules (bake in):** use the connected identity's permissions; **confirm recipients before
any send**; nothing destructive without approval; honour `Retry-After` on 429; reuse
Idempotency-Key only for retries of the same message.

---

## 6. Data model, signals, and the rules registry (the moat)

Pull raw signals, build a graph, score risks against an **inspectable, tunable registry**. The
registry is a single JSON/YAML file, shown in the UI, so the "domain expertise" is legible.
Deterministic scoring is the credibility and the audit trail.

**Graph:** nodes = people and work items (tasks, threads, deadlines, projects); edges = asks,
assignments, mentions, thread participation. Compute with NetworkX.

**The four drop-risk detectors:**
1. **Open-loop ask** - a message that is a request directed at someone, with no reply from that
   person after the ask, older than a threshold. (LLM classifies "is this an ask + to whom";
   deterministic checks "answered?" and age.)
2. **Stalled task** - task not done, no update in N days, due soon or overdue. (Pure deterministic
   on task fields: `status`, `assignee`, `updatedAt`, `dueDate`.)
3. **Unbooked / at-risk deadline** - a due date or commitment with no corresponding calendar hold
   or progress. (Deterministic: cross-check tasks/mentions vs calendar.)
4. **Single point of failure / overload** - a person who is sole owner of >K critical or stalled
   items, or has centrality above a threshold. (Deterministic graph metrics: degree, betweenness,
   a "dead-man-switch" count of items only they can do.)

**Rules registry (example `rules.yaml`, tune live in the UI):**
```yaml
open_loop_ask:   { unanswered_business_days: 3, escalate_if_deadline_within_days: 2 }
stalled_task:    { no_update_days: 5, at_risk_if_due_within_days: 3 }
deadline:        { require_calendar_hold: true, warn_within_days: 3 }
spof:            { max_sole_critical_items: 3, betweenness_percentile: 0.9 }
severity_weights:{ deadline_proximity: 0.5, seniority: 0.2, thread_age: 0.3 }
```

**Project linking (for "Moderna"):** map tasks/threads to a project by tag/label/CRM field,
with a light LLM pass for fuzzy references ("the Moderna thing" -> Project: Moderna).

**Proposed action per risk type** (draft only): open-loop -> draft a nudge; stalled -> reassign
or comment + set due date; deadline -> create calendar hold; SPOF -> propose redistributing one
task. LLM drafts the human-readable message; the structural action is deterministic.

---

## 7. Deterministic vs LLM split (state this in the writeup, it wins Technical Execution)

- **Deterministic (rules + graph):** all detection, scoring, severity ranking, who/what/when,
  and the audit log. Reproducible, inspectable, defensible.
- **LLM (OpenAI Agents SDK):** only (a) "is this message an ask and to whom", (b) fuzzy
  project/entity linking, (c) drafting the natural-language nudge/escalation text.
- **Never** let the LLM decide whether to act or fire an action. Humans approve; rules decide
  structure. This hybrid is the credibility moat and mirrors Faith's clinical-agent pattern.

---

## 8. Frontend spec (THE WOW - spend real polish here)

Stack: Next.js (App Router) + Tailwind + shadcn/ui + Framer Motion + `react-force-graph-2d`.
Dark, dense, confident, "mission control" aesthetic. Real-time via WebSocket to the backend.

**Single-screen dashboard (no navigation needed for the demo):**

- **Left / centre: the live graph.** Force-directed. Person nodes and work-item nodes. Node
  colour = risk (green/amber/red), size = load/centrality. Edges = asks/assignments, animate
  when an event arrives. Red nodes pulse. Clicking a node highlights its risks. This is the
  centrepiece; make it smooth (Framer Motion transitions, animated edges).
- **Right: the "Drop Risk" panel.** A ranked list of cards, most severe first. Each card:
  - plain-English risk ("Nicolas asked Sally ... 6 days ago, no reply, deadline in 2 days"),
  - a severity chip, the linked people/project,
  - the **proposed action** (the drafted nudge/reassignment/booking, editable inline),
  - an **Approve** button (and Dismiss). Approve triggers a satisfying animation: the card
    flies out, the action executes, a toast confirms "Baton sent the nudge + logged it".
- **Bottom: the audit timeline.** Every action Baton has taken, live, with a link to the
  workspace record. Reinforces "governed and logged".
- **Header: an Org Health score (0-100)** with a live number that ticks up as risks are cleared.
  Cheap to compute, big visual payoff.
- A small **"Rules" drawer** showing `rules.yaml` (the inspectable moat) with sliders that
  re-score live. Optional but strong.

Real-time contract: backend pushes `{type: "graph_update"|"new_risk"|"action_logged", ...}` over
WebSocket; the UI animates on each. Keep an in-memory store on the client; do not full-refresh.

Polish checklist: smooth transitions, no layout jank, a real empty/loading state, readable
typography, one accent colour for danger. A rough backend behind a beautiful, real-time front
end wins hackathons; make what is on screen feel alive.

---

## 9. Backend spec (FastAPI)

Endpoints:
- `POST /webhooks` - receive Ambiguous events (verify HMAC), enqueue a rescan of the slice.
- `GET  /state` - current graph + ranked risks (for initial load).
- `WS   /live` - push graph updates, new risks, logged actions.
- `POST /risks/{id}/approve` - execute the proposed action via Ambiguous, then append audit row,
  then broadcast `action_logged`. Confirm recipient server-side. Use Idempotency-Key on mail.
- `POST /risks/{id}/dismiss` - mark handled.
- `GET  /rules` / `PUT /rules` - read/update the registry, re-score.

Modules: `ingest.py` (REST/CLI pulls + webhook handling), `graph.py` (NetworkX build), `risk.py`
(the four detectors + registry scoring), `reason.py` (OpenAI Agents SDK: ask-detection, drafting),
`executor.py` (act via Ambiguous + audit Sheet), `audit.py`. Keep a single in-memory `WorkspaceState`
refreshed by webhooks + the 45s sweep. No database needed for the demo; the audit Sheet in Ambiguous
IS the persistence, which also deepens the integration.

Failure handling to show off: retries with backoff on 429 (honour `Retry-After`), Idempotency-Key
on sends, webhook signature verification, graceful "no data yet" states.

---

## 10. Build order (STRICT timebox, 11:15-15:30, ~4h15m)

Do these in order. Do not start a later block until the earlier one demos.

- **11:15-11:40 (25m) Scaffold + Ambiguous connected.** Next.js app + FastAPI app. `npm i -g
  ambiguous`, signup, confirm `auth status`. Hit the sandbox, list tasks, print them. Prove the
  pipe works before anything else.
- **11:40-12:30 (50m) Ingest + graph + one detector.** Pull tasks/mail/calendar. Build the
  NetworkX graph. Implement the **stalled-task** detector (pure deterministic, most reliable).
  Return `/state`. You now have real risks from real data.
- **12:30-13:30 (60m) The wow front end.** Live force graph + Drop Risk panel + Approve button,
  wired to `/state`. Make it beautiful. This is the scored artefact; give it the hour.
- **13:30-14:15 (45m) Governed action + audit + real-time.** Approve -> Baton sends a nudge /
  reassigns / books, writes the audit Sheet, WebSocket pushes the update, card animates out.
  End-to-end loop now works on the real workspace.
- **14:15-14:45 (30m) Second + third detector + polish.** Add open-loop ask (LLM) and
  SPOF/overload (graph metric). Add the Org Health score + audit timeline. Seed the demo
  workspace with the Moderna scenario.
- **14:45-15:10 (25m) FREEZE features. Record the 2-minute video.** Script in section 11.
- **15:10-15:30 (20m) Submit.** Repo public, README, description, video link, social post.
  Buffer for portal issues. **Submit by 15:30, not 15:29:59.**

If you fall behind: ship stalled-task + open-loop only, one governed action, and the live graph.
That is a complete, winning demo. Cut SPOF, the rules drawer, and Cloud Run first.

---

## 11. Seed data + 2-minute video script

**Seed the workspace** (before recording) with ~4 people (incl. Baton), a "Moderna submission"
project, and planted situations: one 6-day-unanswered ask with a near deadline, one stalled task
owned solely by "Priya", one deadline with no calendar hold. This is what makes the demo legible.

**Video (record the last 25 min, narrate tightly):**
1. 0:00-0:20 - the hook + named user. "Every team drops balls. An ask goes unanswered, a task
   stalls, a deadline slips. Baton is a coworker that catches them before they fall."
2. 0:20-0:50 - show the live graph + Drop Risk panel; read one risk in plain English.
3. 0:50-1:30 - **the wow**: trigger a live event, watch the graph flare, click Approve, watch
   Baton send the nudge + book the slot + log the audit row, in the workspace, as itself.
4. 1:30-1:50 - "Nothing auto-sends. Every action is human-approved and logged. The rules are
   inspectable." Show the audit Sheet + rules drawer.
5. 1:50-2:00 - the line for the judges: "This cannot exist in a chatbox. Baton's value is that
   it sees and acts across the whole workspace at once." Tag @OpenAI @AmbiguousAI in the post.

Keep it under 2:00. The video is what is scored; a crisp narrated end-to-end beats more features.

---

## 12. Scope guards / do NOT build

- No auth/login flows, no multi-workspace, no settings pages, no onboarding. One dashboard.
- No database. Audit Sheet in Ambiguous is the store.
- Do not attempt a bulletproof "ask detector" across the whole inbox; make it solid for the 2-3
  planted demo cases. Structured task/calendar signals are your reliable backbone.
- CopilotKit Slack/Teams mirror: **only if the core loop is done and recorded.** It is a nice
  "also shows up in Slack" beat for Innovation, not a requirement. Ambiguous is the environment
  that wins the category; do not dilute it.
- Cloud Run deploy: stretch. Demo local. A working local demo + public repo satisfies submission.

---

## 13. Submission checklist (do at 15:10)

- [ ] Public GitHub repo (create it now, at build start, not before). Clear README with the
      one-liner, the "cannot be a chatbox" claim, stack, run steps, and the rules registry.
- [ ] Project title: **Baton**.
- [ ] Written description (what it is, who it is for, why the environment is essential).
- [ ] 2-minute demo video (the script above).
- [ ] Social post tagging the event partners (@OpenAI, @AmbiguousAI, AI Tinkerers).
- [ ] "What we built during the event" note ready (everything here is net-new; the plan is not).
- [ ] Submitted in the portal before 15:30 CEST.

---

## 14. Setup commands (run at 11:15)

```
# frontend
npx create-next-app@latest baton --ts --tailwind --app --eslint
cd baton && npx shadcn@latest init && npm i framer-motion react-force-graph-2d
# backend
mkdir server && cd server && python -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" httpx networkx openai pyyaml
# ambiguous
npm i -g ambiguous && npx ambiguous auth signup --name "Baton" --human-email faithogun12@gmail.com
npx ambiguous auth status
# keys: OPENAI_API_KEY in server/.env ; Ambiguous key is in ./.ambi/config.json
```

Remember: British English, no em dashes, human-approval on every action, and make the screen
come alive. Now build the wow first. Go.
