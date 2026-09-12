import {RISK} from './theme';

// Hand-placed positions. No physics sim: the layout is fixed so it reads the
// same on every render and never jitters between frames.
// Local SVG coordinate space is 640 x 470, offset onto the canvas by <Graph/>.

export type RiskState = keyof typeof RISK;
export type Glyph = 'mail' | 'task' | 'clock';

export type PersonNode = {
  id: string;
  kind: 'person';
  initials: string;
  x: number;
  y: number;
  state: RiskState;
  order: number;
};

export type ItemNode = {
  id: string;
  kind: 'item';
  glyph: Glyph;
  x: number;
  y: number;
  state: RiskState;
  order: number;
};

export type Node = PersonNode | ItemNode;

export const NODES: Node[] = [
  // people
  {id: 'NB', kind: 'person', initials: 'NB', x: 152, y: 118, state: 'clear', order: 0},
  {id: 'SA', kind: 'person', initials: 'SA', x: 452, y: 108, state: 'watch', order: 2},
  {id: 'RF', kind: 'person', initials: 'RF', x: 78, y: 268, state: 'clear', order: 5},
  {id: 'PR', kind: 'person', initials: 'PR', x: 222, y: 340, state: 'watch', order: 4},
  {id: 'TL', kind: 'person', initials: 'TL', x: 512, y: 392, state: 'clear', order: 7},
  // work items
  {id: 'M1', kind: 'item', glyph: 'mail', x: 300, y: 186, state: 'watch', order: 1},
  {id: 'T1', kind: 'item', glyph: 'task', x: 358, y: 296, state: 'watch', order: 3},
  {id: 'D1', kind: 'item', glyph: 'clock', x: 556, y: 246, state: 'watch', order: 6},
  {id: 'T2', kind: 'item', glyph: 'task', x: 330, y: 428, state: 'clear', order: 8},
];

export const NODE_BY_ID: Record<string, Node> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
);

export type Edge = {
  from: string;
  to: string;
  order: number;
  // the two segments of the unanswered ask: Nicolas -> mail thread -> Sally
  ask?: boolean;
};

export const EDGES: Edge[] = [
  {from: 'NB', to: 'M1', order: 0, ask: true},
  {from: 'M1', to: 'SA', order: 1, ask: true},
  {from: 'SA', to: 'D1', order: 2},
  {from: 'NB', to: 'RF', order: 3},
  {from: 'RF', to: 'PR', order: 4},
  {from: 'PR', to: 'T1', order: 5},
  {from: 'T1', to: 'D1', order: 6},
  {from: 'PR', to: 'T2', order: 7},
  {from: 'T2', to: 'TL', order: 8},
  {from: 'TL', to: 'D1', order: 9},
  {from: 'SA', to: 'T1', order: 10},
];

export const PERSON_R = 26;
export const ITEM_S = 46; // rounded square side

// Pull an edge back to the node boundary so lines never poke through a ring.
export const inset = (n: Node) => (n.kind === 'person' ? PERSON_R + 3 : ITEM_S / 2 + 5);
