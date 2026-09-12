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

/**
 * Nodes in the hero are drawn with the SAME visual language as the live graph
 * at /app: a person is a circle with their initials, work is a rounded square
 * carrying a glyph that says which kind it is, and the ring around either one
 * is how much trouble it is in. That consistency is the point. A hero full of
 * anonymous coloured dots teaches the reader nothing, and then the real
 * product has to teach them the same thing again from scratch.
 */

type Kind = 'person' | 'thread' | 'task' | 'deadline' | 'project';
type Tone = 'ok' | 'warn' | 'risk' | 'agent';

type N = {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  r: number;
  tone: Tone;
  /** Initials for a person, nothing for work. */
  who?: string;
  label?: string;
  drift: 'a' | 'b' | 'c';
};

const TONE: Record<Tone, string> = {
  ok: 'var(--color-ok)',
  warn: 'var(--color-warn)',
  risk: 'var(--color-risk)',
  agent: 'var(--color-agent)',
};

const NODES: N[] = [
  { id: 'rachel', kind: 'person', x: 58, y: 62, r: 10, tone: 'ok', who: 'RF', drift: 'b' },
  { id: 'nicolas', kind: 'person', x: 142, y: 44, r: 11, tone: 'warn', who: 'NB', label: 'Nicolas', drift: 'a' },
  { id: 'ask', kind: 'thread', x: 224, y: 74, r: 10, tone: 'risk', drift: 'c' },
  { id: 'sally', kind: 'person', x: 308, y: 50, r: 12, tone: 'risk', who: 'SA', label: 'Sally', drift: 'b' },
  { id: 'module3', kind: 'deadline', x: 352, y: 142, r: 10, tone: 'risk', label: 'Filing', drift: 'a' },
  { id: 'sentrix', kind: 'project', x: 246, y: 146, r: 10, tone: 'warn', drift: 'c' },
  { id: 'priya', kind: 'person', x: 160, y: 166, r: 14, tone: 'warn', who: 'PR', label: 'Priya', drift: 'a' },
  { id: 'cmc', kind: 'task', x: 84, y: 212, r: 9, tone: 'risk', drift: 'b' },
  { id: 'stab', kind: 'task', x: 226, y: 224, r: 9, tone: 'warn', drift: 'c' },
  { id: 'tomas', kind: 'person', x: 316, y: 230, r: 10, tone: 'ok', who: 'TL', drift: 'b' },
  { id: 'baton', kind: 'person', x: 58, y: 148, r: 10, tone: 'agent', who: 'BA', drift: 'c' },
];

const AT = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, N>;

const EDGES: [string, string, boolean?][] = [
  ['rachel', 'nicolas'],
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

/** The glyph that says which kind of work this is. */
function Glyph({ n, colour }: { n: N; colour: string }) {
  const u = n.r * 0.5;
  const line = {
    stroke: colour,
    strokeWidth: 1.5,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (n.kind) {
    case 'thread':
      return (
        <g>
          <rect x={n.x - u} y={n.y - u * 0.68} width={u * 2} height={u * 1.36} {...line} />
          <path d={`M${n.x - u} ${n.y - u * 0.68} L${n.x} ${n.y + u * 0.16} L${n.x + u} ${n.y - u * 0.68}`} {...line} />
        </g>
      );
    case 'task':
      return (
        <path
          d={`M${n.x - u * 0.86} ${n.y} L${n.x - u * 0.12} ${n.y + u * 0.7} L${n.x + u * 0.9} ${n.y - u * 0.72}`}
          {...line}
        />
      );
    case 'deadline':
      return (
        <g>
          <circle cx={n.x} cy={n.y} r={u * 0.92} {...line} />
          <path d={`M${n.x} ${n.y - u * 0.52} L${n.x} ${n.y} L${n.x + u * 0.42} ${n.y + u * 0.24}`} {...line} />
        </g>
      );
    case 'project':
      return (
        <g>
          {[-1, 0, 1].map((i) => (
            <path key={i} d={`M${n.x - u * 0.9} ${n.y + i * u * 0.52} H${n.x + u * 0.9}`} {...line} />
          ))}
        </g>
      );
    default:
      return null;
  }
}

function Node({ n }: { n: N }) {
  const colour = TONE[n.tone];
  const w = n.kind === 'project' ? n.r * 1.5 : n.r;
  const h = n.kind === 'thread' ? n.r * 0.82 : n.r;
  return (
    <g className={`bt-drift-${n.drift}`} style={{ animationDelay: `${n.x * 8}ms` }}>
      {n.tone === 'risk' && <circle cx={n.x} cy={n.y} r={n.r + 4} fill={colour} className="bt-halo" />}

      {n.kind === 'person' ? (
        <>
          <circle cx={n.x} cy={n.y} r={n.r} fill="var(--color-panel)" stroke={colour} strokeWidth="2.2" />
          <text
            x={n.x}
            y={n.y + n.r * 0.32}
            textAnchor="middle"
            fill={colour}
            style={{ fontFamily: 'var(--font-mono)', fontSize: n.r * 0.86, fontWeight: 600 }}
          >
            {n.who}
          </text>
        </>
      ) : (
        <>
          <rect
            x={n.x - w}
            y={n.y - h}
            width={w * 2}
            height={h * 2}
            rx={Math.min(w, h) * 0.36}
            fill="var(--color-panel)"
            stroke={colour}
            strokeWidth="2.2"
          />
          <Glyph n={n} colour={colour} />
        </>
      )}

      {n.label && (
        <text
          x={n.x}
          y={n.y + n.r + 13}
          textAnchor="middle"
          fill={n.tone === 'risk' ? colour : 'var(--color-ink-4)'}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5 }}
        >
          {n.label}
        </text>
      )}
    </g>
  );
}

function Graph() {
  return (
    <svg
      viewBox="0 0 420 280"
      className="h-full w-full"
      role="img"
      aria-label="A workspace graph in which one unanswered ask, one stalled task and one deadline are at risk"
    >
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="var(--color-panel-3)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-panel)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="420" height="280" fill="url(#hero-glow)" />

      {EDGES.map(([a, b, open], i) => {
        const s = AT[a]!;
        const t = AT[b]!;
        return (
          <line
            key={i}
            x1={s.x}
            y1={s.y}
            x2={t.x}
            y2={t.y}
            stroke={open ? 'var(--color-risk)' : 'var(--color-hair-2)'}
            strokeWidth={open ? 1.6 : 1}
            strokeOpacity={open ? 0.85 : 0.55}
            strokeDasharray={open ? '5 5' : undefined}
            className={open ? 'bt-dash' : undefined}
          />
        );
      })}

      {NODES.map((n) => (
        <Node key={n.id} n={n} />
      ))}
    </svg>
  );
}

export function HeroArtefact() {
  return (
    <div className="grain overflow-hidden rounded-[20px] border border-hair bg-panel shadow-lift">
      {/* the app's own chrome, cut down to what the hero needs to say */}
      <div className="flex items-center gap-3 border-b border-hair bg-panel-2 px-4 py-3">
        <Mark size={20} />
        <span className="font-mono text-[0.6875rem] tracking-[0.08em] text-dim">
          aldermere.ambi
        </span>
        <span className="ml-auto flex items-center gap-2">
          <Chip tone="accent">
            <span className="bt-pulse inline-block size-1.5 rounded-full bg-accent" />
            live
          </Chip>
          <span className="hidden items-center gap-1.5 font-mono text-[0.6875rem] text-dim sm:inline-flex">
            health <span className="num text-warn">52</span>
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
            <span className="kicker text-dim">drop risk</span>
            <span className="h-px flex-1 bg-hair" />
            <span className="num text-[0.6875rem] text-risk">92</span>
          </div>

          <p className="text-[0.9375rem] leading-[1.5] font-medium text-strong">
            Nicolas asked Sally for Module 3 sign-off 6 days ago. No reply, and the filing is in 2
            days.
          </p>

          <div className="flex flex-wrap gap-1.5">
            <Chip tone="risk">open loop</Chip>
            <Chip tone="neutral">Sentrix</Chip>
            <Chip tone="neutral">
              <MailIcon size={11} />
              Mail
            </Chip>
          </div>

          <div className="rounded-xl border border-hair bg-panel-2 p-3">
            <p className="kicker mb-2 flex items-center gap-1.5 text-agent-ink">
              <span className="inline-block size-1.5 rounded-full bg-agent" />
              baton proposes
            </p>
            <p className="text-[0.8125rem] leading-[1.6] text-mid">
              &ldquo;Hi Sally, quick one on Module 3. Nicolas asked for your sign-off on 6
              September and I do not think it reached you as an action&hellip;&rdquo;
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2">
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[0.8125rem] font-medium text-white shadow-[0_2px_0_var(--color-accent-ink)]">
              <CheckIcon size={14} />
              Approve
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-hair px-4 py-2.5 text-[0.8125rem] text-mid">
              Edit
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-hair bg-panel-2 px-4 py-2.5 font-mono text-[0.6875rem] text-dim">
        <span className="inline-block size-1.5 rounded-full bg-agent" />
        <span className="text-dim">08:12</span>
        Baton chased a missing certificate in &ldquo;Batch 22-041 CoA&rdquo;
        <span className="ml-auto hidden sm:inline">logged to the audit sheet</span>
      </div>
    </div>
  );
}
