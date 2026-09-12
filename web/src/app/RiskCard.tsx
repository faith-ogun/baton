import { useState } from 'react';
import type { Risk } from '../types';
import { Chip, type ChipTone } from '../ui/ui';
import { APP_ICON, CheckIcon, DeadlineIcon, OpenLoopIcon, SpofIcon, StalledIcon } from '../ui/icons';

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

export function RiskCard({
  risk,
  selected,
  onSelect,
  onApprove,
  onDismiss,
}: {
  risk: Risk;
  selected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onDismiss: () => void;
}) {
  const [draft, setDraft] = useState(risk.action.draft ?? '');
  const [editing, setEditing] = useState(false);
  const meta = TYPE_META[risk.type];
  const band = bandOf(risk.severity);
  const busy = risk.status === 'working';
  const gone = risk.status === 'done' || risk.status === 'dismissed';

  return (
    <article
      className={`bt-pass overflow-hidden rounded-2xl border bg-panel transition-colors duration-200 ${
        gone ? 'bt-handoff' : ''
      } ${selected ? 'border-accent-lift/50 bg-panel-2' : 'border-hair hover:border-hair-2'}`}
    >
      {/* severity, as a bar you read before you read anything else */}
      <div className="h-[3px] w-full bg-hair">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${risk.severity}%`, background: band.colour }}
        />
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full items-start gap-3 text-left"
          aria-pressed={selected}
        >
          <span
            className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${band.colour} 16%, transparent)`, color: band.colour }}
          >
            <meta.icon size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <Chip tone={band.tone}>{meta.label}</Chip>
              {risk.project && <Chip tone="onInk">{risk.project}</Chip>}
              <span className="num ml-auto text-[0.8125rem]" style={{ color: band.colour }}>
                {risk.severity}
              </span>
            </span>
            <span className="mt-2 block text-[0.9375rem] leading-[1.5] font-medium text-paper">
              {risk.title}
            </span>
          </span>
        </button>

        <p className="mt-2.5 text-[0.875rem] leading-[1.65] text-paper-3/70">{risk.detail}</p>

        {/* the rule that fired, quoted, so the number is never a black box */}
        <p className="mt-3 rounded-lg bg-void/50 px-2.5 py-2 font-mono text-[0.6875rem] leading-[1.6] text-ink-4">
          {risk.because}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {risk.people.map((p) => (
            <Chip key={p} tone="info">
              {p}
            </Chip>
          ))}
          {risk.ageDays != null && risk.ageDays > 0 && <Chip tone="onInk">{risk.ageDays}d silent</Chip>}
          {risk.dueInDays != null && <Chip tone="onInk">due in {risk.dueInDays}d</Chip>}
        </div>

        {/* the proposal */}
        <div className="mt-4 rounded-xl border border-hair bg-void/45 p-3">
          <div className="flex items-center gap-2">
            <span className="kicker flex items-center gap-1.5 text-agent-lift">
              <span className="inline-block size-1.5 rounded-full bg-agent" />
              baton proposes
            </span>
            <span className="ml-auto">
              <Chip tone="onInk">
                {APP_ICON(risk.action.app, 11)}
                {risk.action.app}
              </Chip>
            </span>
          </div>

          <p className="mt-2.5 text-[0.875rem] leading-[1.6] text-paper-3/85">
            {risk.action.summary}
          </p>

          {risk.action.patch && (
            <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[0.6875rem]">
              {Object.entries(risk.action.patch).map(([k, v]) => (
                <div key={k} className="col-span-2 grid grid-cols-subgrid">
                  <dt className="text-ink-4">{k}</dt>
                  <dd className="text-accent-lift">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {risk.action.to && (
            <p className="mt-2.5 font-mono text-[0.6875rem] text-ink-4">
              to <span className="text-info-lift">{risk.action.to.join(', ')}</span>
            </p>
          )}

          {risk.action.draft &&
            (editing ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={6}
                className="mt-2.5 w-full resize-y rounded-lg border border-hair-2 bg-panel px-3 py-2.5 text-[0.8125rem] leading-[1.65] text-paper outline-none focus:border-accent-lift"
              />
            ) : (
              <p className="mt-2.5 border-l-2 border-agent/50 pl-3 text-[0.8125rem] leading-[1.65] text-paper-3/75 italic">
                {draft}
              </p>
            ))}
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy || gone}
            className="group inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[0.8125rem] font-medium text-white shadow-[0_2px_0_var(--color-accent-ink)] transition-all duration-150 hover:bg-accent-lift active:translate-y-[2px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
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
              className="rounded-full border border-hair-2 px-4 py-2.5 text-[0.8125rem] text-paper-3/80 transition-colors hover:border-paper-3/50 hover:text-paper"
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            disabled={busy || gone}
            className="rounded-full px-3 py-2.5 text-[0.8125rem] text-ink-4 transition-colors hover:text-paper-3 disabled:opacity-40"
          >
            Dismiss
          </button>
        </div>
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
