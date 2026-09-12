import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Arrow } from '../ui/ui';

/**
 * Tour mode.
 *
 * A spotlight cut out of a dim overlay, rather than a carousel of screenshots,
 * so the thing being explained is the real thing: the graph keeps simulating
 * and the numbers keep being the numbers underneath. Each step names one
 * element and says what it is for. Six steps, because anything longer is not a
 * tour, it is a manual.
 */

export interface Step {
  /** data-tour value of the element to spotlight. */
  target: string;
  title: string;
  body: string;
  /** Which side of the spotlight the card sits on. */
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export const STEPS: Step[] = [
  {
    target: 'scope',
    title: 'One team, not a whole company',
    body: 'Baton watches a single workstream and answers to the person accountable for it. Every fix it proposes is one this lead has the standing to send, which is why it is scoped here and not at board level. A director switches between the teams they own.',
    side: 'bottom',
  },
  {
    target: 'graph',
    title: 'The graph is the product',
    body: 'People are circles with initials. Work is squares: an envelope is a thread, a tick is a task, a clock is a deadline. The ring around each one is how much trouble it is in, so you can read what something is and how bad it is separately. A dashed collar means that person is the only owner.',
    side: 'right',
  },
  {
    target: 'queue',
    title: 'What is about to drop',
    body: 'The same risks as a ranked list, worst first, in plain English. Each card names the people, the money at stake and the exact rule that fired, so a score is never something you have to take on trust.',
    side: 'left',
  },
  {
    target: 'proposal',
    title: 'A draft, never a send',
    body: 'Baton writes the message and states the structural change: who it goes to, what moves, when. Edit it or approve it. There is no autonomous mode to switch on, because an agent that surprises you has no value here.',
    side: 'left',
  },
  {
    target: 'audit',
    title: 'Everything it did, written down',
    body: 'Each approval acts in the workspace as Baton, under its own identity, and writes a row here and into an audit sheet inside the workspace. That sheet is also where Baton reads its own history, so it never chases the same thing twice.',
    side: 'top',
  },
  {
    target: 'ask',
    title: 'Ask it, in plain language',
    body: 'Answers are computed from this team\u2019s graph rather than generated, so every one shows the nodes it used and clicking a chip lights them up. It is read-only: ask it to send something and it declines, because there is no path from a question to an action. Ask it about pay or another team and it says that is out of scope.',
    side: 'left',
  },
  {
    target: 'rules',
    title: 'The judgement is a file you can read',
    body: 'Every threshold that decides what counts as dropped lives in one registry. Move a number and the queue re-scores in front of you. The model writes sentences; it never decides whether to act.',
    side: 'left',
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function Tour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  /**
   * The card's own height, measured rather than read off the ref during
   * render. Reading `card.current` while rendering gives null on the first
   * pass, so the first paint used a guessed height; nothing then re-rendered
   * when the ref filled in, and a step placed ABOVE its spotlight stayed
   * wrong for the life of the step. Measuring into state fixes it in one
   * extra frame.
   */
  const [cardH, setCardH] = useState(260);
  const card = useRef<HTMLDivElement>(null);
  const step = STEPS[i]!;

  // Measure on every step, and again on resize, because the spotlight is in
  // viewport coordinates and a resized pane moves everything under it.
  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - 5, left: r.left - 5, width: r.width + 10, height: r.height + 10 });
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 120);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [step.target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') setI((v) => Math.min(STEPS.length - 1, v + 1));
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const last = i === STEPS.length - 1;

  // The card is placed against the spotlight, then clamped into the viewport,
  // so a step near an edge does not push its own explanation off screen.
  const place = (): { top: number; left: number } => {
    const W = 372;
    const H = cardH;
    const m = 16;
    if (!rect) return { top: window.innerHeight / 2 - H / 2, left: window.innerWidth / 2 - W / 2 };
    let top = rect.top;
    let left = rect.left + rect.width + m;
    if (step.side === 'left') left = rect.left - W - m;
    if (step.side === 'top') {
      left = rect.left + rect.width / 2 - W / 2;
      top = rect.top - H - m;
    }
    if (step.side === 'bottom') {
      left = rect.left + rect.width / 2 - W / 2;
      top = rect.top + rect.height + m;
    }
    return {
      top: Math.max(m, Math.min(window.innerHeight - H - m, top)),
      left: Math.max(m, Math.min(window.innerWidth - W - m, left)),
    };
  };

  const pos = place();

  return (
    <>
      <div className="tour-veil" />
      {rect && <div className="tour-spot" style={rect} />}

      <div
        ref={card}
        className="bt-count fixed z-[62] w-[372px] rounded-2xl border border-hair bg-panel p-5 shadow-lift"
        style={{ top: pos.top, left: pos.left }}
        role="dialog"
        aria-label={step.title}
      >
        <div className="flex items-center gap-2.5">
          <span className="baton-rule w-5" />
          <span className="kicker text-dim">
            step {i + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md px-2 py-1 text-[0.75rem] text-dim transition-colors hover:bg-panel-3 hover:text-strong"
          >
            Skip
          </button>
        </div>

        <h3 className="display-tight mt-3 text-[1.1875rem] text-strong">{step.title}</h3>
        <p className="mt-2.5 text-[0.875rem] leading-[1.65] text-mid">{step.body}</p>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex gap-1.5">
            {STEPS.map((s, k) => (
              <button
                key={s.target}
                type="button"
                aria-label={`Go to step ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-1.5 rounded-full transition-all ${
                  k === i ? 'w-5 bg-accent' : 'w-1.5 bg-hair-2 hover:bg-dim'
                }`}
              />
            ))}
          </div>
          {i > 0 && (
            <button
              type="button"
              onClick={() => setI(i - 1)}
              className="ml-auto rounded-full px-3 py-2 text-[0.8125rem] text-mid transition-colors hover:text-strong"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? onClose() : setI(i + 1))}
            className={`group inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.8125rem] font-medium text-white shadow-[0_2px_0_var(--color-accent-ink)] transition-all hover:bg-accent-lift active:translate-y-[2px] active:shadow-none ${
              i > 0 ? '' : 'ml-auto'
            }`}
          >
            {last ? 'Start using it' : 'Next'}
            {!last && <Arrow />}
          </button>
        </div>
      </div>
    </>
  );
}
