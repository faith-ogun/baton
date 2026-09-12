import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '../lib/router';
import { usePalette, useTheme } from '../lib/theme';
import { Mark } from '../brand/Mark';
import { CheckIcon, WebhookIcon } from '../ui/icons';
import { ChevronIcon, CompassIcon, MoonIcon, SunIcon } from '../ui/theme-icons';
import type { Scope as ScopeType } from '../types';
import { money, useWorkspace } from './api';
import { AuditTimeline } from './AuditTimeline';
import { GraphCanvas, type GraphHandle } from './GraphCanvas';
import { GraphToolbar, SortToggle } from './GraphToolbar';
import { RiskRow } from './RiskRow';
import { RulesDrawer } from './RulesDrawer';
import { Shortcuts } from './Shortcuts';
import { Tour } from './Tour';
import { Divider } from './Divider';
import { useSplit } from './useSplit';

/** Team health, 0-100. A ring and a number: cheap to compute, big payoff. */
function Health({ score }: { score: number }) {
  const colour = score >= 75 ? 'var(--color-ok)' : score >= 45 ? 'var(--color-warn)' : 'var(--color-risk)';
  const C = 2 * Math.PI * 15;
  return (
    <div className="flex items-center gap-2">
      <div className="relative size-8">
        <svg viewBox="0 0 36 36" className="-rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-hair)" strokeWidth="3.4" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke={colour}
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - score / 100)}
            style={{ transition: 'stroke-dashoffset .7s var(--ease-out-quint), stroke .4s' }}
          />
        </svg>
      </div>
      <div className="leading-none">
        <p className="num text-[0.9375rem]" style={{ color: colour }}>
          {score}
        </p>
        <p className="mt-0.5 font-mono text-[0.5rem] tracking-[0.12em] text-dim">HEALTH</p>
      </div>
    </div>
  );
}

/**
 * The scope selector. Baton answers to one workstream's lead, so the header
 * says whose board this is; a director who owns several teams switches here.
 */
function Scope({ scope, open }: { scope: ScopeType; open: number }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative" data-tour="scope">
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="flex items-center gap-2 rounded border border-transparent px-2 py-1 text-left transition-colors hover:border-hair hover:bg-panel-2"
      >
        <span className="leading-tight">
          <span className="block text-[0.75rem] font-semibold text-strong">{scope.team}</span>
          <span className="block font-mono text-[0.5625rem] tracking-[0.04em] text-dim">
            {scope.org.toUpperCase()} · {scope.headcount} PEOPLE · {scope.lead.toUpperCase()}
          </span>
        </span>
        <ChevronIcon size={13} className={`text-dim transition-transform ${shown ? 'rotate-180' : ''}`} />
      </button>

      {shown && (
        <div className="bt-count absolute top-full left-0 z-40 mt-1 w-[272px] border border-hair bg-panel shadow-lift">
          <p className="border-b border-hair px-3 py-2 font-mono text-[0.5625rem] tracking-[0.1em] text-dim">
            TEAMS {scope.lead.split(' ')[0]?.toUpperCase()} OWNS
          </p>
          {scope.siblings.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setShown(false)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-panel-2 ${
                i === 0 ? 'bg-panel-2' : ''
              }`}
            >
              <span className="flex-1 text-[0.75rem] text-strong">{t.team}</span>
              <span className="num text-[0.6875rem] text-dim">{i === 0 ? open : t.open}</span>
              <span
                className="num w-6 text-right text-[0.6875rem]"
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
          <p className="border-t border-hair px-3 py-2 text-[0.6875rem] leading-[1.5] text-dim">
            Scoped per workstream: a fix is only useful if whoever approves it has the standing to
            send it.
          </p>
        </div>
      )}
    </div>
  );
}

/** A small square icon button, the header's only repeated control. */
function Tool({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`inline-flex size-7 items-center justify-center rounded border transition-colors ${
        active
          ? 'border-accent bg-accent-soft text-accent-ink'
          : 'border-hair text-mid hover:border-accent hover:text-strong'
      }`}
    >
      {children}
    </button>
  );
}

const LEGEND = [
  ['circle + initials', 'person'],
  ['envelope', 'thread'],
  ['tick', 'task'],
  ['clock', 'deadline'],
] as const;

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
  const [help, setHelp] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [labels, setLabels] = useState(true);
  const [sort, setSort] = useState<'severity' | 'cost'>('severity');
  const [openId, setOpenId] = useState<string | null>(null);
  const graph = useRef<GraphHandle | null>(null);

  const queue = useSplit({ axis: 'x', initial: 404, min: 300, max: 760, key: 'baton:split' });
  // The audit strip is a peek by default and a full window when you drag it up,
  // because most of the time you want to know the last thing Baton did, and
  // occasionally you want to read everything it has ever done.
  const audit = useSplit({ axis: 'y', initial: 172, min: 30, max: 620, key: 'baton:audit' });
  const auditOpen = audit.size > 120;

  const rate = state.rules.cost_model.blended_day_rate_gbp;

  const rows = [...visibleRisks].sort((a, b) =>
    sort === 'cost' ? b.impact.days - a.impact.days : b.severity - a.severity,
  );

  // The open row and the graph selection are one thing, so opening a risk
  // lights up the nodes it touches and clicking a node is not a separate idea.
  const openRow = useCallback(
    (id: string | null) => {
      setOpenId(id);
      const risk = rows.find((r) => r.id === id);
      setSelected(risk ? (risk.nodes[0] ?? null) : null);
    },
    [rows, setSelected],
  );

  const step = useCallback(
    (by: number) => {
      if (!rows.length) return;
      const i = rows.findIndex((r) => r.id === openId);
      const next = rows[Math.max(0, Math.min(rows.length - 1, (i < 0 ? -1 : i) + by))];
      if (next) openRow(next.id);
    },
    [rows, openId, openRow],
  );

  const applyZoom = useCallback((k: number) => {
    setZoom(k);
    graph.current?.setZoom(k);
  }, []);

  /**
   * Keyboard control. Not decoration: a queue you work through with j/k/a is
   * how anyone would actually clear five items, and the shortcuts are printed
   * on the buttons so they are discoverable rather than folklore.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          step(1);
          break;
        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          step(-1);
          break;
        case 'a':
          if (openId) approve(openId);
          break;
        case 'd':
          if (openId) dismiss(openId);
          break;
        case 'e':
          trigger();
          break;
        case 'r':
          setShowRules((s) => !s);
          break;
        case 'f':
          graph.current?.fit();
          break;
        case '[':
          queue.nudge(-48);
          break;
        case ']':
          queue.nudge(48);
          break;
        case '\\':
          e.preventDefault();
          audit.set(auditOpen ? 30 : 420);
          break;
        case 'g':
          toggleTheme();
          break;
        case 't':
          setTour(true);
          break;
        case '?':
          setHelp((h) => !h);
          break;
        case 'Escape':
          setHelp(false);
          setShowRules(false);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, openId, approve, dismiss, trigger, queue, audit, auditOpen, toggleTheme]);

  return (
    <div className="app-shell flex h-dvh flex-col overflow-hidden bg-void text-strong">
      {/* ── header ─────────────────────────────────────────── */}
      <header className="flex h-11 shrink-0 items-center gap-2.5 border-b border-hair bg-panel px-3">
        <Link to="/" className="flex items-center gap-1.5" title="Back to the site">
          <Mark size={20} reverse={theme === 'dark'} />
          <span className="display-tight text-[0.9375rem] text-strong">Baton</span>
        </Link>

        <span className="h-5 w-px bg-hair" />
        <Scope scope={state.scope} open={openRisks.length} />

        <div className="ml-auto flex items-center gap-2.5">
          {/* the money, which is why a lead opens this at all */}
          <div className="hidden items-baseline gap-1.5 md:flex">
            <span className="num text-[0.9375rem] text-strong">{money(exposureDays * rate)}</span>
            <span className="font-mono text-[0.5625rem] tracking-[0.08em] text-dim">
              AT RISK / {exposureDays}d
            </span>
          </div>
          <span className="hidden h-6 w-px bg-hair md:block" />
          <Health score={state.health} />
          <span className="h-6 w-px bg-hair" />

          <Tool onClick={() => setTour(true)} title="Guided tour (T)">
            <CompassIcon size={14} />
          </Tool>
          <Tool onClick={trigger} title="Replay the webhook path with an inbound mail (E)">
            <WebhookIcon size={14} />
          </Tool>
          <button
            type="button"
            onClick={() => setShowRules((s) => !s)}
            data-tour="rules"
            className={`rounded border px-2 py-1 font-mono text-[0.625rem] tracking-[0.08em] uppercase transition-colors ${
              showRules
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-hair text-mid hover:border-accent hover:text-strong'
            }`}
            title="The rules registry (R)"
          >
            Rules
          </button>
          <Tool onClick={toggleTheme} title={theme === 'dark' ? 'Light (G)' : 'Dark (G)'}>
            {theme === 'dark' ? <SunIcon size={14} /> : <MoonIcon size={14} />}
          </Tool>
        </div>
      </header>

      {/* ── body ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            {/* the graph */}
            <section className="flex min-w-0 flex-1 flex-col bg-void" data-tour="graph">
              <GraphToolbar
                zoom={zoom}
                setZoom={applyZoom}
                fit={() => graph.current?.fit()}
                labels={labels}
                setLabels={setLabels}
                counts={{
                  nodes: state.graph.nodes.length,
                  edges: state.graph.edges.length,
                  open: state.graph.edges.filter((e) => e.open).length,
                }}
              />
              <div className="relative min-h-0 flex-1">
                <GraphCanvas
                  nodes={state.graph.nodes}
                  edges={state.graph.edges}
                  selected={selected}
                  onSelect={setSelected}
                  palette={palette}
                  showLabels={labels}
                  onZoom={setZoom}
                  handleRef={graph}
                />
              </div>
            </section>

            <Divider
              axis="x"
              dragging={queue.dragging}
              onDrag={queue.startDrag}
              onReset={queue.reset}
              label="Resize the queue"
            />

            {/* the queue */}
            <section
              className="flex shrink-0 flex-col bg-void"
              style={{ width: queue.size }}
              data-tour="queue"
            >
              <div className="flex h-[30px] shrink-0 items-center gap-2.5 border-b border-hair bg-panel px-3.5">
                <span className="baton-rule w-4" />
                <span className="kicker text-dim">drop risk</span>
                <span className="ml-auto flex items-center gap-2.5">
                  <span className="num text-[0.625rem] text-dim">{openRisks.length} open</span>
                  <SortToggle sort={sort} setSort={setSort} />
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {rows.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2.5 px-8 text-center">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-ok/15 text-ok">
                      <CheckIcon size={20} />
                    </span>
                    <p className="text-[0.875rem] font-medium text-strong">Nothing is dropping.</p>
                    <p className="text-[0.75rem] leading-[1.6] text-dim">
                      Baton is still watching. The next webhook, or the 45-second sweep, will put
                      anything new here.
                    </p>
                  </div>
                ) : (
                  rows.map((r, i) => (
                    <RiskRow
                      key={r.id}
                      risk={r}
                      rate={rate}
                      open={openId === r.id}
                      tourAnchor={i === 0}
                      onOpen={() => openRow(openId === r.id ? null : r.id)}
                      onApprove={() => approve(r.id)}
                      onDismiss={() => dismiss(r.id)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* the audit trail, resizable from a peek to a full window */}
          <Divider
            axis="y"
            dragging={audit.dragging}
            onDrag={audit.startDrag}
            onReset={audit.reset}
            label="Resize the audit trail"
          />
          <section
            className="shrink-0 overflow-hidden bg-panel"
            style={{ height: audit.size }}
            data-tour="audit"
          >
            <AuditTimeline
              entries={state.audit}
              open={auditOpen}
              onToggle={() => audit.set(auditOpen ? 30 : 420)}
            />
          </section>

          {/* ── status bar ─────────────────────────────────── */}
          <footer className="flex h-6 shrink-0 items-center gap-3 border-t border-hair bg-panel px-3 font-mono text-[0.625rem] text-dim">
            <span className="flex items-center gap-1.5">
              <span
                className={`bt-pulse inline-block size-1.5 rounded-full ${
                  state.connected ? 'bg-ok' : 'bg-accent'
                }`}
              />
              {state.connected ? 'webhooks live' : 'seeded workspace'}
            </span>
            <span className="opacity-40">|</span>
            <span>{state.workspace}</span>
            <span className="hidden opacity-40 sm:inline">|</span>
            <span className="hidden sm:inline">sweep every 45s</span>
            <span className="hidden opacity-40 lg:inline">|</span>
            <span className="hidden lg:inline">
              {LEGEND.map(([g, k]) => `${g} ${k}`).join(' · ')}
            </span>
            <button
              type="button"
              onClick={() => setHelp(true)}
              className="ml-auto transition-colors hover:text-strong"
            >
              <kbd className="rounded border border-hair-2 px-1">?</kbd> shortcuts
            </button>
          </footer>
        </div>

        {showRules && (
          <RulesDrawer rules={state.rules} onChange={rescore} onClose={() => setShowRules(false)} />
        )}
      </div>

      {/* toasts */}
      <div className="pointer-events-none fixed right-3 bottom-9 z-50 flex flex-col gap-1.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bt-pass flex items-start gap-2 border border-agent/40 bg-panel px-3 py-2 shadow-lift"
          >
            <span className="mt-0.5 inline-flex size-4 items-center justify-center rounded-full bg-agent/15 text-agent">
              <CheckIcon size={11} />
            </span>
            <div>
              <p className="text-[0.75rem] font-medium text-strong">{t.title}</p>
              <p className="mt-0.5 font-mono text-[0.625rem] text-dim">{t.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {tour && <Tour onClose={() => setTour(false)} />}
      {help && <Shortcuts onClose={() => setHelp(false)} />}
    </div>
  );
}
