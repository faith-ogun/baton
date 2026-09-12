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

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1.35fr] lg:gap-16">
          {/* the mark, at a size that earns the space */}
          <div>
            <Link to="/" className="inline-block">
              <Lockup width={248} className="transition-opacity hover:opacity-85" />
            </Link>
            <p className="display-tight mt-7 max-w-[20ch] text-[1.75rem] text-balance">
              Never drop the <em className="display-em text-accent-mid">baton</em>.
            </p>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-[1.7] text-ink-2">
              An AI coworker that makes sure nothing gets dropped. It lives inside your team&rsquo;s
              Ambiguous workspace, holds the whole graph of who owes whom what, and hands off the
              work about to fall through the cracks before it does.
            </p>
            <Link
              to="/app"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.875rem] font-medium text-paper shadow-press transition-all duration-150 hover:bg-ink-2 active:translate-y-[2px] active:shadow-none"
            >
              Open the dashboard
              <Arrow />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map(([heading, links]) => (
              <div key={heading}>
                <div className="flex items-center gap-2.5">
                  <span className="baton-rule w-4" />
                  <Kicker tone="ink">{heading}</Kicker>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {links.map(([label, href]) =>
                    href.startsWith('/') ? (
                      <li key={label}>
                        <Link
                          to={href}
                          className="text-[0.9375rem] text-ink-2 transition-colors hover:text-accent-ink"
                        >
                          {label}
                        </Link>
                      </li>
                    ) : (
                      <li key={label}>
                        <a
                          href={href}
                          className="text-[0.9375rem] text-ink-2 transition-colors hover:text-accent-ink"
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
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line-2 pt-7 sm:flex-row sm:items-center sm:justify-between">
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
