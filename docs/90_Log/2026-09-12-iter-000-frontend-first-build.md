---
title: "iter-000 - front end first, on a seeded workspace"
type: log
status: done
tags: [type/log, topic/frontend]
last-reviewed: 2026-09-12
---

# iter-000 - front end first, on a seeded workspace

**Window:** 11:04 to 11:40 CEST

## What changed

- **Brand assets cut from the logo board** (`web/public/brand/`, `assets/readme/`). The cream
  background removed by flood-filling only the border-connected region, so the cream stripes inside
  the figure survive; the anti-aliased edges unpremultiplied against the cream so they stay clean on
  any ground. A reverse cut of mark and lockup for dark grounds. Favicons and an OG card.
- **Vite + React 19 + Tailwind 4** scaffold in `web/`, not Next. See [[System architecture]].
- **Design tokens** in `web/src/index.css`, six colours off the board plus a three-stop risk scale
  deliberately not sharing the brand orange's hue.
- The **whole front end**: marketing site and the mission-control dashboard, against a seeded
  workspace in `web/src/app/mock.ts` shaped to the wire contract in `web/src/types.ts`.

## What broke, and what it turned out to be

**Reveal-on-scroll left whole sections invisible.** An IntersectionObserver only reports elements
whose intersection it actually samples, so an instant jump down the page, which is exactly what the
nav's own anchor links do, can carry an element from below the fold to above it without ever firing.
Those sections then sit at opacity 0 permanently. Replaced with a rAF-throttled sweep, which cannot
miss: anything at or above the trigger line is revealed whether it was scrolled past or skipped.

## What was learned

Building the front end first against a seeded workspace was the right inversion of the plan. The
front end is the scored artefact, and the seed means the demo cannot fail on a cold server.

## Left open

- the FastAPI backend (Faith)
- Ambiguous provisioning and webhooks (Faith)

## Related

- [[System architecture]] · [[The naming and brand]] · [[Build order and timings]]
