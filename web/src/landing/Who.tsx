import { Chip, Container, Kicker, SectionHead } from '../ui/ui';

/**
 * Who this is for, and why it is scoped where it is.
 *
 * This section exists because the obvious pitch for a product that "sees the
 * whole graph" is a board-level overview, and that pitch is wrong. The
 * diagram makes the argument structurally: standing to send is what decides
 * the scope, not how much you can see.
 */

const JOURNEY = [
  {
    when: 'Monday, 08:40',
    who: 'Rachel opens Baton',
    what: 'Five things are about to drop and one of them is worth twenty-two thousand pounds. She has not opened a single app yet.',
  },
  {
    when: '08:41',
    who: 'She reads the top card',
    what: 'Frank asked Sally for a sign-off six days ago. Rachel did not know, because she was not on the thread, and neither of them thought to tell her.',
  },
  {
    when: '08:42',
    who: 'She checks why it fired',
    what: 'Unanswered six business days against a threshold of three, with a deadline inside two. Not a hunch. A rule with a number she set.',
  },
  {
    when: '08:43',
    who: 'She edits one line and approves',
    what: 'Baton replies in the existing thread, to Sally alone, stating the date. It goes out as Baton, not as Rachel, so it is a system nudge and nobody is being told off.',
  },
  {
    when: '08:45',
    who: 'She approves two more and closes it',
    what: 'A task gets a second owner, a hold goes in the calendar, and four rows land in the audit sheet. Team health moves from 52 to 71. Total time: five minutes.',
  },
];

function ScopeDiagram() {
  const teams = [
    { name: 'Regulatory', n: 8, health: 52, tone: 'var(--color-risk)' },
    { name: 'CMC / quality', n: 11, health: 71, tone: 'var(--color-warn)' },
    { name: 'Clinical ops', n: 9, health: 84, tone: 'var(--color-ok)' },
  ];
  return (
    <svg viewBox="0 0 520 250" className="h-auto w-full" role="img" aria-label="A director sees a roll-up of the teams they own, each team's lead owns one board, and nobody gets a single view of a whole company">
      {/* the level that does not work */}
      <rect x="0" y="0" width="520" height="46" rx="10" fill="var(--color-paper-2)" strokeDasharray="4 4" stroke="var(--color-line-2)" strokeWidth="1.3" />
      <text x="16" y="21" fill="var(--color-ink-3)" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em' }}>
        WHOLE-COMPANY VIEW
      </text>
      <text x="16" y="35" fill="var(--color-ink-3)" style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
        900 NODES, UNREADABLE, AND NOBODY HERE CAN SEND THE NUDGE
      </text>
      <g stroke="var(--color-risk)" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        <path d="M486 14 l16 16" />
        <path d="M502 14 l-16 16" />
      </g>

      {/* the director */}
      <rect x="150" y="70" width="220" height="42" rx="10" fill="var(--color-canvas)" stroke="var(--color-line-2)" strokeWidth="1.4" />
      <circle cx="176" cy="91" r="11" fill="var(--color-info-soft)" stroke="var(--color-info)" strokeWidth="1.6" />
      <text x="176" y="95" textAnchor="middle" fill="var(--color-info-ink)" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600 }}>
        DR
      </text>
      <text x="196" y="88" fill="var(--color-ink)" style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 600 }}>
        Director
      </text>
      <text x="196" y="101" fill="var(--color-ink-3)" style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5 }}>
        SWITCHES BETWEEN THE THREE
      </text>

      {/* down to the three teams */}
      {teams.map((t, i) => {
        const x = i * 178;
        return (
          <g key={t.name}>
            <path
              d={`M260 112 C260 130 ${x + 76} 130 ${x + 76} 150`}
              stroke="var(--color-line-2)"
              strokeWidth="1.2"
              fill="none"
            />
            <rect x={x} y="150" width="152" height="86" rx="10" fill="var(--color-canvas)" stroke={i === 0 ? 'var(--color-accent)' : 'var(--color-line)'} strokeWidth={i === 0 ? 1.8 : 1.3} />
            <text x={x + 14} y="172" fill="var(--color-ink)" style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600 }}>
              {t.name}
            </text>
            <text x={x + 14} y="186" fill="var(--color-ink-3)" style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5 }}>
              {t.n} PEOPLE · ONE LEAD
            </text>
            {/* the health bar */}
            <rect x={x + 14} y="196" width="124" height="6" rx="3" fill="var(--color-paper-2)" />
            <rect x={x + 14} y="196" width={(124 * t.health) / 100} height="6" rx="3" fill={t.tone} />
            <text x={x + 14} y="218" fill="var(--color-ink-2)" style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5 }}>
              HEALTH {t.health}
            </text>
            {i === 0 && (
              <>
                <rect x={x + 96} y="207" width="46" height="15" rx="7.5" fill="var(--color-accent-soft)" />
                <text x={x + 119} y="217" textAnchor="middle" fill="var(--color-accent-ink)" style={{ fontFamily: 'var(--font-mono)', fontSize: 8 }}>
                  5 OPEN
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Who() {
  return (
    <section id="who" className="py-20 sm:py-24">
      <Container>
        <SectionHead
          kicker="who this is for"
          title={
            <>
              The person who owns the date, not the person who owns the{' '}
              <em className="display-em text-accent-mid">company</em>.
            </>
          }
          lede="Baton is scoped to one workstream and answers to its lead. That is not a limitation of the graph; it is what makes the fixes usable."
        />

        {/* The diagram beside the argument, and then the deployment shape
            running the full width underneath as three side-by-side items.
            It used to be a second card stacked in the right column, which made
            that column much taller than the diagram and left a large hole to
            the left of it. Three short columns are the right shape for the
            space; one tall card was not. */}
        <div className="mt-11 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-stretch">
          <div className="reveal rounded-2xl border border-line bg-card p-6 shadow-paper">
            <ScopeDiagram />
          </div>

          <div className="reveal flex flex-col justify-center rounded-2xl border border-line bg-card p-6 shadow-paper">
            <Kicker>the constraint nobody mentions</Kicker>
            <h3 className="display-tight mt-3 text-[1.375rem]">
              A fix is only useful if the person approving it can send it.
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-[1.7] text-ink-2">
              Baton&rsquo;s output is always a message or a change with someone&rsquo;s name on it.
              A chief executive cannot approve &ldquo;Sally, this is the last working day this can
              move&rdquo; to somebody three levels down they have never worked with; it would land
              as a summons, not a nudge. The person who can send that sentence is the one
              accountable for the date. So that is who Baton reports to, and it is why the
              board-level view at the top of that diagram has a cross through it rather than being
              the flagship feature.
            </p>
          </div>
        </div>

        <div className="reveal mt-5 rounded-2xl border border-line bg-card p-6 shadow-paper sm:p-7">
          <Kicker>the shape of a deployment</Kicker>
          <dl className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              ['One workstream', 'Five to thirty people, one accountable lead, one set of dates. The graph stays readable, and every risk names people the lead actually knows.'],
              ['One coworker per team', 'Baton is provisioned into the workspace as a member, so its permissions are that team’s permissions and it can never reach further than the team can.'],
              ['A roll-up for a director', 'Somebody who owns three teams switches between three boards and sees three health numbers. It is a switcher, not a merge: the risks stay where the standing to fix them is.'],
            ].map(([t, d]) => (
              <div key={t}>
                <div className="flex items-center gap-2.5">
                  <span className="baton-rule w-4" />
                  <dt className="text-[0.9375rem] font-semibold text-ink">{t}</dt>
                </div>
                <dd className="mt-2 text-[0.875rem] leading-[1.65] text-ink-2">{d}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the journey */}
        <div className="mt-14">
          <div className="flex items-center gap-3">
            <span className="baton-rule w-7" />
            <Kicker>five minutes on a monday</Kicker>
          </div>
          <h3 className="display-tight mt-4 max-w-2xl text-[1.75rem] text-balance sm:text-[2.1rem]">
            Rachel leads regulatory affairs at Aldermere Bio. Here is her whole week&rsquo;s worth of
            chasing.
          </h3>

          <ol className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-5">
            {JOURNEY.map((s, i) => (
              <li key={s.when} className="reveal flex flex-col bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="num text-[0.75rem] text-accent-ink">{s.when}</span>
                  {i === 4 && <Chip tone="ok">done</Chip>}
                </div>
                <p className="mt-3 text-[0.9375rem] leading-[1.4] font-semibold text-ink">{s.who}</p>
                <p className="mt-2 text-[0.875rem] leading-[1.6] text-ink-2">{s.what}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
