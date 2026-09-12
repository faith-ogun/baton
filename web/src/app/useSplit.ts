import { useCallback, useEffect, useRef, useState } from 'react';

type Axis = 'x' | 'y';

interface Options {
  axis?: Axis;
  initial: number;
  min: number;
  max: number;
  /** localStorage key, so a layout somebody set stays set. */
  key: string;
}

/**
 * A draggable pane divider, for either axis.
 *
 * It stores the size of the SECONDARY pane (the queue's width, the audit
 * strip's height) rather than the primary one, because the secondary pane has a
 * legible minimum while the graph will happily use whatever is left over.
 *
 * Horizontal drags measure from the right edge and vertical from the bottom,
 * which is where those panes are anchored; measuring from the origin instead
 * makes the divider drift whenever the window is resized.
 */
export function useSplit({ axis = 'x', initial, min, max, key }: Options) {
  const [size, setSize] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(key));
      if (saved >= min && saved <= max) return saved;
    } catch {
      /* blocked storage falls through to the default */
    }
    return initial;
  });
  const [dragging, setDragging] = useState(false);
  const frame = useRef(0);

  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      // rAF-throttled: a mousemove fires faster than the browser paints, and
      // every change here resizes a canvas.
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        setSize(clamp(axis === 'x' ? window.innerWidth - e.clientX : window.innerHeight - e.clientY));
      });
    };
    const onUp = () => setDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    // Without these the pointer picks up a text caret and the page selects as
    // you drag, which is the giveaway of a hand-rolled splitter.
    document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [dragging, clamp, axis]);

  useEffect(() => {
    try {
      localStorage.setItem(key, String(size));
    } catch {
      /* the size still applies for this session */
    }
  }, [key, size]);

  const nudge = useCallback((by: number) => setSize((v) => clamp(v + by)), [clamp]);
  const set = useCallback((v: number) => setSize(clamp(v)), [clamp]);

  return { size, dragging, startDrag: () => setDragging(true), nudge, set, reset: () => set(initial) };
}
