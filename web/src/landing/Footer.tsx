import { Link } from '../lib/router';
import { Wordmark } from '../brand/Mark';
import { Container } from '../ui/ui';

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Link to="/">
              <Wordmark size={30} />
            </Link>
            <p className="mt-4 text-[0.9375rem] leading-[1.65] text-ink-2">
              An AI coworker that makes sure nothing gets dropped. Built on the Ambiguous
              workspace, where it can see and act across every app at once.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 sm:gap-x-16">
            <div className="space-y-2">
              <p className="kicker text-ink-3">Product</p>
              <Link to="/app" className="block text-[0.875rem] text-ink-2 hover:text-ink">
                Dashboard
              </Link>
              <a href="#dropped" className="block text-[0.875rem] text-ink-2 hover:text-ink">
                What gets dropped
              </a>
              <a href="#governance" className="block text-[0.875rem] text-ink-2 hover:text-ink">
                Governance
              </a>
            </div>
            <div className="space-y-2">
              <p className="kicker text-ink-3">Built with</p>
              <span className="block text-[0.875rem] text-ink-2">Ambiguous AI</span>
              <span className="block text-[0.875rem] text-ink-2">OpenAI Agents SDK</span>
              <span className="block text-[0.875rem] text-ink-2">Google Cloud Run</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.6875rem] text-ink-3">
            Never drop the baton. · Faith Ogundimu · Agents, Everywhere · 12 September 2026
          </p>
          <p className="font-mono text-[0.6875rem] text-ink-3">
            Drafts only. A human approves every action.
          </p>
        </div>
      </Container>
    </footer>
  );
}
