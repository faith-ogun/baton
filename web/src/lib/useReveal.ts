import { useEffect } from 'react';

/**
 * Reveal-on-scroll for the marketing page. The hidden state lives behind
 * `.reveal-ready`, which only this hook adds, so if the JS never runs the page
 * is fully readable rather than fully blank.
 *
 * This is the third attempt and the reasoning behind it matters, because the
 * two obvious implementations both fail, and both fail by leaving whole
 * sections of the page permanently invisible:
 *
 *  1. An IntersectionObserver alone only reports elements whose intersection it
 *     actually samples. An instant jump down the page, which is exactly what
 *     this page's own nav anchors do, can carry an element from below the fold
 *     to above it without ever firing. Those sections then sit at opacity 0 for
 *     good, and you find the holes by scrolling back up.
 *  2. A sweep driven by `scroll` events assumes scroll events arrive. Measured
 *     in this app: `window.scrollY` moved from 0 to 3177 with **zero** scroll
 *     events delivered on either `window` or `document`. Anything that moves
 *     the viewport programmatically, and some embedded browser surfaces
 *     generally, can change the scroll offset without a single event.
 *
 * So: the observer handles the common case and makes entry feel immediate, and
 * a cheap interval is the thing that cannot miss. Every tick re-checks the
 * whole pending set against a trigger line, so it does not matter HOW the
 * viewport got where it is. Both stop themselves the moment nothing is left,
 * which on a normal read-through is within a few seconds, and the cost until
 * then is a couple of dozen rect reads a few times a second.
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const pending = new Set(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!pending.size) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    root.classList.add('reveal-ready');

    let io: IntersectionObserver | undefined;
    let timer: number | undefined;

    const stop = () => {
      io?.disconnect();
      if (timer) window.clearInterval(timer);
      timer = undefined;
    };

    /** Reveal everything at or above the trigger line, however it got there. */
    const sweep = () => {
      const line = window.innerHeight * 0.88;
      for (const el of pending) {
        if (el.getBoundingClientRect().top < line) {
          el.classList.add('is-in');
          pending.delete(el);
        }
      }
      if (!pending.size) stop();
    };

    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          pending.delete(entry.target as HTMLElement);
        }
        // Same callback also catches anything a jump skipped straight past.
        sweep();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
    );
    pending.forEach((el) => io!.observe(el));

    timer = window.setInterval(sweep, 150);
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
