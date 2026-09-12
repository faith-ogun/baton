import { useState } from 'react';
import type { Risk } from '../types';
import { APP_ICON, CheckIcon, DeadlineIcon, OpenLoopIcon, SpofIcon, StalledIcon } from '../ui/icons';
import { money } from './api';

const TYPE_META: Record<Risk['type'], { label: string; icon: typeof OpenLoopIcon }> = {
  open_loop_ask: { label: 'open loop', icon: OpenLoopIcon },
  stalled_task: { label: 'stalled', icon: StalledIcon },
  unbooked_deadline: { label: 'unbooked', icon: DeadlineIcon },
  spof: { label: 'sole owner', icon: SpofIcon },
};

function colourOf(severity: number) {
  if (severity >= 70) return 'var(--color-risk)';
  if (severity >= 45) return 'var(--color-warn)';
  return 'var(--color-ok)';
}

/**
 * One row in the drop-risk queue.
 *
 * Deliberately a ROW and not a card. The first version stacked five fat cards,
 * every one of them fully expanded, every one the same shape: a wall of
 * identical rounded rectangles you have to read end to end to find the one
 * that matters. Real queues, in mail clients and issue trackers, are a dense
 * list with one thing open at a time, because the list is for *scanning* and
 * the detail is for *deciding*.
 *
 * So collapsed is two lines and scannable: the severity spine down the left,
 * the sentence, the money, the score. Expanding is what earns the space, and
 * only one row is expanded at a time.
 */
export function RiskRow({
  risk,
  rate,
  open,
  tourAnchor,
  onOpen,
  onApprove,
  onDismiss,
}: {
  risk: Risk;
  rate: number;
  open: boolean;
  tourAnchor?: boolean;
  onOpen: () => void;
  onApprove: () => void;
  onDismiss: () => void;
}) {
  const [draft, setDraft] = useState(risk.action.draft ?? '');
  const [editing, setEditing] = useState(false);
  const meta = TYPE_META[risk.type];
  const colour = colourOf(risk.severity);
  const busy = risk.status === 'working';
  const gone = risk.status === 'done' || risk.status === 'dismissed';

  return (
    <div
      className={`bt-pass group relative border-b border-hair transition-colors ${
        gone ? 'bt-handoff' : ''
      } ${open ? 'bg-panel' : 'bg-panel/40 hover:bg-panel'}`}
      data-tour={tourAnchor ? 'proposal' : undefined}
    >
      {/* the severity spine: priority, read before any words */}
      <span
        aria-hidden
        className="absolute top-0 left-0 h-full w-[3px] transition-opacity"
        style={{ background: colour, opacity: open ? 1 : 0.55 }}
      />

      <button
        type="button"
        onClick={onOpen}
        aria-expanded={open}
        className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span className="mt-[0.15rem] shrink-0" style={{ color: colour }}>
          <meta.icon size={15} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-[0.8125rem] leading-[1.4] font-medium text-strong ${
              open ? '' : 'truncate'
            }`}
          >
            {risk.title}
          </span>
          <span className="mt-1 flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.03em] text-dim">
            <span style={{ color: colour }}>{meta.label}</span>
            <span className="opacity-40">/</span>
            <span>{risk.project}</span>
            {risk.dueInDays != null && (
              <>
                <span className="opacity-40">/</span>
                <span>due {risk.dueInDays}d</span>
              </>
            )}
            {risk.ageDays != null && risk.ageDays > 0 && (
              <>
                <span className="opacity-40">/</span>
                <span>{risk.ageDays}d silent</span>
              </>
            )}
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span className="num block text-[0.8125rem] text-strong">
            {money(risk.impact.days * rate)}
          </span>
          <span className="num mt-0.5 block text-[0.625rem]" style={{ color: colour }}>
            {risk.severity}
          </span>
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5">
          <p className="text-[0.8125rem] leading-[1.6] text-mid">{risk.detail}</p>

          <dl className="mt-2.5 space-y-1 border-l border-hair pl-2.5 font-mono text-[0.6875rem] leading-[1.6]">
            <div className="flex gap-2">
              <dt className="w-11 shrink-0 text-dim">rule</dt>
              <dd className="min-w-0 flex-1 text-mid">{risk.because}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-11 shrink-0 text-dim">cost</dt>
              <dd className="min-w-0 flex-1 text-mid">
                {risk.impact.days} person-days · {risk.impact.basis}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-11 shrink-0 text-dim">people</dt>
              <dd className="min-w-0 flex-1 text-info-ink">{risk.people.join(', ')}</dd>
            </div>
          </dl>

          {/* the proposal */}
          <div className="mt-3 border border-agent/25 bg-agent-soft/40 p-3">
            <div className="flex items-center gap-2">
              <span className="kicker flex items-center gap-1.5 text-agent-ink">
                <span className="inline-block size-1.5 rounded-full bg-agent" />
                baton proposes
              </span>
              <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.625rem] text-dim">
                {APP_ICON(risk.action.app, 11)}
                {risk.action.app.toUpperCase()}
              </span>
            </div>

            <p className="mt-2 text-[0.8125rem] leading-[1.55] text-mid">{risk.action.summary}</p>

            {(risk.action.patch || risk.action.to) && (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5 font-mono text-[0.625rem]">
                {risk.action.to && (
                  <div className="col-span-2 grid grid-cols-subgrid">
                    <dt className="text-dim">to</dt>
                    <dd className="text-info-ink">{risk.action.to.join(', ')}</dd>
                  </div>
                )}
                {Object.entries(risk.action.patch ?? {}).map(([k, v]) => (
                  <div key={k} className="col-span-2 grid grid-cols-subgrid">
                    <dt className="text-dim">{k}</dt>
                    <dd className="text-accent-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {risk.action.draft &&
              (editing ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={7}
                  autoFocus
                  className="mt-2.5 w-full resize-y border border-hair-2 bg-panel px-2.5 py-2 text-[0.8125rem] leading-[1.6] text-strong outline-none focus:border-accent"
                />
              ) : (
                <p className="mt-2.5 border-l-2 border-agent/40 pl-2.5 text-[0.8125rem] leading-[1.6] text-mid italic">
                  {draft}
                </p>
              ))}
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onApprove}
              disabled={busy || gone}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded bg-accent px-3 py-2 text-[0.75rem] font-semibold tracking-[0.02em] text-white uppercase transition-colors hover:bg-accent-lift disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? (
                <>
                  <Spinner />
                  Acting
                </>
              ) : (
                <>
                  <CheckIcon size={13} />
                  Approve
                </>
              )}
              {!busy && <Kbd>A</Kbd>}
            </button>
            {risk.action.draft && (
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="rounded border border-hair px-3 py-2 text-[0.75rem] font-medium tracking-[0.02em] text-mid uppercase transition-colors hover:border-hair-2 hover:text-strong"
              >
                {editing ? 'Done' : 'Edit'}
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              disabled={busy || gone}
              className="inline-flex items-center gap-1.5 rounded px-2.5 py-2 text-[0.75rem] font-medium tracking-[0.02em] text-dim uppercase transition-colors hover:text-mid disabled:opacity-40"
            >
              Dismiss
              <Kbd>D</Kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="ml-0.5 hidden rounded border border-current/30 px-1 font-mono text-[0.5625rem] leading-[1.4] opacity-60 sm:inline">
      {children}
    </kbd>
  );
}

function Spinner() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
