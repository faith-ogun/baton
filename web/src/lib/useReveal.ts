import { useEffect } from 'react';

/**
 * Reveal-on-scroll for the marketing page. The hidden state lives behind
 * `.reveal-ready`, which only this hook adds, so if the JS never runs the page
 * is fully readable rather than fully blank.
 *
 * This is a throttled sweep rather than an IntersectionObserver on purpose.
 * An observer only reports elements whose intersection it actually samples, so
 * an instant jump down the page, which is exactly what the nav's anchor links
 * do, can carry an element from below the fold to above it without ever firing.
 * Those sections then sit at opacity 0 for good, and you find the holes by
 * scrolling back up. A sweep cannot miss: anything at or above the trigger
 * line is revealed, whether it was scrolled past slowly or skipped entirely.
 * With a couple of dozen elements the cost is not measurable.
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const pending = new Set(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!pending.size) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.classList.add('reveal-ready');

    let frame = 0;

    const sweep = () => {
      frame = 0;
      const line = window.innerHeight * 0.88;
      for (const el of pending) {
        if (el.getBoundingClientRect().top < line) {
          el.classList.add('is-in');
          pending.delete(el);
        }
      }
      if (!pending.size) stop();
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(sweep);
    };

    function stop() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    sweep();

    return () => {
      stop();
      root.classList.remove('reveal-ready');
    };
  }, []);
}

/** Smooth-scroll to a hash target on load, once fonts have settled. */
export function useHashScroll() {
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.querySelector(window.location.hash);
    if (!el) return;
    const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => clearTimeout(t);
  }, []);
}
