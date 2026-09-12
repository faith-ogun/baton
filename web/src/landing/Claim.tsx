import { Container, Kicker } from '../ui/ui';
import {
  CalendarIcon,
  ChatIcon,
  CrmIcon,
  MailIcon,
  SheetsIcon,
  TasksIcon,
} from '../ui/icons';

const SURFACE = [
  { icon: MailIcon, app: 'Mail', reads: 'who asked whom, and who never replied', acts: 'sends the nudge, in the same thread' },
  { icon: ChatIcon, app: 'Chat', reads: 'the side conversation the task never got', acts: 'asks one line where the team already is' },
  { icon: TasksIcon, app: 'Tasks', reads: 'owner, status, due date, last movement', acts: 'reassigns, comments, sets the checkpoint' },
  { icon: CalendarIcon, app: 'Calendar', reads: 'what is actually booked against a date', acts: 'creates the hold everyone can make' },
  { icon: CrmIcon, app: 'CRM', reads: 'which account the "Sentrix thing" means', acts: 'links the work back to the record' },
  { icon: SheetsIcon, app: 'Sheets', reads: 'its own history, so it never repeats itself', acts: 'writes every action to the audit log' },
];

export function Claim() {
  return (
    <section id="claim" className="grain relative overflow-hidden bg-ink py-20 text-paper sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(900px 340px at 15% 0%, #1d3c5a, transparent 70%)',
        }}
      />
      <img
        src="/brand/baton-mark-reverse.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-16 w-[380px] opacity-[0.07] select-none"
      />

      <Container className="relative">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="baton-rule w-7" />
            <Kicker tone="paper">the claim</Kicker>
          </div>
          <h2 className="display-tight mt-4 text-[2rem] text-balance sm:text-[2.8rem]">
            This cannot exist in a chat window. Not as a worse version.{' '}
            <em className="display-em text-accent-lift">At all.</em>
          </h2>
          <p className="mt-6 max-w-[62ch] text-[1.0625rem] leading-[1.75] text-paper-3/85">
            A chatbot answers the question you thought to ask. Every risk on this page is one you
            did not think to ask about, and three of the four are invisible from inside any single
            app. The open loop needs mail and the calendar together to know it is urgent. The
            single point of failure is not in any one record; it is the shape of the whole graph.
            You cannot type your way to a risk you cannot see.
          </p>
          <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-[1.75] text-paper-3/85">
            So Baton is not a window you open. It is a member of the workspace, with its own
            identity and its own inbox, watching all six surfaces at once and acting back into
            them.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-3">
          {SURFACE.map(({ icon: Icon, ...s }) => (
            <div key={s.app} className="reveal bg-panel p-5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/[0.06] text-accent-lift">
                  <Icon size={17} />
                </span>
                <span className="display-tight text-[1.0625rem] text-paper">{s.app}</span>
              </div>
              <dl className="mt-4 space-y-2.5">
                <div>
                  <dt className="kicker text-info-lift/70">reads</dt>
                  <dd className="mt-1 text-[0.875rem] leading-[1.55] text-paper-3/80">{s.reads}</dd>
                </div>
                <div>
                  <dt className="kicker text-agent-lift/80">acts</dt>
                  <dd className="mt-1 text-[0.875rem] leading-[1.55] text-paper-3/80">{s.acts}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
