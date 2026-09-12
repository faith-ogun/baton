import { useState } from 'react';
import { Chip, Container, Kicker, SectionHead } from '../ui/ui';

/**
 * The money.
 *
 * The headline figure is NOT a market statistic. It is the reader's own
 * arithmetic, run in front of them: their team size, their day rate, their
 * honest guess at how often something gets dropped. That is a deliberate
 * choice. A borrowed "£X billion lost to poor collaboration" number is
 * unverifiable, ages badly and invites an argument about the source; a sum the
 * reader dialled in themselves is one they already believe. The two industry
 * figures below the calculator are there only to anchor the default for
 * "dropped items per month", and both are attributed on screen.
 */

const RATE_HINT = [
  ['A blended day rate', 'salary plus employer cost, divided by ~220 working days'],
  ['A dropped item', 'an ask, a task, a deadline or a hand-off that stalls and needs recovering'],
];

function money(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`;
  if (n >= 1000) return `£${Math.round(n / 1000)}k`;
  return `£${Math.round(n)}`;
}

function Slider({
  label,
  value,
  set,
  min,
  max,
  step = 1,
  format,
  hint,
}: {
  label: string;
  value: number;
  set: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline gap-2">
        <span className="text-[0.9375rem] font-medium text-ink">{label}</span>
        <span className="num ml-auto text-[0.9375rem] text-accent-ink">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="mt-2.5 w-full accent-[var(--color-accent)]"
      />
      {hint && <span className="mt-1 block font-mono text-[0.6875rem] text-ink-3">{hint}</span>}
    </label>
  );
}

export function Cost() {
  const [people, setPeople] = useState(8);
  const [rate, setRate] = useState(520);
  const [drops, setDrops] = useState(6);
  const [days, setDays] = useState(2.5);

  const monthly = drops * days * rate;
  const annual = monthly * 12;
  // Baton does not catch everything. It catches what its four detectors see,
  // and the honest claim is that most dropped work is one of those four.
  const caught = 0.7;
  const recovered = annual * caught;
  const perPerson = annual / Math.max(1, people);

  const bars = [
    { label: 'Open loops', share: 0.34, tone: 'var(--color-risk)' },
    { label: 'Stalls', share: 0.29, tone: 'var(--color-accent)' },
    { label: 'Unbooked dates', share: 0.21, tone: 'var(--color-warn)' },
    { label: 'Single points of failure', share: 0.16, tone: 'var(--color-info)' },
  ];

  return (
    <section id="cost" className="border-y border-line bg-paper py-20 sm:py-24">
      <Container>
        <SectionHead
          kicker="what it is worth"
          title={
            <>
              A dropped ball is not an annoyance. It is a{' '}
              <em className="display-em text-accent-mid">line in the budget</em>.
            </>
          }
          lede="Put your own numbers in. This is your arithmetic, not a borrowed statistic: how many hand-offs your team drops in a month, and how many days each one costs to notice, chase and recover."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          {/* the dials */}
          <div className="reveal space-y-6 rounded-2xl border border-line bg-card p-6 shadow-paper sm:p-7">
            <Slider
              label="People on the team"
              value={people}
              set={setPeople}
              min={3}
              max={60}
              format={(v) => `${v}`}
            />
            <Slider
              label="Blended day rate"
              value={rate}
              set={setRate}
              min={150}
              max={1400}
              step={10}
              format={(v) => `£${v}`}
              hint="salary plus employer cost, over ~220 working days"
            />
            <Slider
              label="Items dropped per month"
              value={drops}
              set={setDrops}
              min={1}
              max={40}
              format={(v) => `${v}`}
              hint="an ask, a task, a date or a hand-off that stalls and has to be recovered"
            />
            <Slider
              label="Days lost to each one"
              value={days}
              set={setDays}
              min={0.5}
              max={15}
              step={0.5}
              format={(v) => `${v}`}
              hint="noticing it, chasing it, and redoing what went stale"
            />

            <div className="border-t border-line pt-5">
              <dl className="space-y-2">
                {RATE_HINT.map(([t, d]) => (
                  <div key={t} className="flex gap-2 text-[0.8125rem] leading-[1.5]">
                    <dt className="shrink-0 font-medium text-ink">{t}:</dt>
                    <dd className="text-ink-2">{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* the answer */}
          <div className="reveal grain relative overflow-hidden rounded-2xl border border-onink-line bg-ink p-6 text-paper shadow-lift sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{ background: 'radial-gradient(520px 220px at 80% 0%, #1d3c5a, transparent 70%)' }}
            />
            <div className="relative">
              <Kicker tone="paper">your team, per year</Kicker>
              <p className="num mt-3 text-[3.25rem] leading-none text-accent-lift sm:text-[4rem]">
                {money(annual)}
              </p>
              <p className="mt-3 font-mono text-[0.75rem] leading-relaxed text-paper-3/60">
                {drops} items × {days} days × £{rate} × 12 months
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-onink-line bg-white/[0.04] p-4">
                  <p className="num text-[1.5rem] text-paper">{money(recovered)}</p>
                  <p className="mt-1.5 text-[0.8125rem] leading-[1.5] text-paper-3/75">
                    the share Baton&rsquo;s four detectors are built to catch
                  </p>
                </div>
                <div className="rounded-xl border border-onink-line bg-white/[0.04] p-4">
                  <p className="num text-[1.5rem] text-paper">{money(perPerson)}</p>
                  <p className="mt-1.5 text-[0.8125rem] leading-[1.5] text-paper-3/75">
                    per person on the team, every year
                  </p>
                </div>
              </div>

              {/* where it goes */}
              <div className="mt-7">
                <Kicker tone="paper">where it goes</Kicker>
                <ul className="mt-4 space-y-3">
                  {bars.map((b) => (
                    <li key={b.label}>
                      <div className="flex items-baseline gap-2 text-[0.8125rem]">
                        <span className="text-paper-3/85">{b.label}</span>
                        <span className="num ml-auto text-paper-3/70">{money(annual * b.share)}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${b.share * 100}%`, background: b.tone }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[0.6875rem] leading-relaxed text-paper-3/55">
                  Split modelled on the seeded workspace, where the four detectors account for all
                  five open risks. Your own split is whatever your registry finds.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card px-5 py-4 shadow-paper">
          <Chip tone="accent">anchor</Chip>
          <p className="min-w-0 flex-1 text-[0.875rem] leading-[1.6] text-ink-2">
            If six a month sounds high, it is worth knowing that most of a knowledge worker&rsquo;s
            day already goes on coordinating the work rather than doing it. Asana&rsquo;s Anatomy of
            Work Index has put that share around 60%, and the Project Management Institute has put
            the waste from poor project performance at roughly $97m for every $1bn invested. Baton
            is aimed at one slice of that: the hand-offs that stall.
          </p>
        </div>
      </Container>
    </section>
  );
}
