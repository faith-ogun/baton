import { useState } from 'react';
import type { Risk } from '../types';
import { Chip, type ChipTone } from '../ui/ui';
import { APP_ICON, CheckIcon, DeadlineIcon, OpenLoopIcon, SpofIcon, StalledIcon } from '../ui/icons';
import { ChevronIcon } from '../ui/theme-icons';
import { money } from './api';

const TYPE_META: Record<Risk['type'], { label: string; icon: typeof OpenLoopIcon }> = {
  open_loop_ask: { label: 'open loop', icon: OpenLoopIcon },
  stalled_task: { label: 'stalled', icon: StalledIcon },
  unbooked_deadline: { label: 'unbooked', icon: DeadlineIcon },
  spof: { label: 'single point of failure', icon: SpofIcon },
};

function bandOf(severity: number): { tone: ChipTone; colour: string } {
  if (severity >= 70) return { tone: 'risk', colour: 'var(--color-risk)' };
  if (severity >= 45) return { tone: 'warn', colour: 'var(--color-warn)' };
  return { tone: 'ok', colour: 'var(--color-ok)' };
}

/**
 * One drop risk.
 *
 * The card opens with the three things a lead decides on: what is wrong, in
 * one sentence; what it costs; and the fix. Everything that justifies those,
 * the full detail and the rule that fired, is one line down behind "Why this
 * fired", because a queue of five cards each shouting four paragraphs is a
 * wall of text nobody reads. The proposal is always visible. It is the point.
 */
export function RiskCard({
  risk,
  rate,
  selected,
  tourAnchor,
  onSelect,
  onApprove,
  onDismiss,
}: {
  risk: Risk;
  rate: number;
  selected: boolean;
  tourAnchor?: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onDismiss: () => void;
}) {
  const [draft, setDraft] = useState(risk.action.draft ?? '');
  const [editing, setEditing] = useState(false);
  const [why, setWhy] = useState(false);
  const meta = TYPE_META[risk.type];
  const band = bandOf(risk.severity);
  const busy = risk.status === 'working';
  const gone = risk.status === 'done' || risk.status === 'dismissed';

  return (
    <article
      className={`bt-pass overflow-hidden rounded-2xl border bg-panel shadow-card transition-colors duration-200 ${
        gone ? 'bt-handoff' : ''
      } ${selected ? 'border-accent' : 'border-hair hover:border-hair-2'}`}
    >
      {/* severity, as a bar you read before you read any words */}
      <div className="h-[3px] w-full bg-hair">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${risk.severity}%`, background: band.colour }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `color-mix(in srgb, ${band.colour} 14%, transparent)`,
              color: band.colour,
            }}
          >
            <meta.icon size={16} />
          </span>
          <Chip tone={band.tone}>{meta.label}</Chip>
          {risk.project && <Chip tone="neutral">{risk.project}</Chip>}
          <span className="num ml-auto text-[0.875rem]" style={{ color: band.colour }}>
            {risk.severity}
          </span>
        </div>

        <button type="button" onClick={onSelect} className="mt-2.5 block w-full text-left">
          <span className="block text-[0.9375rem] leading-[1.45] font-semibold text-strong">
            {risk.title}
          </span>
        </button>

        {/* the money: the reason a lead is looking at this at all */}
        <div className="mt-3 flex items-baseline gap-2 rounded-xl border border-hair bg-panel-2 px-3 py-2.5">
          <span className="num text-[1.25rem] leading-none" style={{ color: band.colour }}>
            {money(risk.impact.days * rate)}
          </span>
          <span className="font-mono text-[0.625rem] tracking-[0.06em] text-dim">
            {risk.impact.days} PERSON-DAYS
          </span>
        </div>

        {/* the proposal, always open */}
        <div
          className="mt-3 rounded-xl border border-agent/25 bg-agent-soft/40 p-3"
          data-tour={tourAnchor ? 'proposal' : undefined}
        >
          <div className="flex items-center gap-2">
            <span className="kicker flex items-center gap-1.5 text-agent-ink">
              <span className="inline-block size-1.5 rounded-full bg-agent" />
              baton proposes
            </span>
            <span className="ml-auto">
              <Chip tone="neutral">
                {APP_ICON(risk.action.app, 11)}
                {risk.action.app}
              </Chip>
            </span>
          </div>

          <p className="mt-2.5 text-[0.875rem] leading-[1.6] text-mid">{risk.action.summary}</p>

          {risk.action.patch && (
            <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[0.6875rem]">
              {Object.entries(risk.action.patch).map(([k, v]) => (
                <div key={k} className="col-span-2 grid grid-cols-subgrid">
                  <dt className="text-dim">{k}</dt>
                  <dd className="text-accent-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {risk.action.to && (
            <p className="mt-2.5 font-mono text-[0.6875rem] text-dim">
              to <span className="text-info-ink">{risk.action.to.join(', ')}</span>
            </p>
          )}

          {risk.action.draft &&
            (editing ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={7}
                className="mt-2.5 w-full resize-y rounded-lg border border-hair-2 bg-panel px-3 py-2.5 text-[0.8125rem] leading-[1.65] text-strong outline-none focus:border-accent"
              />
            ) : (
              <p className="mt-2.5 border-l-2 border-agent/40 pl-3 text-[0.8125rem] leading-[1.65] text-mid italic">
                {draft}
              </p>
            ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy || gone}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[0.8125rem] font-medium text-white shadow-[0_2px_0_var(--color-accent-ink)] transition-all duration-150 hover:bg-accent-lift active:translate-y-[2px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? (
              <>
                <Spinner />
                Acting in the workspace
              </>
            ) : (
              <>
                <CheckIcon size={14} />
                Approve
              </>
            )}
          </button>
          {risk.action.draft && (
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="rounded-full border border-hair px-4 py-2.5 text-[0.8125rem] text-mid transition-colors hover:border-hair-2 hover:text-strong"
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            disabled={busy || gone}
            className="rounded-full px-3 py-2.5 text-[0.8125rem] text-dim transition-colors hover:text-mid disabled:opacity-40"
          >
            Dismiss
          </button>
        </div>

        {/* the evidence, one line down */}
        <button
          type="button"
          onClick={() => setWhy((w) => !w)}
          className="mt-2 flex w-full items-center gap-1.5 rounded-lg px-1 py-1.5 text-left font-mono text-[0.6875rem] text-dim transition-colors hover:text-mid"
        >
          <ChevronIcon size={14} className={`transition-transform ${why ? 'rotate-180' : '-rotate-90'}`} />
          Why this fired
        </button>

        {why && (
          <div className="bt-count space-y-2.5 pb-1">
            <p className="text-[0.8125rem] leading-[1.65] text-mid">{risk.detail}</p>
            <p className="rounded-lg bg-panel-3 px-2.5 py-2 font-mono text-[0.6875rem] leading-[1.6] text-mid">
              {risk.because}
            </p>
            <p className="rounded-lg bg-panel-3 px-2.5 py-2 font-mono text-[0.6875rem] leading-[1.6] text-mid">
              cost · {risk.impact.basis}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {risk.people.map((p) => (
                <Chip key={p} tone="info">
                  {p}
                </Chip>
              ))}
              {risk.ageDays != null && risk.ageDays > 0 && (
                <Chip tone="neutral">{risk.ageDays}d silent</Chip>
              )}
              {risk.dueInDays != null && <Chip tone="neutral">due in {risk.dueInDays}d</Chip>}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
