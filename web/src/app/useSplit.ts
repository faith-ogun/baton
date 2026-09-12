import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'baton:split';

/**
 * A draggable divider between the graph and the queue.
 *
 * Stores the QUEUE's width rather than the graph's, because the queue has a
 * legible minimum (a sentence plus a number) while the graph will happily use
 * whatever is left. Width is persisted, so the layout a person set stays set.
 */
export function useSplit(initial = 404, min = 300, max = 760) {
  const [width, setWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(KEY));
      if (saved >= min && saved <= max) return saved;
    } catch {
      /* blocked storage falls through to the default */
    }
    return initial;
  });
  const [dragging, setDragging] = useState(false);
  const frame = useRef(0);

  const clamp = useCallback((w: number) => Math.max(min, Math.min(max, w)), [min, max]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      // rAF-throttled: a mousemove can fire faster than the browser paints, and
      // every change here resizes a canvas.
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        setWidth(clamp(window.innerWidth - e.clientX));
      });
    };
    const onUp = () => setDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    // Without these the pointer picks up a text caret and the whole page
    // selects while you drag, which is the giveaway of a hand-rolled splitter.
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [dragging, clamp]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, String(width));
    } catch {
      /* the width still applies for this session */
    }
  }, [width]);

  const nudge = useCallback((by: number) => setWidth((w) => clamp(w + by)), [clamp]);

  return { width, dragging, startDrag: () => setDragging(true), nudge };
}
