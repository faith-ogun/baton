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
 * poster. The first cut set the lockup at 248px against three short link
 * columns, which left a tall empty band down the right of the page: the brand
 * block was twice the height of everything beside it. Four columns of roughly
 * equal height fixes that without shrinking the mark to nothing.
 */
export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_repeat(3,0.72fr)] lg:gap-12">
          <div>
            <Link to="/" className="inline-block">
              <Lockup width={168} className="transition-opacity hover:opacity-85" />
            </Link>
            <p className="display-tight mt-4 text-[1.25rem]">
              Never drop the <em className="display-em text-accent-mid">baton</em>.
            </p>
            <p className="mt-3 max-w-[34ch] text-[0.875rem] leading-[1.6] text-ink-2">
              An AI coworker that makes sure nothing gets dropped. It lives inside your team&rsquo;s
              Ambiguous workspace, holds the whole graph of who owes whom what, and hands off the
              work about to fall through the cracks before it does.
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
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
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
