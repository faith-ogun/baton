// Baton brand tokens. Do not improvise colours outside this file.

export const C = {
  navy: '#0F2238',
  orange: '#C96A3D',
  orangeBright: '#E0834F',
  cream: '#F3EEE4',
  grey: '#8A96A3',
  purple: '#7A6FF0',
  green: '#2E7D5B',
  amber: '#D9A441',
  red: '#C2402F',
  edge: '#2D5273',
} as const;

// Risk is state. Orange is action. They must never read as the same thing.
export const RISK = {
  clear: C.green,
  watch: C.amber,
  risk: C.red,
} as const;

export const FPS = 30;
export const DURATION = 240; // 8.0s

// Beat boundaries, in frames.
export const B = {
  graph: 0, // 0.0s  the workspace graph fades in
  ask: 48, // 1.6s  the ask goes red
  card: 96, // 3.2s  the drop-risk card slides in
  approve: 150, // 5.0s  cursor, click, act, log
  lockup: 198, // 6.6s  fade back to the lockup
  end: DURATION,
} as const;
