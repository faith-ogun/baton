import { Link } from '../lib/router';
import { Arrow, Container, Kicker } from '../ui/ui';

export function CTA() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="grain relative overflow-hidden rounded-3xl border border-hair bg-ink px-6 py-14 text-center text-paper sm:px-12 sm:py-18">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background: 'radial-gradient(760px 300px at 50% 0%, #1d3c5a, transparent 70%)',
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-center gap-3">
              <span className="baton-rule w-7" />
              <Kicker tone="paper">the hand-off</Kicker>
            </div>
            <h2 className="display-tight mx-auto mt-5 max-w-[26ch] text-[2rem] text-balance sm:text-[2.7rem]">
              Somebody on your team is about to drop something today.
            </h2>
            <p className="mx-auto mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.7] text-paper-3/85">
              The dashboard runs on a seeded workspace, so you can watch the whole loop end to end
              right now: the risk, the draft, the approval, and the row it writes.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/app"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-paper px-6 py-3 text-[0.9375rem] font-medium text-ink shadow-[0_2px_0_var(--color-accent)] transition-all duration-150 hover:bg-white active:translate-y-[2px] active:shadow-none sm:w-auto"
              >
                Open the dashboard
                <Arrow />
              </Link>
              <a
                href="https://github.com/faith-ogun/baton"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-hair-2 px-6 py-3 text-[0.9375rem] font-medium text-paper-3 transition-colors duration-150 hover:border-paper-3 hover:text-paper sm:w-auto"
              >
                Read the source
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
