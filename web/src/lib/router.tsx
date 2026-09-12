import { useSyncExternalStore } from 'react';

/**
 * Two routes, no dependency. The site at `/`, the dashboard at `/app`.
 *
 * The path lives in ONE module-level store rather than in each hook's own
 * useState. That distinction is the whole file: with per-hook state, a Link
 * calling pushState updated only that Link's copy, and since pushState fires
 * no popstate, the component actually rendering the route never heard about
 * it. The URL changed and the screen did not, which looked exactly like a
 * dead link. useSyncExternalStore gives every caller the same subscription.
 */

const listeners = new Set<() => void>();
let current = window.location.pathname;

function sync() {
  current = window.location.pathname;
  for (const l of listeners) l();
}

window.addEventListener('popstate', sync);

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function navigate(to: string) {
  if (to === window.location.pathname) return;
  window.history.pushState({}, '', to);
  sync();
  window.scrollTo(0, 0);
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, () => current);
}

/** An anchor that routes in-app for internal paths and behaves normally otherwise. */
export function Link({
  to,
  children,
  className = '',
  title,
  onNavigate,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={to}
      className={className}
      title={title}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (to.startsWith('#') || to.startsWith('http')) return;
        e.preventDefault();
        navigate(to);
        onNavigate?.();
      }}
    >
      {children}
    </a>
  );
}
