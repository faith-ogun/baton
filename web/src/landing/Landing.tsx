import { useHashScroll, useReveal } from '../lib/useReveal';
import { CTA } from './CTA';
import { Claim } from './Claim';
import { Dropped } from './Dropped';
import { Footer } from './Footer';
import { Governance } from './Governance';
import { Cost } from './Cost';
import { Hero } from './Hero';
import { Loop } from './Loop';
import { Nav } from './Nav';
import { Who } from './Who';

export function Landing() {
  useReveal();
  useHashScroll();

  return (
    <>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Dropped />
        <Cost />
        <Who />
        <Loop />
        <Claim />
        <Governance />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
