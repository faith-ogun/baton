import { Link } from '../lib/router';
import { Lockup } from '../brand/Mark';
import { Arrow, Container, Kicker } from '../ui/ui';

const COLUMNS: [string, [string, string][]][] = [
  [
    'Product',
    [
      ['Dashboard', '/app'],
      ['What gets dropped', '#dropped'],
      ['What it costs', '#cost'],
      ['Who it is for', '#who'],
    ],
  ],
  [
    'How it works',
    [
      ['The loop', '#loop'],
      ['Governance', '#governance'],
      ['The rules registry', '#governance'],
      ['The claim', '#claim'],
    ],
  ],
  [
    'Built with',
    [
      ['Ambiguous AI', 'https://www.ambiguous.ai'],
      ['OpenAI Agents SDK', 'https://openai.com'],
      ['Google Cloud Run', 'https://cloud.google.com/run'],
      ['Source on GitHub', 'https://github.com/faith-ogun/baton'],
    ],
  ],
];

/**
 * The footer carries the mark at a size that reads without turning into a
 * poster.
 *
 * The awkward bit is that three link columns of four items each are short,
 * while the brand block is tall, so anything stacked only in the left column
 * leaves a hole under the links. Two cuts got this wrong: first a 248px lockup
 * against the columns, then four balanced columns which still left the
 * description as a narrow measure with blank space beside it.
 *
 * So the description does not live in a column at all. It runs across the
 * lower row, underneath the links, which is exactly the space that was empty.
 * A long line of text is the right shape for the space rather than a tall
 * narrow paragraph fighting it.
 */
export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-x-12 gap-y-9 md:grid-cols-2 lg:grid-cols-[1.05fr_repeat(3,0.7fr)]">
          <div className="lg:row-span-1">
            <Link to="/" className="inline-block">
              <Lockup width={168} className="transition-opacity hover:opacity-85" />
            </Link>
            <p className="display-tight mt-4 text-[1.25rem]">
              Never drop the <em className="display-em text-accent-mid">baton</em>.
            </p>
            <Link
              to="/app"
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[0.8125rem] font-medium text-paper shadow-press transition-all duration-150 hover:bg-ink-2 active:translate-y-[2px] active:shadow-none"
            >
              Open the dashboard
              <Arrow />
            </Link>
          </div>

          {COLUMNS.map(([heading, links]) => (
            <div key={heading}>
              <div className="flex items-center gap-2">
                <span className="baton-rule w-3.5" />
                <Kicker tone="ink">{heading}</Kicker>
              </div>
              <ul className="mt-3.5 space-y-2">
                {links.map(([label, href]) =>
                  href.startsWith('/') ? (
                    <li key={label}>
                      <Link
                        to={href}
                        className="text-[0.875rem] text-ink-2 transition-colors hover:text-accent-ink"
                      >
                        {label}
                      </Link>
                    </li>
                  ) : (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-[0.875rem] text-ink-2 transition-colors hover:text-accent-ink"
                      >
                        {label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}

          {/* The description runs along the lower row, under the links, because
              that is where the blank space was. */}
          <p className="text-[0.9375rem] leading-[1.7] text-ink-2 md:col-span-2 lg:col-span-3 lg:col-start-2 lg:self-end">
            An AI coworker that makes sure nothing gets dropped. It lives inside your team&rsquo;s
            Ambiguous workspace, holds the whole graph of who owes whom what, and catches the ask
            nobody answered, the person carrying too much and the deadline nobody booked, then hands
            each one off before it drops. Nothing auto-sends; every action is approved by a human and
            logged into a sheet the team can read.
          </p>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-line-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.6875rem] leading-relaxed text-ink-3">
            Faith Ogundimu · Agents, Everywhere · 12 September 2026
          </p>
          <p className="font-mono text-[0.6875rem] leading-relaxed text-ink-3">
            Aldermere Bio and Sentrix are invented. Drafts only; a human approves every action.
          </p>
        </div>
      </Container>
    </footer>
  );
}
