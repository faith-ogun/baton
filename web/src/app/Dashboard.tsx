import { useState } from 'react';
import { Link } from '../lib/router';
import { Mark } from '../brand/Mark';
import { Chip } from '../ui/ui';
import { CheckIcon, WebhookIcon } from '../ui/icons';
import { useWorkspace } from './api';
import { AuditTimeline } from './AuditTimeline';
import { GraphCanvas } from './GraphCanvas';
import { RiskCard } from './RiskCard';
import { RulesDrawer } from './RulesDrawer';

/** Org health, 0-100. A ring plus a number: cheap to compute, big payoff. */
function Health({ score }: { score: number }) {
  const colour = score >= 75 ? 'var(--color-ok)' : score >= 45 ? 'var(--color-warn)' : 'var(--color-risk)';
  const C = 2 * Math.PI * 15;
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative size-9">
        <svg viewBox="0 0 36 36" className="-rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-hair)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke={colour}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - score / 100)}
            style={{ transition: 'stroke-dashoffset .7s var(--ease-out-quint), stroke .4s' }}
          />
        </svg>
      </div>
      <div className="leading-none">
        <p className="num text-[1.0625rem]" style={{ color: colour }}>
          {score}
        </p>
        <p className="mt-1 font-mono text-[0.625rem] tracking-[0.08em] text-ink-4">ORG HEALTH</p>
      </div>
    </div>
  );
}

const LEGEND = [
  ['person', 'circle'],
  ['task', 'square'],
  ['thread', 'diamond'],
  ['deadline', 'triangle'],
] as const;

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hair bg-panel px-4 py-2.5">
      <div className="flex items-center gap-3">
        {/* Spelled out rather than templated, so Tailwind's scanner sees them. */}
        {(
          [
            ['bg-ok', 'clear'],
            ['bg-warn', 'watch'],
            ['bg-risk', 'at risk'],
          ] as const
        ).map(([dot, label]) => (
          <span key={label} className="flex items-center gap-1.5 font-mono text-[0.625rem] text-ink-4">
            <span className={`inline-block size-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>
      <span className="h-3 w-px bg-hair" />
      <div className="flex items-center gap-3">
        {LEGEND.map(([kind, glyph]) => (
          <span key={kind} className="font-mono text-[0.625rem] text-ink-4">
            <span className="text-paper-3/70">{glyph}</span> {kind}
          </span>
        ))}
      </div>
      <span className="h-3 w-px bg-hair" />
      <p className="font-mono text-[0.625rem] text-ink-4">
        <span className="text-accent-lift">dashed collar</span> sole owner ·{' '}
        <span className="text-agent-lift">purple</span> Baton
      </p>
    </div>
  );
}

export function Dashboard() {
  const {
    state,
    openRisks,
    visibleRisks,
    approve,
    dismiss,
    trigger,
    rescore,
    toasts,
    selected,
    setSelected,
  } = useWorkspace();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="app-shell flex h-dvh flex-col overflow-hidden bg-void text-paper">
      {/* header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-hair bg-panel px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <Mark size={26} reverse />
          <span className="display-tight text-[1.125rem] text-paper">Baton</span>
        </Link>

        <span className="hidden items-center gap-2 sm:flex">
          <span className="h-5 w-px bg-hair" />
          <span className="font-mono text-[0.6875rem] tracking-[0.06em] text-ink-4">
            {state.workspace}
          </span>
          <Chip tone={state.connected ? 'ok' : 'onInkAccent'}>
            <span
              className={`bt-pulse inline-block size-1.5 rounded-full ${
                state.connected ? 'bg-ok' : 'bg-accent-lift'
              }`}
            />
            {state.connected ? 'webhooks live' : 'seeded workspace'}
          </Chip>
        </span>

        <div className="ml-auto flex items-center gap-3">
          <Health score={state.health} />
          <span className="hidden h-8 w-px bg-hair sm:block" />
          <button
            type="button"
            onClick={trigger}
            className="inline-flex items-center gap-1.5 rounded-full border border-hair-2 px-3.5 py-2 text-[0.8125rem] text-paper-3/85 transition-colors hover:border-accent-lift/60 hover:text-paper"
            title="Replays the webhook path with an inbound mail from the agency"
          >
            <WebhookIcon size={15} />
            <span className="hidden sm:inline">Inbound event</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRules((s) => !s)}
            className={`rounded-full border px-3.5 py-2 text-[0.8125rem] transition-colors ${
              showRules
                ? 'border-accent-lift/60 bg-accent-lift/10 text-accent-lift'
                : 'border-hair-2 text-paper-3/85 hover:border-paper-3/50 hover:text-paper'
            }`}
          >
            Rules
          </button>
        </div>
      </header>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            {/* the graph */}
            <section className="flex min-w-0 flex-1 flex-col border-r border-hair">
              <div className="relative min-h-0 flex-1">
                <div className="pointer-events-none absolute top-3 left-4 z-10">
                  <p className="kicker text-paper-3/60">workspace graph</p>
                  <p className="mt-1 font-mono text-[0.6875rem] text-ink-4">
                    {state.graph.nodes.length} nodes · {state.graph.edges.length} edges ·{' '}
                    {state.graph.edges.filter((e) => e.open).length} open
                  </p>
                </div>
                <GraphCanvas
                  nodes={state.graph.nodes}
                  edges={state.graph.edges}
                  selected={selected}
                  onSelect={setSelected}
                />
              </div>
              <Legend />
            </section>

            {/* the queue */}
            <section className="flex w-[390px] shrink-0 flex-col border-r border-hair bg-void/40">
              <div className="flex items-center gap-2.5 border-b border-hair px-4 py-3">
                <span className="baton-rule w-5" />
                <span className="kicker text-paper-3/70">drop risk</span>
                <span className="ml-auto font-mono text-[0.6875rem] text-ink-4">
                  {openRisks.length} open
                </span>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {visibleRisks.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
                    <span className="inline-flex size-11 items-center justify-center rounded-full bg-ok/15 text-ok">
                      <CheckIcon size={22} />
                    </span>
                    <p className="text-[0.9375rem] font-medium text-paper">Nothing is dropping.</p>
                    <p className="text-[0.8125rem] leading-[1.6] text-paper-3/60">
                      Baton is still watching. The next webhook, or the 45-second sweep, will put
                      anything new here.
                    </p>
                  </div>
                ) : (
                  visibleRisks.map((r) => (
                    <RiskCard
                      key={r.id}
                      risk={r}
                      selected={selected != null && r.nodes.includes(selected)}
                      onSelect={() => setSelected(selected === r.nodes[0] ? null : r.nodes[0])}
                      onApprove={() => approve(r.id)}
                      onDismiss={() => dismiss(r.id)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* the audit strip */}
          <section className="h-[212px] shrink-0 border-t border-hair bg-panel">
            <AuditTimeline entries={state.audit} />
          </section>
        </div>

        {showRules && (
          <RulesDrawer rules={state.rules} onChange={rescore} onClose={() => setShowRules(false)} />
        )}
      </div>

      {/* toasts */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bt-pass flex items-start gap-2.5 rounded-xl border border-agent/35 bg-panel px-4 py-3 shadow-panel"
          >
            <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-agent/20 text-agent-lift">
              <CheckIcon size={13} />
            </span>
            <div>
              <p className="text-[0.8125rem] font-medium text-paper">{t.title}</p>
              <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-4">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
