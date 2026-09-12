import { Chip, Container, Kicker, SectionHead } from '../ui/ui';

const RULES_YAML = `open_loop_ask:
  unanswered_business_days: 3
  escalate_if_deadline_within_days: 2

stalled_task:
  no_update_days: 5
  at_risk_if_due_within_days: 3

deadline:
  require_calendar_hold: true
  warn_within_days: 3

spof:
  max_sole_critical_items: 3
  betweenness_percentile: 0.9

severity_weights:
  deadline_proximity: 0.5
  seniority: 0.2
  thread_age: 0.3`;

const SPLIT = [
  {
    tone: 'ink' as const,
    label: 'Deterministic',
    sub: 'rules and the graph',
    items: [
      'Every detection and every severity score',
      'Who is involved, what is late, by how much',
      'Which structural action is proposed',
      'The ranking of the queue',
      'The audit trail',
    ],
  },
  {
    tone: 'agent' as const,
    label: 'The model',
    sub: 'OpenAI Agents SDK',
    items: [
      'Is this message an ask, and to whom',
      'Does "the Sentrix thing" mean this project',
      'The wording of the nudge a human will read',
    ],
  },
];

export function Governance() {
  return (
    <section id="governance" className="border-y border-line bg-paper py-20 sm:py-24">
      <Container>
        <SectionHead
          kicker="governance"
          title={
            <>
              An agent you can{' '}
              <em className="display-em text-accent-mid">audit</em> is an agent you can leave
              running.
            </>
          }
          lede="The model never decides whether to act. It never decides who is at risk, or how badly. It writes sentences, and a rule you can read decides everything else."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {SPLIT.map((col) => (
              <div
                key={col.label}
                className={`reveal rounded-2xl border p-6 shadow-paper ${
                  col.tone === 'agent' ? 'border-agent/25 bg-agent-soft/45' : 'border-line bg-card'
                }`}
              >
                <div className="flex items-baseline gap-2.5">
                  <h3 className="display-tight text-[1.25rem]">{col.label}</h3>
                  <span className="font-mono text-[0.6875rem] text-ink-3">{col.sub}</span>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {col.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-[0.9375rem] leading-[1.55] text-ink-2">
                      <span
                        className={`mt-[0.45rem] inline-block size-1.5 shrink-0 rounded-full ${
                          col.tone === 'agent' ? 'bg-agent' : 'bg-accent'
                        }`}
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* the registry, shown rather than described */}
          <div className="reveal overflow-hidden rounded-2xl border border-line bg-ink shadow-lift">
            <div className="flex items-center gap-3 border-b border-onink-line px-5 py-3.5">
              <Kicker tone="paper">rules.yaml</Kicker>
              <span className="ml-auto">
                <Chip tone="onInk">tunable, live</Chip>
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[0.8125rem] leading-[1.75] text-paper-3/90">
              <code>{RULES_YAML}</code>
            </pre>
            <p className="border-t border-onink-line px-5 py-4 text-[0.875rem] leading-[1.6] text-paper-3/70">
              This file is the whole of Baton&rsquo;s judgement about what counts as dropped. Move a
              number and the queue re-scores in front of you. There is no second, hidden set of
              thresholds inside a prompt.
            </p>
          </div>
        </div>

        <div className="reveal mt-5 grid gap-5 sm:grid-cols-3">
          {[
            ['Nothing auto-sends', 'Every action is a draft until a person approves it. There is no mode that changes this.'],
            ['Recipients confirmed server-side', 'The approval names the exact address. An idempotency key means a retry can never double-send.'],
            ['Its own identity', 'Baton acts as Baton, with its own permissions, so no message ever appears to come from you.'],
          ].map(([h, b]) => (
            <div key={h} className="rounded-2xl border border-line bg-card p-5 shadow-paper">
              <h4 className="text-[0.9375rem] font-semibold">{h}</h4>
              <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-2">{b}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
