import { Link } from '../lib/router';
import { Arrow, Chip, Container, Dot } from '../ui/ui';
import { LockIcon } from '../ui/icons';
import { HeroArtefact } from './HeroArtefact';

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-10 pb-20 sm:pt-14 sm:pb-24">
      {/* A warm wash behind the headline, and the mark oversized in the margin,
          the way the logo board itself puts the runner against the sun. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[720px]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(1080px 400px at 50% -8%, var(--color-accent-soft), transparent 66%)',
          }}
        />
        <img
          src="/brand/baton-mark.png"
          alt=""
          className="absolute -top-16 -left-32 w-[420px] opacity-[0.05] select-none sm:-left-20"
        />
      </div>

      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="bt-rise inline-flex">
            <Chip tone="neutral" className="shadow-paper">
              <Dot tone="risk" />
              Four ways work falls through the cracks, caught before it does
            </Chip>
          </div>

          <h1
            className="bt-rise display mt-7 text-[2.75rem] leading-[1.02] text-balance sm:text-[4.25rem]"
            style={{ animationDelay: '80ms' }}
          >
            Never drop the{' '}
            <em className="display-em text-accent-mid">baton</em>.
          </h1>

          <p
            className="bt-rise mx-auto mt-7 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-ink-2 sm:text-[1.1875rem]"
            style={{ animationDelay: '160ms' }}
          >
            Baton is a coworker in your team&rsquo;s workspace. It holds the whole graph of who owes
            whom what, spots the ask nobody answered, the person carrying too much and the deadline
            nobody booked, then hands each one off before it drops. You approve. It acts.
          </p>

          <div
            className="bt-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              to="/app"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.9375rem] font-medium text-paper shadow-press transition-all duration-150 hover:bg-ink-2 active:translate-y-[2px] active:shadow-none sm:w-auto"
            >
              See it catch one
              <Arrow />
            </Link>
            <a
              href="#dropped"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line-2 bg-card px-6 py-3 text-[0.9375rem] font-medium text-ink transition-all duration-150 hover:border-ink hover:bg-paper-2 active:translate-y-[2px] sm:w-auto"
            >
              What it catches
            </a>
          </div>

          <p
            className="bt-rise mt-6 inline-flex items-center gap-2 font-mono text-[0.6875rem] text-ink-3"
            style={{ animationDelay: '300ms' }}
          >
            <LockIcon size={13} />
            Nothing auto-sends. Every action is drafted, approved by a human, and logged.
          </p>
        </div>

        <div className="bt-rise mt-14 sm:mt-16" style={{ animationDelay: '380ms' }}>
          <HeroArtefact />
        </div>
      </Container>
    </section>
  );
}
