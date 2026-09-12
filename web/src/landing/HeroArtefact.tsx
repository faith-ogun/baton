import { Chip } from '../ui/ui';
import { CheckIcon, MailIcon } from '../ui/icons';
import { Mark } from '../brand/Mark';

/**
 * The hero image: a cut-down dashboard, on the app's own dark ground.
 *
 * Deliberately not the real force simulation. A hero should be composed and
 * should look identical on every load, so the graph is hand-placed and the
 * only motion is a slow drift plus the one unanswered ask, travelling and
 * never arriving. The real simulation lives at /app.
 */

type N = {
  id: string;
  x: number;
  y: number;
  r: number;
  tone: 'ok' | 'warn' | 'risk' | 'info' | 'agent';
  label?: string;
  drift: 'a' | 'b' | 'c';
};

const TONE: Record<N['tone'], string> = {
  ok: 'var(--color-ok)',
  warn: 'var(--color-warn)',
  risk: 'var(--color-risk)',
  info: 'var(--color-info)',
  agent: 'var(--color-agent)',
};

const NODES: N[] = [
  { id: 'amara', x: 62, y: 66, r: 7, tone: 'ok', drift: 'b' },
  { id: 'nicolas', x: 152, y: 46, r: 10, tone: 'warn', label: 'Nicolas', drift: 'a' },
  { id: 'ask', x: 232, y: 80, r: 6, tone: 'risk', drift: 'c' },
  { id: 'sally', x: 312, y: 54, r: 11, tone: 'risk', label: 'Sally', drift: 'b' },
  { id: 'module3', x: 356, y: 146, r: 8, tone: 'risk', label: 'Filing', drift: 'a' },
  { id: 'sentrix', x: 252, y: 148, r: 9, tone: 'warn', drift: 'c' },
  { id: 'priya', x: 172, y: 168, r: 14, tone: 'warn', label: 'Priya', drift: 'a' },
  { id: 'cmc', x: 96, y: 214, r: 7, tone: 'risk', drift: 'b' },
  { id: 'stab', x: 232, y: 226, r: 6, tone: 'warn', drift: 'c' },
  { id: 'tomas', x: 320, y: 232, r: 9, tone: 'ok', label: 'Tomas', drift: 'b' },
  { id: 'baton', x: 62, y: 148, r: 8, tone: 'agent', drift: 'c' },
];

const AT = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, N>;

const EDGES: [string, string, boolean?][] = [
  ['amara', 'nicolas'],
  ['nicolas', 'ask', true],
  ['ask', 'sally', true],
  ['ask', 'module3', true],
  ['sentrix', 'module3'],
  ['priya', 'cmc'],
  ['priya', 'stab'],
  ['priya', 'sentrix'],
  ['cmc', 'module3', true],
  ['stab', 'tomas'],
  ['baton', 'priya'],
  ['baton', 'sentrix'],
  ['sally', 'sentrix'],
];

function Graph() {
  return (
    <svg viewBox="0 0 420 280" className="h-full w-full" role="img" aria-label="Workspace graph with three nodes at risk">
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1d3c5a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0f2238" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="420" height="280" fill="url(#hero-glow)" />

      {EDGES.map(([a, b, open], i) => {
        const s = AT[a];
        const t = AT[b];
        return (
          <line
            key={i}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke={open ? 'var(--color-risk)' : 'var(--color-hair-2)'}
            strokeWidth={open ? 1.6 : 1}
            strokeOpacity={open ? 0.85 : 0.5}
            strokeDasharray={open ? '5 5' : undefined}
            className={open ? 'bt-dash' : undefined}
          />
        );
      })}

      {NODES.map((n) => (
        <g key={n.id} className={`bt-drift-${n.drift}`} style={{ animationDelay: `${n.x * 8}ms` }}>
          {n.tone === 'risk' && (
            <circle cx={n.x} cy={n.y} r={n.r + 3} fill={TONE.risk} className="bt-halo" />
          )}
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={n.tone === 'agent' ? TONE.agent : TONE[n.tone]}
            fillOpacity={n.tone === 'ok' ? 0.75 : 0.95}
            stroke="var(--color-void)"
            strokeWidth="2"
          />
          {n.label && (
            <text
              x={n.x}
              y={n.y + n.r + 13}
              textAnchor="middle"
              fill="var(--color-ink-4)"
              fontSize="9.5"
              fontFamily="var(--font-mono)"
            >
              {n.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function HeroArtefact() {
  return (
    <div className="grain overflow-hidden rounded-[20px] border border-hair bg-panel shadow-lift">
      {/* the app's own chrome, cut down to what the hero needs to say */}
      <div className="flex items-center gap-3 border-b border-hair bg-void/50 px-4 py-3">
        <Mark size={20} reverse />
        <span className="font-mono text-[0.6875rem] tracking-[0.08em] text-ink-4">
          aldermere.ambi
        </span>
        <span className="ml-auto flex items-center gap-2">
          <Chip tone="onInkAccent">
            <span className="bt-pulse inline-block size-1.5 rounded-full bg-accent-lift" />
            live
          </Chip>
          <span className="hidden items-center gap-1.5 font-mono text-[0.6875rem] text-ink-4 sm:inline-flex">
            health <span className="num text-warn">61</span>
          </span>
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
        <div className="min-h-[260px] border-hair md:border-r">
          <Graph />
        </div>

        {/* the one card, exactly as the product draws it */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <span className="kicker text-ink-4">drop risk</span>
            <span className="h-px flex-1 bg-hair" />
            <span className="num text-[0.6875rem] text-risk">92</span>
          </div>

          <p className="text-[0.9375rem] leading-[1.5] font-medium text-paper">
            Nicolas asked Sally for Module 3 sign-off 6 days ago. No reply, and the filing is in 2
            days.
          </p>

          <div className="flex flex-wrap gap-1.5">
            <Chip tone="risk">open loop</Chip>
            <Chip tone="onInk">Sentrix</Chip>
            <Chip tone="onInk">
              <MailIcon size={11} />
              Mail
            </Chip>
          </div>

          <div className="rounded-xl border border-hair bg-void/60 p-3">
            <p className="kicker mb-2 flex items-center gap-1.5 text-agent-lift">
              <span className="inline-block size-1.5 rounded-full bg-agent" />
              baton proposes
            </p>
            <p className="text-[0.8125rem] leading-[1.6] text-paper-3/80">
              &ldquo;Hi Sally, quick one on Module 3. Nicolas asked for your sign-off on 6
              September and I do not think it reached you as an action&hellip;&rdquo;
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2">
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[0.8125rem] font-medium text-white shadow-[0_2px_0_var(--color-accent-ink)]">
              <CheckIcon size={14} />
              Approve
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-hair-2 px-4 py-2.5 text-[0.8125rem] text-ink-4">
              Edit
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-hair bg-void/50 px-4 py-2.5 font-mono text-[0.6875rem] text-ink-4">
        <span className="inline-block size-1.5 rounded-full bg-agent" />
        <span className="text-paper-3/70">08:12</span>
        Baton chased a missing certificate in &ldquo;Batch 22-041 CoA&rdquo;
        <span className="ml-auto hidden sm:inline">logged to the audit sheet</span>
      </div>
    </div>
  );
}
