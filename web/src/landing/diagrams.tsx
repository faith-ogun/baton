/**
 * The detector diagrams.
 *
 * Each one draws the MECHANISM, not a decorative icon. The test every one has
 * to pass: someone who reads the picture and none of the words should be able
 * to say what Baton noticed and why a person would not have. That rules out
 * the usual pattern of an icon beside three paragraphs, which is what the
 * first version of this page was.
 *
 * They share a mono type scale and the token palette so four different
 * mechanisms read as one system, and a 280 x 156 frame except where a diagram
 * genuinely needs more room: each `Frame` can override its own width and
 * height. That matters because these SVGs deliberately do NOT allow overflow,
 * text escaping its card having been a real bug, so anything drawn past the
 * viewBox is silently clipped rather than spilling.
 */

const W = 280;
const H = 156;

const mono = {
  fontFamily: 'var(--font-mono)',
  fontSize: 8.5,
  letterSpacing: '0.04em',
} as const;

/**
 * `w` exists because the two-state SPOF diagram genuinely needs more
 * horizontal room than the others: it draws the same cluster twice, side by
 * side. Squeezing it into the shared 280 units pushed the right-hand group and
 * its heading past the edge, and since these SVGs deliberately do not allow
 * overflow (text escaping the card was a real bug), the excess was simply
 * clipped.
 */
function Frame({
  children,
  label,
  w = W,
  h = H,
}: {
  children: React.ReactNode;
  label: string;
  w?: number;
  h?: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

/** A person: circle with initials, exactly as the live graph draws one. */
function Person({
  x,
  y,
  r = 11,
  label,
  tone = 'var(--color-ink-4)',
  dim = false,
}: {
  x: number;
  y: number;
  r?: number;
  label: string;
  tone?: string;
  dim?: boolean;
}) {
  return (
    <g opacity={dim ? 0.32 : 1}>
      <circle cx={x} cy={y} r={r} fill="var(--color-canvas)" stroke={tone} strokeWidth="1.8" />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        fill={tone}
        style={{ ...mono, fontSize: r * 0.82, fontWeight: 600 }}
      >
        {label}
      </text>
    </g>
  );
}

function Tick({ x, y, s = 8, tone = 'var(--color-ink-4)' }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g>
      <rect
        x={x - s}
        y={y - s}
        width={s * 2}
        height={s * 2}
        rx={s * 0.36}
        fill="var(--color-canvas)"
        stroke={tone}
        strokeWidth="1.7"
      />
      <path
        d={`M${x - s * 0.46} ${y} L${x - s * 0.06} ${y + s * 0.38} L${x + s * 0.5} ${y - s * 0.4}`}
        stroke={tone}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Envelope({ x, y, w = 13, tone = 'var(--color-risk)' }: { x: number; y: number; w?: number; tone?: string }) {
  const h = w * 0.76;
  return (
    <g>
      <rect
        x={x - w}
        y={y - h}
        width={w * 2}
        height={h * 2}
        rx={4}
        fill="var(--color-canvas)"
        stroke={tone}
        strokeWidth="1.7"
      />
      <path
        d={`M${x - w * 0.62} ${y - h * 0.42} L${x} ${y + h * 0.16} L${x + w * 0.62} ${y - h * 0.42}`}
        stroke={tone}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────
   1. The open loop. One ask, five recipients, no reply, and
   a deadline that did not wait while nobody answered.
   ───────────────────────────────────────────────────────── */

/** 288 wide: the deadline arrowhead on the right sat just past 280. */
const LOOP_W = 288;

export function OpenLoopDiagram() {
  const others = [0, 1, 2, 3];
  return (
    <Frame
      w={LOOP_W}
      label="One ask sent to five recipients, only one of whom it was for, and no reply in six days against a deadline in two"
    >
      <text x="0" y="9" fill="var(--color-ink-3)" style={mono}>
        THE ASK
      </text>

      {/* the sender */}
      <Person x={16} y={44} label="FB" />

      {/* the thread it went into */}
      <path d="M31 44 H56" stroke="var(--color-line-2)" strokeWidth="1.4" />
      <Envelope x={72} y={44} />
      <text x="72" y="70" textAnchor="middle" fill="var(--color-ink-3)" style={mono}>
        5 RECIPIENTS
      </text>

      {/* fan-out: four people it was not for, one it was */}
      {others.map((i) => (
        <g key={i}>
          <path
            d={`M86 44 C110 44 118 ${20 + i * 15} 140 ${20 + i * 15}`}
            stroke="var(--color-line-2)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="2 2.5"
          />
          <circle cx="147" cy={20 + i * 15} r="4.6" fill="var(--color-paper-2)" stroke="var(--color-line-2)" strokeWidth="1.2" />
        </g>
      ))}
      <path d="M86 44 C112 44 122 80 142 80" stroke="var(--color-risk)" strokeWidth="1.6" fill="none" />
      <Person x={157} y={80} label="SA" tone="var(--color-risk)" />
      <text x="157" y="102" textAnchor="middle" fill="var(--color-risk)" style={mono}>
        THE ONE IT WAS FOR
      </text>

      {/* the reply that never came */}
      <path
        d="M172 74 C206 66 212 52 214 46"
        stroke="var(--color-risk)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 4"
        opacity="0.75"
      />
      <g stroke="var(--color-risk)" strokeWidth="1.9" strokeLinecap="round">
        <path d="M210 36 l9 9" />
        <path d="M219 36 l-9 9" />
      </g>
      <text x="240" y="30" textAnchor="middle" fill="var(--color-risk)" style={mono}>
        NO REPLY
      </text>

      {/* the clock that kept running */}
      <text x="0" y="124" fill="var(--color-ink-3)" style={mono}>
        THE CLOCK
      </text>
      <rect x="0" y="132" width={LOOP_W} height="7" rx="3.5" fill="var(--color-paper-2)" />
      <rect x="0" y="132" width="186" height="7" rx="3.5" fill="var(--color-risk)" opacity="0.28" />
      <rect x="0" y="132" width="4" height="7" rx="2" fill="var(--color-ink-4)" />
      <text x="8" y="152" fill="var(--color-ink-3)" style={mono}>
        ASKED
      </text>
      <rect x="184" y="128" width="3" height="15" rx="1.5" fill="var(--color-risk)" />
      <text x="190" y="152" fill="var(--color-risk)" style={mono}>
        6 DAYS OF SILENCE
      </text>
      <path d="M268 128 v15" stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M268 129 l11 3.5 -11 3.5z" fill="var(--color-ink)" />
      <text x={LOOP_W} y="124" textAnchor="end" fill="var(--color-ink)" style={mono}>
        DEADLINE
      </text>
    </Frame>
  );
}

/* ─────────────────────────────────────────────────────────
   2. The stall. The card still looks fine; it is the
   absence of anything that gives it away.
   ───────────────────────────────────────────────────────── */

export function StallDiagram() {
  const activity = [
    [10, 15],
    [26, 22],
    [40, 11],
    [54, 26],
    [70, 18],
    [84, 9],
  ];
  return (
    <Frame label="A task with a normal history of updates that simply stops, eight days of silence, and a due date arriving">
      <text x="0" y="9" fill="var(--color-ink-3)" style={mono}>
        UPDATES ON THE TASK
      </text>

      {/* the history: real activity, then nothing */}
      <g>
        {activity.map(([x, h]) => (
          <rect key={x} x={x} y={74 - h} width="7" height={h} rx="2" fill="var(--color-info)" opacity="0.55" />
        ))}
      </g>
      <rect x="100" y="20" width={W - 100 - 34} height="54" rx="6" fill="var(--color-risk)" opacity="0.09" />
      <path
        d={`M100 20 v54`}
        stroke="var(--color-risk)"
        strokeWidth="1.4"
        strokeDasharray="3 3"
      />
      <text x="108" y="36" fill="var(--color-risk)" style={mono}>
        NOTHING. NO COMMENT,
      </text>
      <text x="108" y="48" fill="var(--color-risk)" style={mono}>
        NO STATUS, NO FILE.
      </text>
      <text x="108" y="66" fill="var(--color-risk)" style={{ ...mono, fontSize: 11, fontWeight: 600 }}>
        8 DAYS
      </text>

      <path d={`M0 74 H${W - 30}`} stroke="var(--color-line-2)" strokeWidth="1.2" />
      <path d={`M${W - 34} 68 v13`} stroke="var(--color-ink)" strokeWidth="2.4" strokeLinecap="round" />
      <path d={`M${W - 34} 69 l11 3.5 -11 3.5z`} fill="var(--color-ink)" />
      <text x={W} y="64" textAnchor="end" fill="var(--color-ink)" style={mono}>
        DUE IN 3
      </text>

      {/* what a person sees instead */}
      <text x="0" y="104" fill="var(--color-ink-3)" style={mono}>
        WHAT THE BOARD SHOWS
      </text>
      <rect x="0" y="112" width={W} height="34" rx="8" fill="var(--color-canvas)" stroke="var(--color-line)" strokeWidth="1.3" />
      <Tick x={20} y={129} />
      <text x="38" y="126" fill="var(--color-ink-2)" style={{ ...mono, fontSize: 9 }}>
        CMC BATCH RECORDS
      </text>
      <text x="38" y="138" fill="var(--color-ink-3)" style={mono}>
        IN PROGRESS · PRIYA R
      </text>
      <rect x="196" y="122" width="70" height="15" rx="7.5" fill="var(--color-ok-soft)" />
      <text x="231" y="132" textAnchor="middle" fill="var(--color-ok)" style={mono}>
        ON TRACK
      </text>
    </Frame>
  );
}

/* ─────────────────────────────────────────────────────────
   3. The unbooked deadline. A date everyone agreed and
   nobody put anywhere a calendar would remind them.
   ───────────────────────────────────────────────────────── */

export function DeadlineDiagram() {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const booked: Record<number, number[]> = {
    0: [0, 2],
    1: [1],
    2: [0, 1, 3],
    3: [],
    4: [2],
  };
  const colW = 48;
  const gap = 10;
  const rowH = 13;
  return (
    <Frame label="A calendar week in which every day has meetings except the day the deadline falls, which has nothing booked against it">
      <text x="0" y="9" fill="var(--color-ink-3)" style={mono}>
        THE TEAM CALENDAR
      </text>

      {days.map((d, i) => {
        const x = i * (colW + gap);
        const isDeadline = i === 3;
        return (
          <g key={d}>
            <text
              x={x + colW / 2}
              y="26"
              textAnchor="middle"
              fill={isDeadline ? 'var(--color-risk)' : 'var(--color-ink-3)'}
              style={mono}
            >
              {d}
            </text>
            <rect
              x={x}
              y="32"
              width={colW}
              height="76"
              rx="5"
              fill={isDeadline ? 'var(--color-risk-soft)' : 'var(--color-paper-2)'}
              stroke={isDeadline ? 'var(--color-risk)' : 'transparent'}
              strokeWidth="1.3"
              strokeDasharray={isDeadline ? '3 3' : undefined}
            />
            {[0, 1, 2, 3].map((slot) =>
              booked[i]!.includes(slot) ? (
                <rect
                  key={slot}
                  x={x + 5}
                  y={38 + slot * (rowH + 4)}
                  width={colW - 10}
                  height={rowH}
                  rx="3"
                  fill="var(--color-info)"
                  opacity="0.5"
                />
              ) : null,
            )}
            {isDeadline && (
              <text x={x + colW / 2} y="74" textAnchor="middle" fill="var(--color-risk)" style={mono}>
                EMPTY
              </text>
            )}
          </g>
        );
      })}

      {/* the commitment, living somewhere the calendar cannot see */}
      <path d="M156 128 C156 118 156 116 156 112" stroke="var(--color-risk)" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M156 110 l-3.6 6 7.2 0z" fill="var(--color-risk)" />
      <rect x="62" y="128" width="188" height="26" rx="7" fill="var(--color-canvas)" stroke="var(--color-risk)" strokeWidth="1.3" />
      <text x="74" y="139" fill="var(--color-ink-2)" style={{ ...mono, fontSize: 9 }}>
        &ldquo;SAFETY TRAINING BY THURSDAY&rdquo;
      </text>
      <text x="74" y="149" fill="var(--color-ink-3)" style={mono}>
        AGREED IN CHAT · NEVER BOOKED
      </text>
    </Frame>
  );
}

/* ─────────────────────────────────────────────────────────
   4. The single point of failure. The only detector that
   needs the whole graph, so the diagram is the graph, twice.
   ───────────────────────────────────────────────────────── */

/** This one is 320 units wide, not 280: it draws the cluster twice. */
const SPOF_W = 320;

export function SpofDiagram() {
  const tasks = [
    [26, 96],
    [58, 118],
    [96, 122],
    [124, 100],
  ];
  return (
    <Frame
      w={SPOF_W}
      h={164}
      label="Four critical tasks all owned by one person, shown once as they look today and once with that person unavailable, when all four turn red"
    >
      <text x="0" y="9" fill="var(--color-ink-3)" style={mono}>
        TODAY
      </text>
      {/* Right-aligned to the frame edge rather than positioned from the left,
          so the heading can never run off however long the wording gets. */}
      <text x={SPOF_W} y="9" textAnchor="end" fill="var(--color-risk)" style={mono}>
        ONE PERSON, ONE DAY OFF
      </text>

      {/* divider between the two states */}
      <path d={`M155 14 V${H}`} stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 4" />

      {/* left: as it looks */}
      <g>
        {tasks.map(([x, y]) => (
          <g key={x}>
            <path d={`M75 60 L${x} ${y}`} stroke="var(--color-line-2)" strokeWidth="1.1" />
            <Tick x={x} y={y} tone="var(--color-warn)" />
          </g>
        ))}
        <circle cx="75" cy="60" r="15.5" fill="none" stroke="var(--color-accent)" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
        <Person x={75} y={60} r={12} label="PR" tone="var(--color-warn)" />
        <text x="75" y="34" textAnchor="middle" fill="var(--color-ink-3)" style={mono}>
          SOLE OWNER
        </text>
      </g>

      {/* right: the same graph with the owner removed. Ticks are pulled in to
          0.7 of their original spread so the outermost one, plus its own half
          width, still lands inside the frame. */}
      <g transform="translate(170, 0)">
        {tasks.map(([x, y]) => {
          const tx = x * 0.7 + 14;
          return (
            <g key={x}>
              <path
                d={`M75 60 L${tx} ${y}`}
                stroke="var(--color-risk)"
                strokeWidth="1.1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <Tick x={tx} y={y} tone="var(--color-risk)" />
            </g>
          );
        })}
        <Person x={75} y={60} r={12} label="PR" tone="var(--color-ink-4)" dim />
        <g stroke="var(--color-risk)" strokeWidth="2" strokeLinecap="round">
          <path d="M66 51 l18 18" />
          <path d="M84 51 l-18 18" />
        </g>
        <text x="75" y="34" textAnchor="middle" fill="var(--color-risk)" style={mono}>
          4 ITEMS STOP
        </text>
      </g>

      <text x="0" y={H - 10} fill="var(--color-ink-3)" style={mono}>
        BETWEENNESS 0.96
      </text>
      <text x="0" y={H - 1} fill="var(--color-ink-3)" style={mono}>
        NOT VISIBLE FROM INSIDE ANY ONE INBOX
      </text>
    </Frame>
  );
}
