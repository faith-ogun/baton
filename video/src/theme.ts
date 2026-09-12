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
export const DURATION = 260; // 8.67s

// Beat boundaries, in frames.
export const B = {
  graph: 0, // 0.0s  the workspace graph fades in
  ask: 48, // 1.6s  the ask goes red
  card: 96, // 3.2s  the drop-risk card slides in
  approve: 150, // 5.0s  cursor, click, act, log
  lockup: 218, // 7.27s fade back to the lockup
  end: DURATION,
} as const;

// Beat 4's internal schedule, in one place because every part of it has to
// hang together: the click, the edge going green, the row typing itself in,
// and then a long still hold. The finished audit row is the whole point of the
// animation, the proof that Baton acted AND logged it, so it gets 40 frames
// (1.33s) fully typed and motionless before anything starts fading.
export const B4 = {
  cursorIn: 140,
  click: 156, // the pointer arrives and presses
  release: 165,
  cursorOut: 180, // the pointer leaves, so the row is the only thing moving
  clearFrom: 160, // the ask edge and Sally's ring go green
  clearTo: 173,
  typeFrom: 160,
  typeTo: 172,
  metaFrom: 172,
  metaTo: 178, // row complete: still until B.lockup
} as const;
