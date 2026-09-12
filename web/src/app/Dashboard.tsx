import { useState } from 'react';
import { Link } from '../lib/router';
import { usePalette, useTheme } from '../lib/theme';
import { Mark } from '../brand/Mark';
import { Chip } from '../ui/ui';
import { CheckIcon, WebhookIcon } from '../ui/icons';
import { ChevronIcon, CompassIcon, CoinIcon, MoonIcon, SunIcon } from '../ui/theme-icons';
import { money, useWorkspace } from './api';
import { AuditTimeline } from './AuditTimeline';
import { GraphCanvas } from './GraphCanvas';
import { RiskCard } from './RiskCard';
import { RulesDrawer } from './RulesDrawer';
import { Tour } from './Tour';

/** Org health, 0-100. A ring plus a number: cheap to compute, big payoff. */
function Health({ score }: { score: number }) {
  const colour = score >= 75 ? 'var(--color-ok)' : score >= 45 ? 'var(--color-warn)' : 'var(--color-risk)';
  const C = 2 * Math.PI * 15;
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative size-10">
        <svg viewBox="0 0 36 36" className="-rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-hair)" strokeWidth="3.2" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke={colour}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - score / 100)}
            style={{ transition: 'stroke-dashoffset .7s var(--ease-out-quint), stroke .4s' }}
          />
        </svg>
      </div>
      <div className="leading-none">
        <p className="num text-[1.125rem]" style={{ color: colour }}>
          {score}
        </p>
        <p className="mt-1 font-mono text-[0.5625rem] tracking-[0.1em] text-dim">TEAM HEALTH</p>
      </div>
    </div>
  );
}

/**
 * The scope selector. Baton answers to one workstream's lead, so the header
 * says whose board this is; a director who owns several teams switches here.
 */
function Scope({
  scope,
  open,
}: {
  scope: import('../types').Scope;
  open: number;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative" data-tour="scope">
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="flex items-center gap-2.5 rounded-xl border border-hair bg-panel px-3 py-2 text-left transition-colors hover:border-hair-2"
      >
        <span className="leading-tight">
          <span className="block text-[0.8125rem] font-semibold text-strong">{scope.team}</span>
          <span className="block font-mono text-[0.625rem] text-dim">
            {scope.org} · {scope.headcount} people · lead {scope.lead}
          </span>
        </span>
        <ChevronIcon className={`text-dim transition-transform ${shown ? 'rotate-180' : ''}`} />
      </button>

      {shown && (
        <div className="bt-count absolute top-full left-0 z-40 mt-2 w-[288px] rounded-xl border border-hair bg-panel p-1.5 shadow-lift">
          <p className="px-2.5 py-2 font-mono text-[0.625rem] tracking-[0.08em] text-dim">
            TEAMS AMARA OWNS
          </p>
          {scope.siblings.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setShown(false)}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-panel-3 ${
                i === 0 ? 'bg-panel-3' : ''
              }`}
            >
              <span className="flex-1 text-[0.8125rem] text-strong">{t.team}</span>
              <span className="num text-[0.75rem] text-dim">{i === 0 ? open : t.open} open</span>
              <span
                className="num w-7 text-right text-[0.75rem]"
                style={{
                  color:
                    t.health >= 75
                      ? 'var(--color-ok)'
                      : t.health >= 45
                        ? 'var(--color-warn)'
                        : 'var(--color-risk)',
                }}
              >
                {t.health}
              </span>
            </button>
          ))}
          <p className="border-t border-hair px-2.5 pt-2.5 pb-1.5 text-[0.75rem] leading-[1.5] text-dim">
            Scoped per workstream on purpose: a fix is only useful if the person approving it has
            the standing to send it.
          </p>
        </div>
      )}
    </div>
  );
}

const LEGEND_SHAPES = [
  ['circle + initials', 'person'],
  ['envelope', 'thread'],
  ['tick', 'task'],
  ['clock', 'deadline'],
] as const;

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hair bg-panel px-4 py-2.5">
      <div className="flex items-center gap-3">
        {(
          [
            ['bg-ok', 'clear'],
            ['bg-warn', 'watch'],
            ['bg-risk', 'at risk'],
          ] as const
        ).map(([dot, label]) => (
          <span key={label} className="flex items-center gap-1.5 font-mono text-[0.625rem] text-dim">
            <span className={`inline-block size-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
        <span className="font-mono text-[0.625rem] text-dim">= the ring</span>
      </div>
      <span className="h-3 w-px bg-hair" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {LEGEND_SHAPES.map(([glyph, kind]) => (
          <span key={kind} className="font-mono text-[0.625rem] text-dim">
            <span className="text-mid">{glyph}</span> {kind}
          </span>
        ))}
      </div>
      <span className="h-3 w-px bg-hair" />
      <p className="font-mono text-[0.625rem] text-dim">
        <span className="text-accent">dashed collar</span> sole owner ·{' '}
        <span className="text-agent">purple</span> Baton
      </p>
    </div>
  );
}

export function Dashboard() {
  const {
    state,
    openRisks,
    visibleRisks,
    exposureDays,
    approve,
    dismiss,
    trigger,
    rescore,
    toasts,
    selected,
    setSelected,
  } = useWorkspace();
  const [theme, toggleTheme] = useTheme();
  const palette = usePalette(theme);
  const [showRules, setShowRules] = useState(false);
  const [tour, setTour] = useState(false);

  const rate = state.rules.cost_model.blended_day_rate_gbp;

  return (
    <div className="app-shell flex h-dvh flex-col overflow-hidden bg-void text-strong">
      {/* header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-hair bg-panel px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2" title="Back to the site">
          <Mark size={26} reverse={theme === 'dark'} />
          <span className="display-tight text-[1.0625rem] text-strong">Baton</span>
        </Link>

        <span className="h-6 w-px bg-hair" />
        <Scope scope={state.scope} open={openRisks.length} />

        <Chip tone={state.connected ? 'ok' : 'accent'} className="hidden lg:inline-flex">
          <span
            className={`bt-pulse inline-block size-1.5 rounded-full ${
              state.connected ? 'bg-ok' : 'bg-accent'
            }`}
          />
          {state.connected ? 'webhooks live' : 'seeded workspace'}
        </Chip>

        <div className="ml-auto flex items-center gap-2.5">
          {/* the money, which is the whole reason a lead opens this */}
          <div className="hidden items-center gap-2.5 rounded-xl border border-hair bg-panel-2 px-3 py-1.5 md:flex">
            <CoinIcon className="text-accent" />
            <div className="leading-none">
              <p className="num text-[1.0625rem] text-strong">{money(exposureDays * rate)}</p>
              <p className="mt-1 font-mono text-[0.5625rem] tracking-[0.1em] text-dim">
                AT RISK · {exposureDays} PERSON-DAYS
              </p>
            </div>
          </div>

          <Health score={state.health} />
          <span className="hidden h-8 w-px bg-hair sm:block" />

          <button
            type="button"
            onClick={() => setTour(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-hair bg-panel px-3 py-2 text-[0.8125rem] text-mid transition-colors hover:border-accent hover:text-strong"
          >
            <CompassIcon size={15} />
            <span className="hidden sm:inline">Tour</span>
          </button>
          <button
            type="button"
            onClick={trigger}
            className="inline-flex items-center gap-1.5 rounded-full border border-hair bg-panel px-3 py-2 text-[0.8125rem] text-mid transition-colors hover:border-accent hover:text-strong"
            title="Replays the webhook path with an inbound mail from the agency"
          >
            <WebhookIcon size={15} />
            <span className="hidden lg:inline">Inbound event</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRules((s) => !s)}
            data-tour="rules"
            className={`rounded-full border px-3.5 py-2 text-[0.8125rem] transition-colors ${
              showRules
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-hair bg-panel text-mid hover:border-accent hover:text-strong'
            }`}
          >
            Rules
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            className="inline-flex size-9 items-center justify-center rounded-full border border-hair bg-panel text-mid transition-colors hover:border-accent hover:text-strong"
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
      </header>

      {/* body */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            {/* the graph */}
            <section
              className="flex min-w-0 flex-1 flex-col border-r border-hair bg-void"
              data-tour="graph"
            >
              <div className="flex items-center gap-2.5 px-4 pt-3">
                <span className="baton-rule w-5" />
                <span className="kicker text-dim">workspace graph</span>
                <span className="ml-auto font-mono text-[0.6875rem] text-dim">
                  {state.graph.nodes.length} nodes · {state.graph.edges.length} edges ·{' '}
                  <span className="text-risk">
                    {state.graph.edges.filter((e) => e.open).length} open
                  </span>
                </span>
              </div>
              <div className="relative min-h-0 flex-1">
                <GraphCanvas
                  nodes={state.graph.nodes}
                  edges={state.graph.edges}
                  selected={selected}
                  onSelect={setSelected}
                  palette={palette}
                />
              </div>
              <Legend />
            </section>

            {/* the queue */}
            <section
              className="flex w-[404px] shrink-0 flex-col border-r border-hair bg-void"
              data-tour="queue"
            >
              <div className="flex items-center gap-2.5 border-b border-hair px-4 py-3">
                <span className="baton-rule w-5" />
                <span className="kicker text-dim">drop risk</span>
                <span className="ml-auto font-mono text-[0.6875rem] text-dim">
                  {openRisks.length} open · worst first
                </span>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {visibleRisks.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
                    <span className="inline-flex size-11 items-center justify-center rounded-full bg-ok/15 text-ok">
                      <CheckIcon size={22} />
                    </span>
                    <p className="text-[0.9375rem] font-medium text-strong">Nothing is dropping.</p>
                    <p className="text-[0.8125rem] leading-[1.6] text-dim">
                      Baton is still watching. The next webhook, or the 45-second sweep, will put
                      anything new here.
                    </p>
                  </div>
                ) : (
                  visibleRisks.map((r, i) => (
                    <RiskCard
                      key={r.id}
                      risk={r}
                      rate={rate}
                      tourAnchor={i === 0}
                      selected={selected != null && r.nodes.includes(selected)}
                      onSelect={() => setSelected(selected === r.nodes[0] ? null : r.nodes[0]!)}
                      onApprove={() => approve(r.id)}
                      onDismiss={() => dismiss(r.id)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* the audit strip */}
          <section className="h-[196px] shrink-0 border-t border-hair bg-panel" data-tour="audit">
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
            className="bt-pass flex items-start gap-2.5 rounded-xl border border-agent/40 bg-panel px-4 py-3 shadow-lift"
          >
            <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-agent/15 text-agent">
              <CheckIcon size={13} />
            </span>
            <div>
              <p className="text-[0.8125rem] font-medium text-strong">{t.title}</p>
              <p className="mt-0.5 font-mono text-[0.6875rem] text-dim">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {tour && <Tour onClose={() => setTour(false)} />}
    </div>
  );
}
