---
title: "The risk engine and registry"
type: architecture
status: current
tags: [type/architecture, topic/risk-engine, topic/rules-registry]
last-reviewed: 2026-09-12
---

# The risk engine and registry

## What it does

Scores every detected risk 0 to 100 from thresholds in a single readable registry, ranks the queue,
and derives team health. `web/src/app/api.ts` mirrors it on the front end; `risk.py` owns it once
the backend lands.

## The registry

```yaml
open_loop_ask:   { unanswered_business_days: 3, escalate_if_deadline_within_days: 2 }
stalled_task:    { no_update_days: 5, at_risk_if_due_within_days: 3 }
deadline:        { require_calendar_hold: true, warn_within_days: 3 }
spof:            { max_sole_critical_items: 3, betweenness_percentile: 0.9 }
severity_weights:{ deadline_proximity: 0.5, seniority: 0.2, thread_age: 0.3 }
cost_model:      { blended_day_rate_gbp: 520 }
```

Exposed in the UI as a drawer with live sliders. Moving `no_update_days` from 5 to 2 re-scores the
stalled risks from 83 and 44 to **95 and 56**, verified in the browser. The drawer is the
inspectability claim made physical: there is nothing to take on trust.

## The decision: the registry produces the seeded numbers

The severities started hand-authored (92, 84, 78, 61, 44) while the scoring function computed
different ones. That is a **demo-breaking inconsistency**: the first slider touch would have jumped
the top card from 92 to 99 on camera and a judge would rightly ask which number was real.

The fix was to retune the scoring constants until the registry *produces* the authored numbers, and
to score once at init so the first paint already agrees with the file. Current output on the seeded
board: **92, 83, 78, 61, 44**, and the inbound live risk at **98**.

## The one fact the formula could not see

The inbound agency request scored 82, below two existing risks, so it would not have topped the
queue at the moment of the live webhook. Its distinguishing fact is that it has **no assignee at
all**, which was not in the model. Added `unowned` to the risk shape and a term for it, which puts
it at 98 and at the top, honestly, for a stated reason.

## Health

```
100 - (worst single severity x 0.35) - (sum of open severities x 0.045)
```

The worst risk sets the tone; the rest of the queue adds weight. One fire is bad, five is worse, and
clearing any of them has to visibly move the number. Seeded board: **52**. After the whole queue is
approved: **98**.

## Related

- [[The deterministic and LLM split]] · [[The cost model]] · [[System architecture]] · [[MOC-architecture]]
