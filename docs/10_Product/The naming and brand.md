---
title: "The naming and brand"
type: decision
status: current
tags: [type/decision, topic/branding]
last-reviewed: 2026-09-12
---

# The naming and brand

## The decision

**Baton.** Slogan: *Never drop the baton.* The mark is Hermes, winged, mid-stride, taking a baton
from an outstretched hand against an orange sun with a Greek key border.

## Why

A relay baton is the exact object the product is about. The failure mode of a relay is not slowness,
it is the **hand-off**, which is precisely Baton's four detectors. "Never drop the baton" is a
sentence a judge already understands before you explain anything.

Hermes carries the second meaning for free: the messenger, the one who carries things between
people. The product is a courier for accountability.

## The palette, off the logo board

| Token | Hex | Role |
|---|---|---|
| Primary navy | `#0F2238` | ink, and the dark ground |
| Accent orange | `#C96A3D` | Baton's own voice. Primary actions, one highlighted word per headline, the baton rule |
| Background cream | `#F3EEE4` | paper, and the light-on-dark ink |
| Neutral grey | `#8A96A3` | metadata and timestamps |
| Accent blue | `#5E8FA8` | people and neutral structure |
| Accent purple | `#7A6FF0` | **only ever "Baton did this"**: audit rows, its identity chip, the approved-action flash |

## The risk scale is deliberately not the brand orange

`ok #2E7D5B` · `warn #D9A441` · `risk #C2402F`

A red sharing the orange's hue would make "at risk" and "primary action" read as the same signal, on
a screen whose entire job is telling you what is on fire. The red is cooler and deeper so the two
never collide.

## The signature move

A **baton rule**: a 3px orange bar with round caps, marking every section opening and every active
tab. One piece of ornament that earns its place. All motion travels **left to right**, because the
product is a hand-off and it should read as one.

## Asset production

The board arrived as a single PNG, so the usable assets were cut out of it:

- the cream background removed by flood-filling only the **border-connected** region, so the cream
  stripes *inside* the figure survive
- the anti-aliased edge pixels **unpremultiplied** against the cream, so edges stay clean on any
  ground instead of carrying a pale fringe
- a **reverse cut** of both mark and lockup, swapping the navy/cream axis and holding the orange,
  because the navy figure vanishes against the navy dashboard

Outputs in `web/public/brand/` and `assets/readme/`.

## Related

- [[What Baton is]] · [[The theme decision]] · [[MOC-product]]
