# Baton — Demo Video Script (hard 2:00, lands ~1:52)

**Why this version:** the hackathon brief is a **2-minute** video, and only what is inside it gets
scored. So this is not the full product tour. It is the one spine that proves the category claim,
cut to a real spoken length, against the **live Ambiguous workspace** rather than seeded data.

**Measured (not guessed):** the voice-over is **266 spoken words**.
- at 140 wpm → **1:54** · at 150 wpm → **1:46** · at 155 wpm → **1:43** · at 165 wpm → **1:37**

Under 2:00 at any realistic pace, with real headroom: the eight-second silent close still lands the
film around 1:50. A crisp 1:50 beats a rushed 2:00, and the spare seconds are there so you can
pause on the audit sheet rather than racing past it. **Calibrate
yourself first:** record a 20-second test of Part 1, count the words you actually said, multiply by
three. That is your real words per minute. Trust word count divided by your rate, never a "this
part feels like 20 seconds" guess.

**Format:** screen recording of the live app at `localhost:5173/app` plus your own voice-over, cut
with two Remotion cutaways that are **rendered and ready** in `demo/clips/`:
`why-not-a-chatbox.mp4` (14s, 1920x1080) and `the-split.mp4` (12s, 1920x1080). Both are silent, so
the voice-over plays over them. Narrate in **your own voice**, never an AI
voice-over: a judge in a previous event said outright that a synthetic narrator "feels less
genuine".

**Tone:** calm, specific, certain. You are a team lead showing the thing that catches what your
team drops. Every sentence finishes.

`[CAM]` you · `[SCREEN]` the live app · `[AMBI]` the Ambiguous workspace itself · `[ANIM]` a cutaway in `demo/clips/` · `[CAP]` a caption you add in the edit.

**British English. No em dashes. Hard 2:00.**

---

## PART 1 — A real workspace, and the thing nobody can see (0:00 – 0:20)
**~20 seconds · 46 words**

- `[SCREEN: the dashboard already open and settled. Do NOT film the load. The status bar reads `webhooks live` and `aldermere.ambi.cc`; the header reads Regulatory affairs, Aldermere Bio, 7 people, lead Rachel Foster.]`

- `[CAP: "Live Ambiguous workspace. Invented company, real records."]`

> "This is a real Ambiguous workspace, and Baton is a member of it with its own address. It is watching seven people push a filing due on the fourteenth. Nothing here was typed by me. Baton read all of it, and found four things about to fall through the cracks."

---

## PART 2 — The risk that is invisible from inside any app (0:20 – 0:48)
**~26 seconds · 60 words**

- `[SCREEN: click the top row. It expands: "Priya is the only owner of 4 critical items." Severity 82. The graph dims to just her cluster, her node wearing its dashed sole-owner collar.]`

- `[SCREEN: open "Why this fired" so the rule line is legible on screen.]`

- `[CAP: "spof · 4 sole-owned critical items > 3 · betweenness 1.00 > 0.90"]`

> "The worst one is not a late task. Priya is the only person who can finish four items on the critical path, and her betweenness across the graph is one. That is not in any record. It is the shape of the work, so there is no document you could open that contains it. It is worth four thousand pounds if she is out for a week."

---

## PART 3 — THE WOW. It acts in the workspace, as itself. (0:48 – 1:22)
**~32 seconds · 67 words**

- `[SCREEN: the proposal is already visible on the open card. Click **Approve** once. The button goes to "Acting in the workspace", the card hands itself off to the right, the graph cools, health ticks up, and a row writes into the audit strip.]`

- `[AMBI: cut straight into the Ambiguous workspace and show the artefact Baton just made, live. Then open the Sheet named "Baton - action log" and show the row.]`

- `[CAP: "Nothing auto-sends. This happened because a person approved it."]`

> "I approve it. Baton acts in the workspace under its own identity, not mine, so this reads as a system reminder rather than a manager telling somebody off. Here is that same action inside Ambiguous, a minute old. Every action also writes a row into a sheet in the workspace, where the team being audited can read it. That sheet is the only place Baton stores anything."

---

## PART 4 — The judgement is a file, and it refuses things (1:22 – 1:42)
**~22 seconds · 55 words**

- `[SCREEN: press R. Drag `no_update_days`. The severities re-score in front of you. Then press / and click the suggestion "Send Sally a nudge", and let the refusal sit on screen for two full seconds.]`

- `[CAP: "It declines. The only route to an action is Approve."]`

> "Most of this needs no model at all. Every threshold that decides what counts as dropped is one file you can read, and moving a number re-scores the queue in front of you. You can ask it questions in plain language, and it answers from the graph. Ask it to send something, and it says it cannot."

---

## PART 5 — The claim (1:42 – 1:52)
**~10 seconds · 24 words**

- `[ANIM: clips/why-not-a-chatbox.mp4 — optional. If it is not rendered, hold on the graph with the Ask panel open instead. The line below carries the beat either way.]`

> "This cannot exist in a chat window. A chatbot answers the question you thought to ask, and every risk here is one you did not."

---

## PART 6 — Close (1:58 – 2:00, or straight out)
**Card only. No voice-over.**

- `[ANIM: ../assets/readme/thumbnail.mp4 — the existing 8.7s hero. Use the last two seconds, the lockup and "Never drop the baton.", and let it settle. Speed up or trim so the film never crosses 2:00.]`

- `[CAP: "github.com/faith-ogun/baton"]`

---

## What each beat proves

| Beat | What the judge learns | Criterion |
|---|---|---|
| The live status bar and workspace address | It runs in a real environment, not on mock data | Core requirements |
| Baton as a member with its own address | The deepest available Ambiguous integration | **Best Use of Ambiguous** |
| The single point of failure, with betweenness on screen | A risk that is genuinely invisible from inside one app | Innovation |
| Approve, then the artefact inside Ambiguous | The loop closes in the real workspace, not in our UI | Core requirements |
| The audit sheet in the workspace | Governed, logged, and readable by the audited team | Usefulness |
| The registry re-scoring live | Deterministic and inspectable, not a prompt | Technical execution |
| Ask declining to act | Read-only by construction, not by policy | Usefulness |
| "You did not think to ask" | The value cannot be reproduced in a chatbox | Innovation |

---

## Must-show checklist

- [ ] Status bar reading **`webhooks live`** and **`aldermere.ambi.cc`** (restart the dev server first, or it will say `seeded workspace`)
- [ ] The header showing the scope: Aldermere Bio, Regulatory affairs, 7 people, lead Rachel Foster
- [ ] The **rule line** legible on screen, not just narrated
- [ ] **One Approve**, and the resulting artefact shown **inside Ambiguous**
- [ ] The **audit sheet row** inside the workspace
- [ ] The **rules drawer** re-scoring
- [ ] **Ask refusing** to act
- [ ] The caption saying the company is invented

## Optional, if the film has room

`clips/the-split.mp4` (12s) shows the deterministic column against the model column and lands on
"It never decides whether to act." It is **not in the cut above**, because Part 4 already makes that
point live on screen with the rules drawer, and 12 more seconds would put the film over. Keep it for
the written submission or a longer cut.

---

## Cut order if it runs long

1. The rules-drawer half of Part 4, keeping only the Ask refusal (~8s)
2. The head of the `why-not-a-chatbox` cutaway in Part 5, starting on the graph rather than the chat window (~4s)
3. The second sentence of Part 1, "It is watching seven people…" (~7s)

**Never cut:** the Approve, the artefact inside Ambiguous, or the audit sheet. Those three are the
category. And never shorten a sentence to fit; drop a whole line from this list instead.

---

## Guardrails

- **Verify Approve works before you roll.** If it errors on camera the film is dead. Fire one
  approve, confirm the artefact appears in Ambiguous, then reset if needed.
- **Do not narrate a live workspace over a seeded one.** If the status bar says `seeded workspace`,
  the dev server has not picked up `web/.env.local`; restart it.
- **Never say "deterministic" on camera.** Say "needs no model at all", or "cannot go differently on
  a second run".
- **Do not claim the open-loop detector.** Mail is recipient-scoped in Ambiguous so Baton cannot
  read Frank's ask, and that detector is not running. Three detectors are live: sole owner, unbooked
  deadline, and stalled task. Say "four things about to fall through the cracks", which is the true
  count of risks on the board, and never "four detectors".
- **Do not claim any percentage caught**, and do not quote the Asana or PMI figures. Both are
  unverified. See `docs/40_Deliverables/Demo facts.md`.
- **Say the company is invented** once, or put it on a caption. Aldermere Bio and the drug name are
  fictional; the records in the workspace are real.
- No cursor in frame for the cold open. Jump-cut across every load.
- Money on screen is real: £7,280 across the board, £4,160 on the sole-owner risk, at the £520
  blended day rate in the registry.
