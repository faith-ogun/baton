---
title: "The graph layer"
type: architecture
status: current
tags: [type/architecture, topic/graph, topic/frontend]
last-reviewed: 2026-09-12
---

# The graph layer

## What it does

Draws the workspace as a live force-directed graph: people and work items as nodes, who-owes-whom as
edges. It is the centrepiece of the demo, so most of the engineering here is legibility rather than
layout. `web/src/app/GraphCanvas.tsx`.

## The decision that fixed it: type and risk are separate channels

The first version encoded **risk in colour and nothing else**, which meant nothing on screen told
you whether a red blob was a person or an email. Faith's exact words were that it looked like
coloured blobs, which is also the criticism of [[Spine]]'s graph.

Now:

| Channel | Carries |
|---|---|
| **shape** | circle for a person, rounded square for work, wide rounded square for a project |
| **glyph** | initials for a person; envelope = thread, tick = task, clock = deadline, layers = project |
| **ring** | the three-stop risk scale, `ok` / `warn` / `risk` |
| **fill** | the surface colour, so the ring is the only strong colour in the frame |
| **dashed collar** | a sole owner, i.e. the single point of failure, drawn |

You can read what a node **is** without decoding how bad it is, and the other way round.

## Keeping the layout across a state change

The simulation objects live in a ref and are **mutated in place**. Replacing them on every state
change would fling the layout apart on every webhook. The array identity changes only when the
membership does, and that re-warm is deliberately the animation the demo is built around.

No repaint call is needed after a field change: force-graph runs its render loop continuously and
only stops *ticking the layout* when it cools.

## Label placement, which took three attempts

Labels are painted in a **second pass** after every node, so a node can never land on a neighbour's
label. Then:

- **eight candidate positions** per label, four cardinals and four diagonals, in preference order
- another **label vetoes** a position outright: two names on top of each other are worse than one
- a **node circle only ranks** it. At high zoom a label is wide enough in graph units that every
  position crosses something, so treating that as fatal silently deletes the whole layer, which is
  exactly what happened on attempt two
- the **visible rectangle is a hard boundary**, or an edge node's label reaches out of frame and
  gets sliced in half
- the halo behind the text is `5.5 / scale` wide, enough to knock out an **edge** passing behind a
  name. Too thin and a link runs through a label like a strikethrough

People and projects are placed first, so if something must go unlabelled it is a task, never a
person's name.

## Two measured bugs worth remembering

> [!warning] Units
> The label font floor was `Math.max(8.5, 10 / scale)`. Dividing by the scale is what keeps a label
> a constant size in **screen pixels**; the `8.5` floor was in **graph units**, so at a zoom of 2.2
> it forced labels to about 19 real pixels and they dwarfed the nodes. There is no floor to apply:
> labels simply stop being drawn below 0.45 zoom.

> [!warning] Aspect ratio
> Left alone, the forces settle into a roughly **circular** cloud. Measured: 201 x 202 graph units
> in a pane of 1035 x 572. Zoom-to-fit can only fit the binding dimension, so it filled 78% of the
> height and **43% of the width**, leaving over half the canvas empty and the graph zoomed in
> further than it needed. Fixed with `forceX` / `forceY` weighted by the pane's own aspect ratio,
> which flattens the cloud to the shape of the space it lives in.
>
> Both were found by **measuring in the browser**, not by looking at screenshots. `getGraphBbox()`
> and `zoom()` off the force-graph handle gave the answer in one call each.

## Related

- [[System architecture]] · [[Spine]] · [[The theme decision]] · [[MOC-architecture]]
