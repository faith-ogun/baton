import type { AuditEntry } from '../types';
import { APP_ICON } from '../ui/icons';

function clock(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return sameDay ? time : `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${time}`;
}

/**
 * Everything Baton has done, newest first. This strip is the governance claim
 * made visible: it is the same set of rows that go into the audit sheet in the
 * workspace, which is also where the persistence lives.
 */
export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-[30px] shrink-0 items-center gap-2.5 border-b border-hair px-3.5">
        <span className="baton-rule w-4" />
        <span className="kicker text-dim">audit trail</span>
        <span className="ml-auto font-mono text-[0.625rem] text-dim">
          {entries.length} actions · written to Sheets
        </span>
      </div>

      <ol className="min-h-0 flex-1 divide-y divide-hair overflow-y-auto">
        {entries.map((e, i) => (
          <li
            key={e.id}
            className={`flex items-start gap-2.5 px-3.5 py-2 ${i === 0 ? 'bt-pass bg-agent-soft/45' : ''}`}
          >
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded bg-agent/15 text-agent-ink">
              {APP_ICON(e.app, 12)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.75rem] leading-[1.4] font-medium text-strong">{e.verb}</p>
              <p className="mt-0.5 text-[0.75rem] leading-[1.5] text-dim">{e.detail}</p>
            </div>
            <span className="num shrink-0 pt-0.5 text-[0.625rem] text-dim">{clock(e.at)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
