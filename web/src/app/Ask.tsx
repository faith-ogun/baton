import { useEffect, useRef, useState } from 'react';
import type { WorkspaceState } from '../types';
import { LockIcon } from '../ui/icons';
import { type Answer, SUGGESTIONS, answer } from './answer';

/**
 * Ask: plain-language questions about the workspace, grounded and read-only.
 *
 * Two things are deliberately visible in the UI rather than merely true in the
 * code. Every answer shows the nodes it was computed from as chips you can
 * click, which then light up in the graph, so the grounding is checkable
 * rather than claimed. And the footer states that it cannot act, which the
 * suggested question "Send Sally a nudge" then demonstrates: it declines, and
 * explains that the only route to an action is the Approve button.
 */

const TONE: Record<Answer['kind'], { label: string; colour: string }> = {
  answer: { label: 'from the graph', colour: 'var(--color-ok)' },
  empty: { label: 'not in the graph', colour: 'var(--color-dim)' },
  refused: { label: 'out of scope', colour: 'var(--color-warn)' },
  'cannot-act': { label: 'read-only', colour: 'var(--color-agent)' },
};

export function Ask({
  state,
  onCite,
  onClose,
}: {
  state: WorkspaceState;
  onCite: (nodeId: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<Answer | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const ask = (text: string) => {
    setQ(text);
    setResult(answer(text, state));
  };

  const tone = result ? TONE[result.kind] : null;

  return (
    <aside className="flex h-full w-[352px] shrink-0 flex-col border-l border-hair bg-panel">
      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-hair px-3.5">
        <span className="baton-rule w-4" />
        <span className="kicker text-dim">ask the workspace</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto font-mono text-[0.625rem] tracking-[0.08em] text-dim uppercase transition-colors hover:text-strong"
        >
          Esc
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="shrink-0 border-b border-hair p-3"
      >
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Who has not replied?"
          className="w-full rounded border border-hair bg-void px-2.5 py-2 text-[0.8125rem] text-strong outline-none placeholder:text-dim focus:border-accent"
        />
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {result ? (
          <div className="bt-count">
            <p
              className="kicker mb-2 flex items-center gap-1.5"
              style={{ color: tone!.colour }}
            >
              <span className="inline-block size-1.5 rounded-full" style={{ background: tone!.colour }} />
              {tone!.label}
            </p>
            <p className="text-[0.875rem] leading-[1.65] text-strong">{result.text}</p>

            {result.basis && (
              <p className="mt-3 rounded bg-panel-2 px-2.5 py-2 font-mono text-[0.625rem] leading-[1.6] text-dim">
                {result.basis}
              </p>
            )}

            {result.cites.length > 0 && (
              <div className="mt-3">
                <p className="kicker mb-2 text-dim">computed from</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.cites.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onCite(c.id)}
                      className="rounded border border-hair bg-panel-2 px-2 py-1 font-mono text-[0.625rem] text-mid transition-colors hover:border-accent hover:text-strong"
                      title="Highlight in the graph"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="text-[0.8125rem] leading-[1.6] text-dim">
              Answers are computed from this team&rsquo;s graph, not generated, which is why each
              one shows what it used. The last two are here on purpose: they get turned down.
            </p>
            <div className="mt-3 space-y-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="block w-full rounded px-2 py-1.5 text-left text-[0.8125rem] text-mid transition-colors hover:bg-panel-2 hover:text-strong"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-t border-hair px-3.5 py-2 font-mono text-[0.625rem] text-dim">
        <LockIcon size={12} />
        read-only. it cannot act
      </div>
    </aside>
  );
}
