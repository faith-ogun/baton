---
title: "Demo facts"
type: reference
status: current
tags: [type/reference, topic/demo, topic/cost-model]
last-reviewed: 2026-09-12
---

# Demo facts

Everything a judge could challenge, sorted into what it actually is. British English,
no em dashes.

> [!warning] Two figures need verifying before you record
> The industry anchors in the "what it is worth" section are quoted from memory and
> are **not** verified. Check them or cut them. Nothing else on the page depends on
> them; the headline money figure is the reader's own arithmetic.

---

## 1. Invented, and said so on screen

| Thing | Status |
|---|---|
| **Aldermere Bio** | Invented company. Chosen to sound like a real biotech without colliding with one. Stated as invented in the footer. |
| **Sentrix** | Invented drug name, hence "the Sentrix filing". |
| **Frank Bouvier, Sally Ahmed, Priya Raman, Tomas Lind, Rachel Foster** | Invented people. |
| `aldermere.ambi` | The seeded workspace. |

The earlier draft used **Moderna**, a real company, against an invented regulatory
failure. That is a live reputational claim about a real business and it is gone.

---

## 2. Derived, and the arithmetic is on screen

**This is the important one.** The money figure is not a market statistic, it is the
reader's own sum, run in front of them:

```
items dropped per month  x  days lost to each  x  blended day rate  x  12
```

Defaults are 6 items, 2.5 days, £520, which gives **£94k a year for a team of eight**.
Every input is a slider, the multiplication is printed under the answer, and the
per-risk figures in the dashboard come from the same model: each risk declares
`impact.days` with its basis in words, and the money is days times the rate in
`rules.cost_model`.

The seeded board therefore totals **82 person-days, £43.2k**, and each card shows its
own share (£21.8k for the open loop, and so on).

Why it is built this way: a borrowed "£X billion lost to poor collaboration" number is
unverifiable, ages badly, and invites an argument about the source. A sum the judge
dialled in themselves is one they already believe. If asked "where does that number
come from", the honest answer is "your own four inputs, and here they are".

**The 70% "share Baton's detectors catch" is a modelling assumption, not a measurement.**
Say "built to catch", never "catches". Same for the split across the four detectors,
which is modelled on the seeded workspace and labelled as such on the page.

---

## 3. NOT verified. Check or cut before recording.

Both sit in the one attributed paragraph under the calculator, and both are quoted
from memory:

1. **Asana, Anatomy of Work Index: ~60% of the working day goes on "work about work".**
   Asana has published this index for several years and the figure has moved between
   editions. Check the current one and quote the year, or cut the clause.
2. **Project Management Institute: ~$97m wasted per $1bn invested, from poor project
   performance.** This is a real PMI Pulse of the Profession figure but it is from an
   older edition and the number has changed between years. Check the year, or cut it.

If either cannot be checked in time, delete the whole anchor block. The page stands
without it; the derived figure is the argument.

---

## 4. Honest limitations to state, not hide

- **The demo runs on a seeded workspace.** The header says `seeded workspace` rather
  than pretending to be live, and flips to `webhooks live` only when the backend is
  actually answering. Do not narrate "connected to a live workspace" over the seeded
  state.
- **The 70% catch rate is a design claim about coverage**, not a measured result.
- **Betweenness 0.96 and "4 sole-owned critical items"** are properties of the seeded
  graph, and they are real properties of it, computed the way the registry says. They
  are not claims about a real team.
- **Nothing auto-sends, and there is no mode that changes that.** This is true and is
  the strongest governance line. Do not soften it into "you can configure it".
- **Cloud Run is a stretch.** The demo runs locally. Narrate what is on screen.

---

## 5. Scope, and why it is the answer to "who uses this"

Baton is scoped to **one workstream and its lead**, not to a company. The argument is
structural rather than a product preference: Baton's output is always a message or a
change with a person's name on it, so the approver needs the standing to send it. A
chief executive cannot approve "Sally, this is the last working day this can move" to
somebody three levels down; it lands as a summons. A director who owns three teams gets
a switcher across three boards, not a merged view.

This is why the whole-company view is drawn with a cross through it in the "who this is
for" diagram rather than being sold as the flagship feature.

## Related

- [[The cost model]] · [[Scope guards]] · [[MOC-deliverables]]
