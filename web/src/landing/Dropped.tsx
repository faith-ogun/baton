import { Chip, Container, SectionHead } from '../ui/ui';
import { DeadlineDiagram, OpenLoopDiagram, SpofDiagram, StallDiagram } from './diagrams';

/**
 * The four detectors, each led by a diagram of its own mechanism rather than
 * an icon. The diagram carries the explanation and the prose gets out of its
 * way, which is the opposite of how this section started.
 */

const DETECTORS = [
  {
    diagram: OpenLoopDiagram,
    name: 'The open loop',
    rule: 'open_loop_ask',
    claim: 'Somebody asked. Nobody answered. Everybody assumed it was handled.',
    body: 'A request sent to five people is a request addressed to no one. Baton works out who was actually being asked, watches whether that specific person ever replied, and counts in business days.',
    signal: 'unanswered 3 business days, escalated inside 2 days of a deadline',
    cost: '£21.8k',
  },
  {
    diagram: StallDiagram,
    name: 'The stall',
    rule: 'stalled_task',
    claim: 'The task is not blocked, not done, and not moving.',
    body: 'No status change, no comment, no attachment. A stall is invisible on a board because the card still says in progress. Only the silence gives it away, and silence is exactly what a person does not notice.',
    signal: 'no update in 5 days and due inside 3',
    cost: '£6.2k',
  },
  {
    diagram: DeadlineDiagram,
    name: 'The unbooked deadline',
    rule: 'deadline',
    claim: 'A date everybody agreed to and nobody put in a calendar.',
    body: 'Baton cross-checks every commitment it can find in tasks, threads and the CRM against the calendar. A date with no hold against it has nothing anywhere that will ever remind a single person it exists.',
    signal: 'a commitment inside 3 days with no calendar hold',
    cost: '£3.1k',
  },
  {
    diagram: SpofDiagram,
    name: 'The single point of failure',
    rule: 'spof',
    claim: 'One person is the only way four critical things happen.',
    body: 'This one is structural, so it needs the whole graph. Baton counts sole-owned critical items and measures betweenness across the workspace. It is the risk nobody can see from inside their own inbox, because the shape only exists above the team.',
    signal: 'more than 3 sole-owned critical items, betweenness above the 90th percentile',
    cost: '£10.4k',
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
          lede="Each one is a detector with a rule behind it, not a judgement from a model. Here is the shape each one actually looks for."
        />

        <ul className="mt-12 space-y-5">
          {DETECTORS.map(({ diagram: Diagram, ...d }, i) => (
            <li
              key={d.rule}
              className="reveal grid gap-6 rounded-2xl border border-line bg-card p-6 shadow-paper sm:p-7 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-9"
            >
              {/* the mechanism, drawn */}
              <div className={`min-w-0 ${i % 2 ? 'lg:order-2' : ''}`}>
                <div className="rounded-xl border border-line bg-paper-2/50 p-4 sm:p-5">
                  <Diagram />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="num text-[0.75rem] text-paper-3">0{i + 1}</span>
                  <span className="h-px flex-1 bg-line" />
                  <Chip tone="risk">{d.cost} in the demo workspace</Chip>
                </div>
                <h3 className="display-tight mt-3.5 text-[1.5rem]">{d.name}</h3>
                <p className="mt-2 text-[1.0625rem] leading-[1.45] font-medium text-ink">
                  {d.claim}
                </p>
                <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-ink-2">{d.body}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <Chip tone="accent">{d.rule}</Chip>
                  <span className="font-mono text-[0.6875rem] leading-relaxed text-ink-3">
                    {d.signal}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
