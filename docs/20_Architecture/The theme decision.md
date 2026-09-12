---
title: "The theme decision"
type: decision
status: current
tags: [type/decision, topic/frontend]
last-reviewed: 2026-09-12
---

# The theme decision

## The decision

The marketing site is **light only**. The dashboard is themed **light and dark and defaults to
light**.

## Why

The original build made the dashboard dark-only on the reasoning that mission control should be
dark. Faith's verdict on seeing it: it did not look nice. Light is also the better default for a
demo, which is usually shown in a bright room, and the density of a dense screen should come from
hierarchy rather than from turning the lights off.

The site stays light because it is an editorial page that lives in the logo board's own world, cream
and navy. Theming it would double the token surface for no gain.

## How it works

One attribute, `data-app-theme`, on `<html>`, set by `web/src/lib/theme.ts`. The app's surface
tokens carry their **light** values in `@theme`; the dark block overrides the same custom
properties. So every utility (`bg-panel`, `border-hair`, `text-dim`) re-themes with no second class
name anywhere in the components.

The attribute goes on `<html>` rather than the shell so anything rendered outside the shell's
subtree, a toast or the tour spotlight, themes with it.

## Two traps this walked into

> [!warning] Invert the tinted surfaces too
> The first dark cut left `agent-soft`, `accent-soft` and friends at their light values, so a panel
> meant to be a pale wash **behind dark text** became a pale slab behind pale text. The proposal box
> and the top row of the audit trail were unreadable. Every `soft` now has a dark value, and every
> `ink` (which exists to be legible on a light wash) becomes its `lift` cut.

> [!warning] The site needed its own dark-band tokens
> The marketing page's navy bands were borrowing the app's surface tokens. The moment the dashboard
> defaulted to light, `border-hair` became a **cream hairline drawn across navy**. Fixed with a
> separate fixed scale, `onink-panel` / `onink-line`, that never flips.

## Related

- [[The naming and brand]] · [[The graph layer]] · [[MOC-architecture]]
