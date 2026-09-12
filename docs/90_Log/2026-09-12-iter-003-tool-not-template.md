---
title: "iter-003 - make it a tool, not a template"
type: log
status: done
tags: [type/log, topic/frontend]
last-reviewed: 2026-09-12
---

# iter-003 - make it a tool, not a template

**Window:** 12:30 to 13:10 CEST

Faith's verdict on the second workspace: *"it just has the tell-tale signs of AI slop, you know?"*
Not that it was bad, but that nothing about it was specific to this product. That is the most
useful piece of feedback in the build so far, so this note records what the tells actually were.

## What the tells were

Every one of these is a thing a generator reaches for and a working tool does not:

| Tell | What a real tool does |
|---|---|
| five identical fat cards, all fully expanded | a dense list you scan, with one item open at a time |
| one radius (`rounded-2xl`) and a soft shadow on everything | tight radii, hairlines, and shadow reserved for things that actually float |
| uniform padding everywhere | density where you scan, space where you decide |
| chips for every piece of metadata | a monospace meta line, and chips only for state |
| nothing resizable, nothing keyboard-driven | panes you can drag, a queue you can work with `j` `k` `a` |
| no status bar, no counts, no affordances | a footer that says what is connected and how to get help |

## What changed

- **The queue is a master/detail list.** `RiskRow` replaces `RiskCard`: two scannable lines with a
  severity spine down the left edge, expanding in place. One open at a time, and opening a row
  selects its nodes in the graph, so the two panes are one idea rather than two.
- **A draggable split** between the graph and the queue (`useSplit.ts`), persisted. The grab area
  is 13px of transparent nothing centred on a 1px hairline, because a 1px target is unhittable.
- **A graph toolbar** with a zoom slider, a fit button and a names toggle. Faith asked for this
  directly: a graph you cannot resize is a picture.
- **Keyboard control** with a `?` overlay: `j` `k` to move, `a` approve, `d` dismiss, `e` inbound
  event, `r` rules, `f` fit, `[` `]` resize, `g` theme, `t` tour. The shortcuts are printed on the
  buttons, so they are discoverable rather than folklore.
- **A status bar**: connection, workspace, sweep interval, the glyph legend, and the help hint.
  The legend moved here out of the canvas, where it used to sit on top of the graph.
- Header collapsed to 44px, geometry tightened throughout.

## What broke, and what it turned out to be

> [!warning] Scroll events are not guaranteed to arrive
> Reveal-on-scroll was leaving whole sections of the marketing page invisible, which Faith spotted
> as "weird random sections where there's nothing". Measured: `window.scrollY` moved from 0 to
> 3177 with **zero** scroll events delivered on either `window` or `document`. So the
> scroll-driven sweep from iter-000 never ran, and 0 of 29 elements had been revealed, including
> ones already scrolled past.
>
> The fix is the third attempt at this: an IntersectionObserver for the common case, **plus** a
> 150ms interval that re-checks the whole pending set and stops itself once nothing is left. The
> observer makes entry feel instant; the interval is the part that cannot miss, because it does not
> care how the viewport got where it is. See `web/src/lib/useReveal.ts`, where the reasoning is
> written down so attempt four does not happen.

Also fixed: the SPOF diagram's footnote ran outside its card (54 characters of mono at 8.5 units in
a 280-unit box), and `overflow: visible` on the diagrams let it paint there. Both gone.

The footer set the lockup at 248px against three short link columns, which left a tall empty band
down the right of the page. Four columns of roughly equal height, mark at 168px.

## What was learned

"Looks AI-generated" is not a vague aesthetic complaint, it decomposes into a specific list of
missing affordances. Everything above is something a person would have asked for on day two of
using the thing.

## Left open

- the two unverified industry figures (Faith)
- the demo script and the submission text
- the backend

## Related

- [[The graph layer]] · [[The theme decision]] · [[Demo facts]]
