import { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { Wordmark } from '../brand/Mark';
import { Arrow, Container } from '../ui/ui';

const LINKS = [
  ['What gets dropped', '#dropped'],
  ['What it costs', '#cost'],
  ['Who it is for', '#who'],
  ['How it works', '#loop'],
  ['Governance', '#governance'],
];

export function Nav() {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        lifted ? 'border-b border-line bg-canvas/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <Container className="flex h-16 items-center gap-6">
        <Link to="/" className="shrink-0">
          <Wordmark size={28} />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-3 py-2 text-[0.875rem] text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/faith-ogun/baton"
            className="hidden rounded-full px-4 py-2 text-[0.875rem] text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink sm:inline-flex"
          >
            Repo
          </a>
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.875rem] font-medium text-paper shadow-press transition-all duration-150 hover:bg-ink-2 active:translate-y-[2px] active:shadow-none"
          >
            Open the dashboard
            <Arrow />
          </Link>
        </div>
      </Container>
    </header>
  );
}
