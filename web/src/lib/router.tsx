import { useEffect, useState } from 'react';

/**
 * Two routes, no dependency. The site at `/`, the dashboard at `/app`.
 * A router library would be more code than this whole file.
 */
export function usePath(): [string, (to: string) => void] {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (to: string) => {
    if (to === window.location.pathname) return;
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  return [path, go];
}

/** An anchor that routes in-app for internal paths and behaves normally otherwise. */
export function Link({
  to,
  children,
  className = '',
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [, go] = usePath();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (to.startsWith('#') || to.startsWith('http')) return;
        e.preventDefault();
        go(to);
      }}
    >
      {children}
    </a>
  );
}
