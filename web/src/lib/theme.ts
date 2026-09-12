import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'baton:theme';

/**
 * The dashboard's light/dark switch.
 *
 * The attribute goes on <html> rather than on the shell so anything rendered
 * outside the shell's subtree, a toast or the tour spotlight, themes with it.
 * Light is the default: a demo is usually shown in a bright room, and the
 * density of a mission-control screen should come from hierarchy rather than
 * from turning the lights off.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* private windows and blocked storage both land here */
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.appTheme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* the theme still applies for this session */
    }
    return () => {
      delete document.documentElement.dataset.appTheme;
    };
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return [theme, toggle];
}

/**
 * The canvas cannot read a CSS custom property per frame, so the graph pulls
 * the palette out of the document once per theme and paints from that.
 */
export interface Palette {
  ok: string;
  warn: string;
  risk: string;
  agent: string;
  info: string;
  line: string;
  line2: string;
  ground: string;
  panel: string;
  strong: string;
  mid: string;
  dim: string;
  accent: string;
}

const NAMES: Record<keyof Palette, string> = {
  ok: '--color-ok',
  warn: '--color-warn',
  risk: '--color-risk',
  agent: '--color-agent',
  info: '--color-info',
  line: '--color-hair',
  line2: '--color-hair-2',
  ground: '--color-void',
  panel: '--color-panel',
  strong: '--color-strong',
  mid: '--color-mid',
  dim: '--color-dim',
  accent: '--color-accent',
};

export function usePalette(theme: Theme): Palette {
  const [palette, setPalette] = useState<Palette>(() => read());
  useEffect(() => {
    // One frame after the attribute lands, so the new values are committed.
    const id = requestAnimationFrame(() => setPalette(read()));
    return () => cancelAnimationFrame(id);
  }, [theme]);
  return palette;
}

function read(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const out = {} as Palette;
  for (const [key, name] of Object.entries(NAMES) as [keyof Palette, string][]) {
    out[key] = cs.getPropertyValue(name).trim() || '#888';
  }
  return out;
}
