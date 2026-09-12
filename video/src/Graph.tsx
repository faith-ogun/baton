import React from 'react';
import {interpolate, interpolateColors, Easing} from 'remotion';
import {C, RISK, B} from './theme';
import {MONO} from './fonts';
import {
  NODES,
  EDGES,
  NODE_BY_ID,
  PERSON_R,
  ITEM_S,
  inset,
  type Node,
  type Glyph,
} from './graph-data';

// The SVG is drawn in its own 660x470 space and scaled up on the canvas, so
// strokes, rings and initials all grow together and stay legible once the GIF
// is downscaled for the README.
export const GRAPH_BOX = {left: 56, top: 50, width: 660, height: 470, scale: 1.12};

const ease = Easing.out(Easing.cubic);

/** 0 -> 1 as the unanswered ask lights up. */
const askOn = (f: number) =>
  interpolate(f, [B.ask, B.ask + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** 0 -> 1 as the approved fix lands and the ask clears. */
const CLEAR_START = 172;
const CLEAR_END = 184;
const clearOn = (f: number) =>
  interpolate(f, [CLEAR_START, CLEAR_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** Ring colour for a node, accounting for the two state changes in the story. */
const ringColour = (node: Node, f: number) => {
  const base = RISK[node.state];
  if (node.id !== 'SA' && node.id !== 'M1') return base;
  const a = askOn(f);
  const b = clearOn(f);
  const lit = interpolateColors(a, [0, 1], [base, C.red]);
  return interpolateColors(b, [0, 1], [lit, C.green]);
};

const DASH_SPEED = 0.9;
/** Frozen once the fix lands: the dashes stop travelling, then merge to solid. */
const dashOffset = (f: number) => {
  const t = Math.min(f, CLEAR_START) - B.ask;
  return -Math.max(0, t) * DASH_SPEED;
};

const GlyphMark: React.FC<{glyph: Glyph}> = ({glyph}) => {
  const s = {
    stroke: C.cream,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (glyph === 'mail') {
    return (
      <g {...s} strokeWidth={1.8}>
        <rect x={-11} y={-7.5} width={22} height={15} rx={2.5} />
        <path d="M-11,-7.5 L0,1.4 L11,-7.5" />
      </g>
    );
  }
  if (glyph === 'task') {
    return (
      <g {...s} strokeWidth={2.3}>
        <path d="M-8.5,0.4 L-2.6,6.6 L8.8,-6.2" />
      </g>
    );
  }
  return (
    <g {...s} strokeWidth={1.8}>
      <circle r={9.2} />
      <path d="M0,-5 L0,0.8 L4.6,3.2" />
    </g>
  );
};

const NodeMark: React.FC<{node: Node; frame: number}> = ({node, frame}) => {
  // Staggered entrance across the first beat, no bounce.
  const inAt = 4 + node.order * 3.6;
  const appear = interpolate(frame, [inAt, inAt + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const enterScale = interpolate(appear, [0, 1], [0.72, 1]);

  // One measured flare when Sally's node goes at risk.
  const flare =
    node.id === 'SA'
      ? interpolate(frame, [B.ask, B.ask + 8, B.ask + 18], [0, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.quad),
        })
      : 0;

  const ring = ringColour(node, frame);
  const scale = enterScale * (1 + flare * 0.12);

  // A single expanding halo, once.
  const haloT = interpolate(frame, [B.ask, B.ask + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const showHalo = node.id === 'SA' && haloT > 0 && haloT < 1;

  return (
    <g transform={`translate(${node.x} ${node.y})`} opacity={appear}>
      {showHalo ? (
        <circle
          r={PERSON_R + 2 + haloT * 42}
          fill="none"
          stroke={C.red}
          strokeWidth={interpolate(haloT, [0, 1], [2.4, 0.4])}
          opacity={(1 - haloT) * 0.85}
        />
      ) : null}
      <g transform={`scale(${scale})`}>
        {node.kind === 'person' ? (
          <>
            <circle r={PERSON_R} fill={C.navy} stroke={ring} strokeWidth={2.5} />
            <text
              textAnchor="middle"
              y={4.6}
              fill={C.cream}
              fontFamily={MONO}
              fontSize={13}
              fontWeight={500}
              letterSpacing={0.6}
            >
              {node.initials}
            </text>
          </>
        ) : (
          <>
            <rect
              x={-ITEM_S / 2}
              y={-ITEM_S / 2}
              width={ITEM_S}
              height={ITEM_S}
              rx={13}
              fill={C.navy}
              stroke={ring}
              strokeWidth={2.5}
            />
            <GlyphMark glyph={node.glyph} />
          </>
        )}
      </g>
    </g>
  );
};

const EdgeLine: React.FC<{
  from: Node;
  to: Node;
  order: number;
  ask?: boolean;
  frame: number;
}> = ({from, to, order, ask, frame}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const a = inset(from);
  const b = inset(to);
  const x1 = from.x + ux * a;
  const y1 = from.y + uy * a;
  const x2 = to.x - ux * b;
  const y2 = to.y - uy * b;

  const inAt = 14 + order * 2.4;
  const appear = interpolate(frame, [inAt, inAt + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  if (!ask) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={C.edge}
        strokeWidth={1.25}
        opacity={appear * 0.95}
      />
    );
  }

  const lit = askOn(frame);
  const cleared = clearOn(frame);
  const colour = interpolateColors(
    cleared,
    [0, 1],
    [interpolateColors(lit, [0, 1], [C.edge, C.red]), C.green],
  );
  // Gap closes to nothing, so the dashes resolve into one solid line.
  const gap = interpolate(cleared, [0, 1], [8.5, 0]);
  const width = interpolate(lit, [0, 1], [1.25, 2.4]);

  return (
    <>
      {/* the calm line underneath, so the dashed run never looks broken */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colour}
        strokeWidth={width}
        opacity={appear * interpolate(lit, [0, 1], [0.95, 0.22])}
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colour}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={appear * lit}
        strokeDasharray={`7 ${gap}`}
        strokeDashoffset={dashOffset(frame)}
      />
    </>
  );
};

export const Graph: React.FC<{frame: number}> = ({frame}) => (
  <svg
    width={GRAPH_BOX.width * GRAPH_BOX.scale}
    height={GRAPH_BOX.height * GRAPH_BOX.scale}
    viewBox={`0 0 ${GRAPH_BOX.width} ${GRAPH_BOX.height}`}
    style={{
      position: 'absolute',
      left: GRAPH_BOX.left,
      top: GRAPH_BOX.top,
      overflow: 'visible',
    }}
  >
    {EDGES.map((e) => (
      <EdgeLine
        key={`${e.from}-${e.to}`}
        from={NODE_BY_ID[e.from]}
        to={NODE_BY_ID[e.to]}
        order={e.order}
        ask={e.ask}
        frame={frame}
      />
    ))}
    {NODES.map((n) => (
      <NodeMark key={n.id} node={n} frame={frame} />
    ))}
  </svg>
);
