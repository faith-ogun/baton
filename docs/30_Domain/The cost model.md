---
title: "The cost model"
type: decision
status: current
tags: [type/decision, topic/cost-model]
last-reviewed: 2026-09-12
---

# The cost model

## The decision

The money figure is **derived from the reader's own inputs**, not borrowed from a market report.

## Why

A borrowed "£X billion lost to poor collaboration" statistic has three problems: it is unverifiable
on the spot, it ages badly between editions, and it invites an argument about the source at exactly
the moment you want agreement. A sum the reader dialled in themselves is one they **already
believe**, and if a judge asks where the number comes from, the honest answer is "your own four
inputs, and here they are on screen".

## The model

```
items dropped per month  x  days lost to each  x  blended day rate  x  12
```

Defaults of 6 items, 2.5 days and £520 give **£94k a year for a team of eight**. Every input is a
slider, and the multiplication is printed underneath the answer.

The same model runs inside the product: each risk declares `impact.days` **with its basis in
words**, and money is those days times `rules.cost_model.blended_day_rate_gbp`. So the header total
and each card's figure are the same arithmetic, not a separate marketing claim.

Seeded board: **82 person-days, £43.2k**. Per card: £21.8k open loop, £6.2k stall, £10.4k SPOF,
£3.1k unbooked deadline, £1.6k watch-level stall.

## What must not be over-claimed

> [!warning] Two things here are assumptions, not measurements
> The **70%** "share Baton's detectors are built to catch" is a coverage design claim. Say "built to
> catch", never "catches". The split across the four detectives (34 / 29 / 21 / 16) is modelled on
> the seeded workspace and is labelled as such on the page.

> [!warning] Two industry figures are unverified
> The Asana Anatomy of Work "~60% work about work" and the PMI "~$97m per $1bn" anchors are quoted
> from memory and both have moved between editions. Verify or cut before recording. They only
> anchor the *default* for "items dropped per month"; the argument does not rest on them.

## Related

- [[Demo facts]] · [[The risk engine and registry]] · [[The problem]] · [[MOC-domain]]
