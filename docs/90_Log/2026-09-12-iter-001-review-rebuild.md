---
title: "iter-001 - the review rebuild"
type: log
status: done
tags: [type/log, topic/frontend, topic/graph]
last-reviewed: 2026-09-12
---

# iter-001 - the review rebuild

**Window:** 11:40 to 12:20 CEST

Faith reviewed the first build and gave a long list. This is that list, closed.

## What changed

- **Routing.** One cause, three reported symptoms. See [[The routing bug]].
- **The graph.** Type and risk split onto separate visual channels; circles with initials for
  people, glyphs for work. See [[The graph layer]].
- **Light and dark** for the dashboard, defaulting to light. See [[The theme decision]].
- **The workspace UI**, rebuilt: cards lead with what is wrong, what it costs and the fix, with the
  evidence behind a *Why this fired* disclosure. A scope selector in the header naming the org, the
  team and the lead.
- **Tour mode** (`web/src/app/Tour.tsx`), six steps, a spotlight cut out of a dim veil so the real
  graph keeps simulating underneath. Modelled on Unravel's guided tour.
- **The cost model.** Person-days per risk with the basis in words, money derived. See
  [[The cost model]].
- **The landing page**, rebuilt around four purpose-drawn mechanism diagrams rather than icons
  beside paragraphs (`web/src/landing/diagrams.tsx`). The test each has to pass: someone reading
  the picture and none of the words can say what Baton noticed.
- **Moderna removed.** A real company against an invented regulatory failure is a live claim about
  a real business. Now Aldermere Bio filing Sentrix, both invented and stated as invented.
- **The Vite dev proxy dropped.** It spewed `ECONNREFUSED` on every page load with no backend,
  burying real errors. `VITE_API_BASE` now gates the network entirely.
- **Amara Okafor renamed to Rachel Foster**, at Faith's request, for a more common name.

## What broke, and what it turned out to be

Three of these were genuinely instructive:

1. **Labels dwarfing the nodes.** The font floor `Math.max(8.5, 10 / scale)` mixed units: the
   divide-by-scale keeps a label constant in *screen pixels*, but the floor was in *graph units*, so
   at zoom 2.2 it forced about 19 real pixels.
2. **Half the canvas empty.** The force layout settled into a circular cloud, measured at 201 x 202
   graph units, inside a pane of 1035 x 572. Zoom-to-fit can only fit the binding dimension, so it
   filled 78% of the height and 43% of the width. Fixed with `forceX` / `forceY` weighted by the
   pane's aspect ratio.
3. **Dark mode unreadable in two places.** The tinted `*-soft` surfaces kept their light values, so
   a pale wash meant for dark text became a pale slab behind pale text. Separately, the marketing
   page's navy bands were borrowing the app's now-light surface tokens and drawing cream hairlines
   across navy.

Both graph bugs were found by **measuring in the browser**, `getGraphBbox()` and `zoom()` off the
force-graph handle, after two rounds of guessing from screenshots had made it worse.

## What was learned

> [!info] Measure before tuning a layout
> Two rounds were spent adjusting charge and collision strength on the theory that the graph was too
> cramped. It was not: it was zoomed *in* at 2.2 and the wrong shape for the pane. One measurement
> would have skipped both rounds.

Also: a severity number that the registry does not reproduce is a demo-breaking inconsistency, not a
cosmetic one. The hand-authored severities disagreed with the scoring function, so the first slider
touch on camera would have jumped the top card from 92 to 99. See
[[The risk engine and registry]].

## Left open

- the two unverified industry figures in the cost section (Faith to verify or cut)
- the demo video and the submission text
- the backend

## Related

- [[The graph layer]] · [[The routing bug]] · [[The theme decision]] · [[Demo facts]]
