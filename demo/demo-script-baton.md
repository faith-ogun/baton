# Baton — Demo Video Script (hard 2:00, lands ~1:55)

**Why this version:** the hackathon brief is a **2-minute** video, and only what is inside it gets
scored. So this is not the full product tour. It is the one spine that proves the category claim,
cut to a real spoken length, against the **live Ambiguous workspace** rather than seeded data.

**Measured (not guessed):** the voice-over is **293 spoken words**, across exactly five spoken lines.
- at 140 wpm → **2:06** · at 150 wpm → **1:57** · at 155 wpm → **1:53** · at 165 wpm → **1:47**

At 140 wpm this crosses 2:00, so take cut 1 below if your calibration comes in slow. Parts 4 and 5
were rewritten after the first voice-over pass: Part 4 now names what the OpenAI model actually
does, because the earlier line led with what it does not do, which read as though the model were
barely involved. **Only those two lines changed.** Parts 1, 2 and 3 are word for word as recorded,
so nothing else needs another take.

Every production note in this file is deliberately **not** a blockquote. In this format `>` means
"words you say out loud", so a note written as one would be counted and the running time above
would be a lie.

Under 2:00 at any realistic pace. A crisp 1:50 beats a rushed 2:00, and the spare seconds are
deliberate so you can pause on the audit sheet rather than racing past it.

**Calibrate yourself first:** record a 20-second test of Part 1, count the words you actually said,
multiply by three. That is your real words per minute. Trust word count divided by your rate, never
a "this part feels like 20 seconds" guess.

**Format:** screen recording of the live app at `localhost:5173/app`, or the deployed
`https://baton-hack-2026.web.app/app`, plus your own voice-over, cut
with two Remotion cutaways that are **rendered and ready** in `demo/clips/`:
`why-not-a-chatbox.mp4` (14s, 1920x1080) and `the-split.mp4` (12s, 1920x1080). Both are silent, so
the voice-over plays over them. Narrate in **your own voice**, never an AI
voice-over: a judge in a previous event said outright that a synthetic narrator "feels less
genuine".

**Tone:** calm, specific, certain. You are a team lead showing the thing that catches what your
team drops. Every sentence finishes.

`[CAM]` you · `[SCREEN]` the live app · `[AMBI]` the Ambiguous workspace itself · `[ANIM]` a cutaway in `demo/clips/` · `[CAP]` a branded inset pill in `demo/captions/`, dropped in as picture-in-picture.

**British English. No em dashes. Hard 2:00.**

---

## PART 1 — Baton is a member of a real workspace (0:00 – 0:22)
**~22 seconds · 52 words**

**Note: the first shot is Ambiguous, NOT Baton.**

This was the weak point of the first draft. Narrating "this is a real Ambiguous workspace" over
Baton's own dashboard proves nothing, because a dashboard is only our UI and a judge cannot tell it
from a mock. So open **inside Ambiguous**, on the member list, where Baton appears as an agent
account with its own address next to the five people. That shot is un-fakeable, and it lands the
category claim in four seconds. Only then cut to Baton's board.

- `[AMBI: ~5s. app.ambiguous.ai, the Aldermere Bio workspace, Admin then People and access then Users. Baton is listed as type Agent at baton@aldermere.ambi.cc, alongside Frank, Sally, Priya, Tomas and Rachel. No cursor movement; just hold it.]`

- `[CAP: "Aldermere Bio is invented. The workspace and its records are real."]`

**Note: seven tasks, four risks. They are different numbers on purpose.**

If you show the Ambiguous task list, a judge sees **7 tasks** and then hears
"four things". Say the relationship out loud, because the gap is the product:
Baton is not counting tasks, it is judging which work is about to drop. Two of
the four are not even tasks. The sole-owner risk is about a **person**, and the
two unbooked deadlines are about **dates with nothing in the calendar against
them**. Discrimination is the point; a tool that flagged all seven would be a
task list with a red tint.

- `[SCREEN: cut to Baton's board, already open and settled. Do NOT film the load. The status bar reads webhooks live and aldermere.ambi.cc; the header reads Regulatory affairs, Aldermere Bio, 7 people, lead Rachel Foster.]`

> "Baton is a member of this team's workspace, with its own address, sitting alongside the five people it watches. This is its board. Nothing on it was typed by me: Baton read the seven tasks, the calendar and the people for itself, and out of all that it has flagged four things about to fall through the cracks."

---

## PART 2 — The risk that is invisible from inside any app (0:22 – 0:50)
**~26 seconds · 60 words**

**Note: click the SECOND card, not the first.**

A stalled task sits at the top scoring 99, because a stall's score climbs the
longer it sits and it will be pinned at the cap by recording time. The card you
want is the one below it: **"Priya is the only owner of 4 critical items", 82**.
The line below is written for that, and it turns the ordering into the point
rather than fighting it.

- `[SCREEN: click the sole-owner card, the second one. It expands. The graph dims to just her cluster, her node wearing its dashed sole-owner collar.]`

- `[SCREEN: open "Why this fired" so the rule line is legible on screen.]`

- `[CAP: "spof · 4 sole-owned critical items > 3 · betweenness 1.00 > 0.90"]`

> "The one that matters is not the late task at the top. Priya is the only person who can finish four items on the critical path, and her betweenness across the graph is one. That is not in any record. It is the shape of the work, so there is no document you could open that contains it. It is worth four thousand pounds if she is out for a week."

---

## PART 3 — THE WOW. It acts in the workspace, as itself. (0:50 – 1:24)
**~32 seconds · 67 words**

- `[SCREEN: the proposal is already visible on the open card. Click **Approve** once. The button goes to "Acting in the workspace", the card hands itself off to the right, the graph cools, health ticks up, and a row writes into the audit strip.]`

- `[AMBI: cut straight into the Ambiguous workspace and show the artefact Baton just made, live. Then open the Sheet named "Baton - action log" and show the row.]`

- `[CAP: "Nothing auto-sends. This happened because a person approved it."]`

> "I approve it. Baton acts in the workspace under its own identity, not mine, so this reads as a system reminder rather than a manager telling somebody off. Here is that same action inside Ambiguous, a minute old. Every action also writes a row into a sheet in the workspace, where the team being audited can read it. That sheet is the only place Baton stores anything."

---

## PART 4 — What the model does, and what it never does (1:24 – 1:47)
**~23 seconds · 56 words**

- `[SCREEN: press R. Drag `no_update_days`. The severities re-score in front of you. Then press / and click the suggestion "Send Sally a nudge", and let the refusal sit on screen for two full seconds.]`

- `[CAP: "It declines. The only route to an action is Approve."]`

> "The OpenAI model does the language work. It reads a thread, decides whether it is an ask, links a loosely named project, and writes the sentence a human will send. What it never decides is whether to act. Ask it a question and it answers from the graph; ask it to send something and it declines."

---

## PART 5 — The claim (1:47 – 1:57)
**~17 seconds · 41 words**

**Note on the rewrite.** Two earlier versions of this line hung on "every risk here is one you did
not think to ask", and it does not survive being said out loud. A team lead obviously does wonder
whether Sally has replied yet; that is the most normal thought in the job. So the line was
flattering the product by insulting the listener, and the moment you notice that, the whole beat
sounds false. The chatbot's problem was never that you failed to think of the question. It is that
it cannot see a single thing in your workspace, so it can only ever hand back good general advice.
That version is true, it is what the cutaway already shows, and it lands in one pass.

- `[ANIM: clips/why-not-a-chatbox.mp4 — rendered and ready, 14s at 1920x1080, silent. It runs longer than the words, which is fine: this is the one place in the film to let a shot breathe. Start it as you begin the line. Its first beat, the chat window answering correctly and uselessly, reads on its own in about 4s.]`

- `[If you need to claw back time, trim the clip's head by 4s and start on the graph assembling. The spoken line carries the beat either way.]`

> "This cannot exist in a chat window. Ask a chatbot how to stop work slipping and it gives you a correct, useless answer, because it cannot see your team. Baton can see it, and it does not wait to be asked."

---

## PART 6 — Close (straight out, or a 2s card)
**Card only. No voice-over.**

- `[ANIM: ../assets/readme/thumbnail.mp4 — the existing 8.7s hero. Use the last two seconds, the lockup and "Never drop the baton.", and let it settle. Speed up or trim so the film never crosses 2:00.]`

- `[CAP: "github.com/faith-ogun/baton"]`

---

## What each beat proves

| Beat | What the judge learns | Criterion |
|---|---|---|
| The Ambiguous member list with Baton on it | It is a member of a real workspace, not a dashboard over a mock | **Best Use of Ambiguous** |
| The live status bar and workspace address | It runs in a real environment | Core requirements |
| The single point of failure, with betweenness on screen | A risk that is genuinely invisible from inside one app | Innovation |
| Approve, then the artefact inside Ambiguous | The loop closes in the real workspace, not in our UI | Core requirements |
| The audit sheet in the workspace | Governed, logged, and readable by the audited team | Usefulness |
| The registry re-scoring live | Deterministic and inspectable, not a prompt | Technical execution |
| Ask declining to act | Read-only by construction, not by policy | Usefulness |
| The chatbot's correct, useless answer | The value cannot be reproduced in a chatbox | Innovation |

---

## Must-show checklist

- [ ] **The Ambiguous member list**, with Baton listed as an Agent at `baton@aldermere.ambi.cc`. This is the single most important shot in the film for the category prize
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

1. In Part 2, the clause "so there is no document you could open that contains it", which restates
   the sentence before it (~5s)
2. The head of the `why-not-a-chatbox` cutaway in Part 5, starting on the graph rather than the chat window (~4s)
3. The "sitting alongside the five people it watches" clause in Part 1 (~4s). **Never cut the member-list shot itself.**

**Never cut:** the Approve, the artefact inside Ambiguous, or the audit sheet. Those three are the
category. And never shorten a sentence to fit; drop a whole line from this list instead.

---

## Guardrails

**Warning: Approve is verified, but do NOT restart the backend once you start recording.**

The approve loop was proven end to end on live data: a real calendar event
`ab7f63f0-410c-4c23-853d-9868ace84dc9` was created in the workspace, the detector then stopped
firing because the workspace genuinely had a hold, and the row read back out of the sheet.
**But the audit timeline is in-memory.** A backend restart empties it while the sheet keeps its
rows, so restarting between the Approve and the audit-strip shot would show an empty timeline.
It is deliberately at zero rows right now so it fills live on camera.

**Warning: one click on Approve, not two.**

The calendar endpoint does **not** honour `Idempotency-Key`: two identical posts create two
events. The route now only accepts a risk in `open`, so a double click is refused rather than
duplicated, but do not lean on it. Click once and wait for the card to fly out.

- **The board carries 4 risks**, in this order: a stalled task pinned at **99**, the sole-owner at
  **82**, then the 13 and 14 September unbooked deadlines at **66** and **64**. Health around 51.
  The sole-owner risk is £4,160 of it. **Click the second card, not the first**; see the note in
  Part 2.
- **You can record against the deployed site instead of localhost if you prefer.**
  `https://baton-hack-2026.web.app/app` is live, reads `webhooks live` and pulls the same real
  workspace through Cloud Run. Localhost is still the safer bet for the Approve beat, because a
  cold Cloud Run instance can take a few seconds on the first request.
- **Approve a deadline card, not the sole-owner card.** The two calendar ones are proven end to end
  on live data. The sole-owner action reassigns Priya's task to Rachel and is verified at the field
  and id level but deliberately unfired, so it carries the residual risk of any untested path. If
  you want the sole-owner card as the hero, fire it once in rehearsal first and re-seed.
- **Do not narrate a live workspace over a seeded one.** If the status bar says `seeded workspace`,
  the dev server has not picked up `web/.env.local`; restart it.
- **Never say "deterministic" on camera.** Say "cannot go differently on a second run".
  And never say "most of this needs no model at all", which was the old Part 4 line. It is true and
  it is still a terrible thing to say in a room judging agents: it hands back the credit for the
  hardest part of the build. Name the model's job out loud instead. Reading a thread and deciding
  whether it is an ask, resolving "the Aldermere thing" to a project, and writing a sentence a
  manager is willing to put their name to are the parts a rule cannot do at all. The claim is a
  **division of labour**, not an absence of model: the model reads and writes, the registry decides.
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
