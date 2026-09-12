import { Chip, Container, SectionHead } from '../ui/ui';
import { CheckIcon, GraphIcon, LockIcon, SheetsIcon, WebhookIcon } from '../ui/icons';

const STEPS = [
  {
    icon: WebhookIcon,
    n: '01',
    title: 'It notices, in about a tenth of a second',
    body:
      'Baton subscribes to the workspace webhooks, so a new mail, a reassigned task or a shared document reaches it the moment it happens. A sweep every 45 seconds catches the risks that have no event at all, because nothing happening is the whole problem with a stall.',
    chip: 'webhooks + a 45s sweep',
  },
  {
    icon: GraphIcon,
    n: '02',
    title: 'It rebuilds the graph, not just the record',
    body:
      'People, tasks, threads, deadlines and projects become nodes; asks, assignments and mentions become edges. That structure is what lets it see a single point of failure, which no individual record contains.',
    chip: 'NetworkX, in memory',
  },
  {
    icon: CheckIcon,
    n: '03',
    title: 'Rules score the risk, a model writes the sentence',
    body:
      'Detection and severity are deterministic, every time, from thresholds you can read. The model is used for exactly three things: deciding whether a message is an ask and to whom, working out which project a loosely named one is, answering plain-language questions about the graph, and drafting the message a human will read.',
    chip: 'rules decide, the model writes',
  },
  {
    icon: LockIcon,
    n: '04',
    title: 'You approve. Nothing moves before you do',
    body:
      'Every intervention arrives as a draft with the recipient named and the change spelled out. Edit it, approve it, or dismiss it. There is no autonomous mode to turn on, because the value here is trust and an agent that surprises you has none.',
    chip: 'human in the loop, always',
  },
  {
    icon: SheetsIcon,
    n: '05',
    title: 'It acts as itself, and writes down what it did',
    body:
      'The nudge sends from Baton, not from you. The task moves, the hold appears, and a row lands in an audit sheet inside the workspace, which is also where Baton reads its own history so it never chases the same thing twice.',
    chip: 'idempotent sends, audited rows',
  },
];

export function Loop() {
  return (
    <section id="loop" className="py-20 sm:py-24">
      <Container>
        <SectionHead
          kicker="the loop"
          title={
            <>
              Detect, propose, approve, act,{' '}
              <em className="display-em text-accent-mid">log</em>.
            </>
          }
          lede="Five steps, and the fourth one is a person. That is the design, not a limitation of it."
        />

        <ol className="mt-12 space-y-4">
          {STEPS.map(({ icon: Icon, ...s }) => (
            <li
              key={s.n}
              className="reveal grid gap-5 rounded-2xl border border-line bg-card p-6 shadow-paper sm:grid-cols-[auto_1fr] sm:gap-7 sm:p-7"
            >
              <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
                <span className="num text-[1.75rem] leading-none text-paper-3">{s.n}</span>
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-ink text-paper">
                  <Icon size={19} />
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="display-tight text-[1.3rem] text-balance">{s.title}</h3>
                <p className="mt-3 max-w-[64ch] text-[0.9375rem] leading-[1.75] text-ink-2">
                  {s.body}
                </p>
                <div className="mt-4">
                  <Chip tone="neutral">{s.chip}</Chip>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
