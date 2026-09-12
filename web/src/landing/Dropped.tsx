import { Chip, Container, SectionHead } from '../ui/ui';
import { DeadlineIcon, OpenLoopIcon, SpofIcon, StalledIcon } from '../ui/icons';

const DETECTORS = [
  {
    icon: OpenLoopIcon,
    name: 'The open loop',
    rule: 'open_loop_ask',
    claim: 'Somebody asked. Nobody answered. Everybody assumed it was handled.',
    body:
      'A request buried in a thread with five recipients is a request addressed to no one. Baton reads who was actually being asked, watches whether that specific person ever replied, and counts in business days, not calendar days.',
    signal: 'unanswered 3 business days, escalated inside 2 days of a deadline',
  },
  {
    icon: StalledIcon,
    name: 'The stall',
    rule: 'stalled_task',
    claim: 'The task is not blocked, not done, and not moving.',
    body:
      'No status change, no comment, no attachment. A stall is invisible in a board view because the card still looks fine; it is only the silence that gives it away, and silence is exactly what a person does not notice.',
    signal: 'no update in 5 days and due inside 3',
  },
  {
    icon: DeadlineIcon,
    name: 'The unbooked deadline',
    rule: 'deadline',
    claim: 'A date everybody agreed to and nobody put in a calendar.',
    body:
      'Baton cross-checks every commitment it can find in tasks, threads and the CRM against the calendar. A deadline with no hold against it has nothing in the workspace that will ever remind anyone it exists.',
    signal: 'a commitment inside 3 days with no calendar hold',
  },
  {
    icon: SpofIcon,
    name: 'The single point of failure',
    rule: 'spof',
    claim: 'One person is the only way four critical things happen.',
    body:
      'This one is structural, so it needs the graph. Baton counts sole-owned critical items and measures betweenness across the whole workspace. It is the risk nobody can see from inside their own inbox, because the shape only exists above the team.',
    signal: 'more than 3 sole-owned critical items, betweenness above the 90th percentile',
  },
];

export function Dropped() {
  return (
    <section id="dropped" className="border-y border-line bg-paper py-20 sm:py-24">
      <Container>
        <SectionHead
          kicker="what gets dropped"
          title={
            <>
              Work does not fall through the cracks at random. It falls through{' '}
              <em className="display-em text-accent-mid">four</em> of them.
            </>
          }
          lede="Each one is a detector with a rule behind it, not a vibe from a model. The rules live in one file you can read, and the thresholds are yours to move."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {DETECTORS.map(({ icon: Icon, ...d }, i) => (
            <li
              key={d.rule}
              className="reveal group relative flex flex-col rounded-2xl border border-line bg-card p-6 shadow-paper transition-shadow duration-300 hover:shadow-lift"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="display-tight text-[1.25rem]">{d.name}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-[1.5] font-medium text-ink">
                    {d.claim}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[0.9375rem] leading-[1.7] text-ink-2">{d.body}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Chip tone="accent">{d.rule}</Chip>
                <span className="font-mono text-[0.6875rem] leading-relaxed text-ink-3">
                  {d.signal}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
