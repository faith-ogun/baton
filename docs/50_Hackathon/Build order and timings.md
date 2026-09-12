---
title: "Build order and timings"
type: reference
status: current
tags: [type/reference, topic/judging]
last-reviewed: 2026-09-12
---

# Build order and timings

The planned timebox, and what actually happened against it.

| Window | Planned | Actual |
|---|---|---|
| 11:15 - 11:40 | scaffold plus Ambiguous connected | brand assets cut from the logo board, Vite scaffold, design tokens |
| 11:40 - 12:30 | ingest, graph, one detector | the whole front end: site plus dashboard, on the seeded workspace |
| 12:30 - 13:30 | the wow front end | rebuilt after review: routing fix, graph legibility, light and dark, tour mode |
| 13:30 - 14:15 | governed action, audit, real-time | approve loop verified end to end against the seeded state |
| 14:15 - 14:45 | second and third detector, polish | all four detectors seeded; landing diagrams and the cost model |
| 14:45 - 15:10 | **freeze features, record the video** | |
| 15:10 - 15:30 | submit. **By 15:30, not 15:29:59** | |

## The deviation worth recording

The plan front-loaded the backend and treated the front end as one block in the middle. It ran the
other way round: the front end was built first against a seeded workspace shaped to the wire
contract in `web/src/types.ts`, so the backend can drop in without touching a component.

That was the right call for two reasons. The front end is the **scored artefact**, and a seeded
workspace means the demo cannot fail because a server did not come up.

## If behind

Ship stalled-task plus open-loop only, one governed action, and the live graph. Cut in this order:
the rules drawer, SPOF, Cloud Run. See [[Scope guards]].

## Related

- [[Hackathon overview]] · [[Scope guards]] · [[MOC-hackathon]]
