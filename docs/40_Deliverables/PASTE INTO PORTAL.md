---
title: "Paste into portal"
type: deliverable
status: active
tags: [type/deliverable, topic/judging]
last-reviewed: 2026-09-12
---

# Paste into the portal

Final copy. Every block below is written on single long lines on purpose, so pasting into a textarea
does not carry hard line breaks into the form. Do not reflow them.

---

## 1. Project name

```
Baton
```

---

## 2. Project description

```
Baton is an AI coworker that lives inside your team's Ambiguous AI workspace, holds the graph of who owes whom what, and catches the work about to fall through the cracks.

**The problem.** Nobody drops a ball on purpose. Someone asks a colleague for a sign-off and it goes quiet. A task stalls with a single owner and no second pair of hands. A filing date arrives with nothing in the calendar against it. One person turns out to be the only one who can finish four things on the critical path. By the time anyone notices, the cost is already paid, and no single app ever showed the problem, because the problem lived in the gaps between them.

**Why it has to live in the environment.** Baton is provisioned as an actual member of the workspace, with its own address and the team's permissions. That is not packaging, it is the only way the product can work. You cannot tell that an ask has gone unanswered for six days without reading the mail, the task board and the calendar at the same time, and holding the people graph across all three. On the demo team of seven, Baton read the tasks, the calendar and the people for itself and flagged the work about to drop. The one that mattered was not the late task at the top of the list: it was that a single person was the sole owner of four critical items with a betweenness of 1.00 across the graph. That risk is written down nowhere. It is the shape of the work, so there is no document you could open that contains it.

**Why it cannot be a chatbot.** Ask a chatbot how to stop work slipping and it gives you a correct, useless answer, because it cannot see your team. Baton can see it, and it does not wait to be asked. The value does not stop at noticing either: each risk arrives with a specific proposed fix, and on approval Baton acts back into the workspace under its own identity, so a nudge reads as a system reminder rather than a manager telling somebody off.

**Technical execution.** A FastAPI backend ingests the workspace over REST with httpx and reacts to Ambiguous webhooks, verified with HMAC-SHA256 and a timestamp replay window, with a 45 second sweep as the fallback because a task going stale fires no event. NetworkX builds the graph of people, tasks, threads and dates and supplies the centrality and sole-ownership metrics. Four detectors score against a YAML registry that is shown in the UI and tunable live: unanswered ask, stalled task, unbooked deadline, and single point of failure. Three of the four are pure graph and rules, so they cannot go differently on a second run. The OpenAI Agents SDK does the language work and only that: deciding whether a message is an ask and to whom, resolving a loosely named project, interpreting a question typed in plain English, and drafting the sentence a human will send. It never decides whether to act. The front end is React 19, Vite and Tailwind 4, with a live force-directed graph on react-force-graph-2d and d3-force, a ranked risk queue, a rules drawer that re-scores as you drag a threshold, a read-only Ask panel that answers from the graph and refuses to send anything, a keyboard-driven tour mode, and an audit timeline. Deployed on Google Cloud Run in europe-west1 with Cloud Build and Secret Manager, front end on Firebase Hosting.

**Governance, which is the reason it is usable.** Nothing auto-sends, ever. Every action is a draft until a person approves it. The recipient is resolved server-side from the workspace directory rather than trusted from the client, and an idempotency key means a retry cannot double-send. Every action appends a row to a Sheet inside the workspace, which is also the only place Baton stores anything: there is no database. That is deliberate, because an audit trail the audited team cannot open is not accountability, it is a private log. The trail rehydrates from that Sheet on restart.

Repo: https://github.com/faith-ogun/baton
Live dashboard: https://baton-hack-2026.web.app/app
```

---

## 3. Products & Tools Used

**Tick exactly these three:** AI Tinkerers, OpenAI, Ambiguous AI.

**Leave unticked:** CopilotKit, OpenRouter, Exa, Trigger.dev, Auth0, Mozilla.ai, and **NVIDIA**.

Do not tick NVIDIA. It is the category prize, not something you used, and a judge who checks will
notice. Ticking tools you did not touch is the cheapest possible way to lose credibility.

### Other Products

```
Google Cloud (Cloud Run, Cloud Build, Secret Manager, Artifact Registry) and Firebase Hosting for the deploy. FastAPI, NetworkX and httpx for the backend. React 19, Vite, Tailwind 4, react-force-graph-2d and d3-force for the dashboard. Remotion for the demo cutaways and the caption overlays. Claude Code as the coding agent. The logo was generated with ChatGPT's image tool.
```

---

## 4. Project video

Paste the YouTube (Unlisted or Public) or Loom link. Keep it to 2:00; the script measures 1:57.

---

## 5. Team Contributions

```
Solo build. I did all of it, inside the one four-hour window.

Ambiguous AI, the environment and the core of the entry. I provisioned Baton as an agent user through the CLI (npx ambiguous auth signup) so it is a real workspace member with its own address, then set up the Aldermere Bio workspace and its seven members. I registered workspace webhooks and verified them with HMAC-SHA256 plus a timestamp replay window. The read layer covers /api/tasks, /api/mail/inbox, /api/calendars/{id}/events, /api/calendars/availability, /api/channels, /api/crm/contacts and /api/sheets/{id}/range. The executor writes back through /api/mail/send, PATCH /api/tasks/{id}, /api/tasks/{id}/comments and POST /api/calendars/{id}/events, always as Baton's own identity and only after a human approves. Every action appends a row to a Sheet in the workspace via POST /api/sheets/{id}/rows, and that Sheet is the entire persistence layer.

OpenAI, the reasoning layer. I used the Agents SDK for the language work and deliberately nothing else: classifying whether a message is an ask and to whom, resolving a loosely named project to the right one, interpreting a question typed in plain English against the graph, and drafting the nudge text a human reads before approving. The model never decides whether to act.

Google Cloud, the deploy. I containerised the FastAPI backend and deployed it to Cloud Run in europe-west1 via Cloud Build, with the Ambiguous agent token held in Secret Manager, and put the front end on Firebase Hosting.

Everything else: the NetworkX graph with its betweenness and sole-ownership metrics, the four detectors and the YAML rules registry, the React 19 / Vite / Tailwind 4 dashboard with the live force-directed graph, the tour mode, the rules drawer, the grounded read-only Ask panel and the audit timeline, the landing site, the architecture diagram, the brand, and the demo video (Remotion for the cutaways and the caption overlays).
```

---

## 6. Additional Links

| URL | Title or description |
|---|---|
| `https://github.com/faith-ogun/baton` | Source, README and the rules registry |
| `https://baton-hack-2026.web.app` | Live site: the four failures, the mechanism, the cost model |
| `https://baton-hack-2026.web.app/app` | Live dashboard, reading the real Ambiguous workspace |

---

## 7. Prior Work

```
None. Everything that runs was built inside the window: the FastAPI backend, the graph and risk engine, all four detectors, the Ambiguous integration including the agent provisioning, the webhooks and the executor, the audit Sheet, the React dashboard, the landing site, the Cloud Run and Firebase deploy, and the video. The only thing that predates it is the one-page planning brief committed as CLAUDE.md, which is a plan and not code, and the logo, which was generated with ChatGPT's image tool.
```

---

## 8. Social posts

Post the **LinkedIn** one and paste that URL first: it is the only format where all ten sponsor
tags fit without reading as tag soup. The X thread is a bonus, and the box takes more than one URL.

On LinkedIn the tags only register if you type `@` and pick the company from the dropdown, so do
that for each name rather than leaving it as plain text.

### LinkedIn

```
I spent today at Agents, Everywhere in Paris building Baton, and I want to tell you about the very boring disaster it exists for.

Nobody drops a ball on purpose. Someone asks a colleague for a sign-off and it goes quiet. A task stalls with one owner and no second pair of hands. A filing date arrives with nothing in the calendar against it. By the time anyone notices, the cost is already paid, and no single app ever showed the problem, because the problem lived in the gaps between them.

Baton is an AI coworker that lives inside your team's Ambiguous AI workspace. It is provisioned as a real member with its own address, and it holds the graph of who owes whom what: people, tasks, threads and dates, all at once. It finds the work about to fall through the cracks, proposes a specific fix, waits for a human to approve it, then acts back into the workspace under its own identity and writes the row into an audit sheet the team itself can read.

On the demo team of seven, Baton read the tasks, the calendar and the people for itself and flagged the work about to drop. The one that mattered was not the late task at the top. It was that one person was the only owner of four items on the critical path. That is written down nowhere. It is the shape of the work.

Why it cannot be a chatbot: ask a chatbot how to stop work slipping and it gives you a correct, useless answer, because it cannot see your team. Baton can see it, and it does not wait to be asked.

The part I am most pleased with is the division of labour. The OpenAI model does the language work: reading a thread to decide whether it is an ask, resolving a loosely named project, writing the sentence a manager is willing to put their name to. It never decides whether to act. A rules file you can read decides that, and moving a threshold re-scores the queue in front of you. Nothing auto-sends, ever.

Built with Ambiguous AI as the environment (agent provisioning, HMAC-verified webhooks, reads and writes across mail, chat, tasks, calendar, CRM and sheets), OpenAI for the reading and the phrasing, Google Cloud for the deploy (Cloud Run, Cloud Build, Secret Manager and Firebase Hosting), and FastAPI, NetworkX, React, Vite and Tailwind for everything in between.

Solo build, one four-hour window.

Thank you to AI Tinkerers for running it, and to the sponsors who turned up with credits and support: OpenAI, Ambiguous AI, Google Cloud, CopilotKit, OpenRouter, Exa, Auth0, Trigger.dev and Mozilla.ai.

Repo: https://github.com/faith-ogun/baton
Live: https://baton-hack-2026.web.app

#AgentsEverywhere
```

### X, as a three-post thread

**Post 1** (this is the URL to paste if you only paste one X link):

```
Nobody drops a ball on purpose. An ask goes quiet, a task stalls, a deadline arrives unbooked. Baton is an AI coworker that lives in your @ambiguousio workspace, finds the work about to drop, and hands it off. You approve. It acts as itself and logs the row. #AgentsEverywhere
```

**Post 2:**

```
The split: @OpenAI does the language work, reading a thread to decide whether it is an ask and writing the nudge a human approves. It never decides whether to act. A rules file you can read does that. Deployed on @googlecloud Cloud Run. github.com/faith-ogun/baton
```

**Post 3:**

```
Built solo in one four-hour window at @AITinkerers Agents, Everywhere in Paris. Thanks to the sponsors who showed up: @OpenAI @ambiguousio @googlecloud @CopilotKit @openrouter @exaailabs @auth0 @triggerdotdev @mozillaAI #AgentsEverywhere
```

---

## 9. Checklist before you hit submit

- [ ] Project name: Baton
- [ ] Description pasted
- [ ] Three boxes ticked, NVIDIA left alone, Other Products filled
- [ ] Video link (2:00 or under)
- [ ] Team contributions pasted
- [ ] Three additional links
- [ ] Prior work pasted
- [ ] LinkedIn URL pasted, X thread URL pasted

## Related

- [[Submission text]] · [[Demo facts]] · [[MOC-deliverables]]
