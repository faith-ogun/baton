import React from 'react';
import {interpolate, interpolateColors, Easing} from 'remotion';
import {C, RISK} from '../theme';
import {MONO} from '../fonts';
import {
  NODES,
  EDGES,
  NODE_BY_ID,
  PERSON_R,
  ITEM_S,
  inset,
  type Node,
  type Glyph,
} from '../graph-data';

// The same workspace as the README hero, drawn for a cutaway instead of a story
// beat: the hero's <Graph/> hard-codes its own beat schedule (one node flares,
// one edge clears), so the cutaway keeps that file untouched and re-uses the
// data, the geometry and the tokens with its own timing and its own choice of
// which nodes are at risk.

const ease = Easing.out(Easing.cubic);

export type CutawayGraphProps = {
  frame: number;
  /** frame at which the staggered entrance begins */
  startAt: number;
  /** frame at which the chosen nodes and edges go red */
  litAt: number;
  /** node ids whose ring becomes red */
  lit: readonly string[];
  /** edge keys, "FROM-TO", drawn as the travelling red path */
  litEdges: readonly string[];
  /** placement of the 660 x 470 local space on the canvas */
  box: {left: number; top: number; scale: number};
};

const LOCAL = {width: 660, height: 470};

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

const NodeMark: React.FC<{
  node: Node;
  frame: number;
  startAt: number;
  litAt: number;
  isLit: boolean;
}> = ({node, frame, startAt, litAt, isLit}) => {
  const inAt = startAt + node.order * 2.6;
  const appear = interpolate(frame, [inAt, inAt + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  const on = isLit
    ? interpolate(frame, [litAt, litAt + 11], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ease,
      })
    : 0;

  const ring = interpolateColors(on, [0, 1], [RISK[node.state], C.red]);

  // One measured swell as the ring turns, no loop and no bounce.
  const swell = isLit
    ? interpolate(frame, [litAt, litAt + 7, litAt + 17], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
      })
    : 0;

  // A single expanding halo, once, so the eye is told where to look.
  const haloT = interpolate(frame, [litAt, litAt + 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const showHalo = isLit && haloT > 0 && haloT < 1;

  const scale = interpolate(appear, [0, 1], [0.74, 1]) * (1 + swell * 0.1);

  return (
    <g transform={`translate(${node.x} ${node.y})`} opacity={appear}>
      {showHalo ? (
        <circle
          r={PERSON_R + 2 + haloT * 38}
          fill="none"
          stroke={C.red}
          strokeWidth={interpolate(haloT, [0, 1], [2.4, 0.4])}
          opacity={(1 - haloT) * 0.8}
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
  frame: number;
  startAt: number;
  litAt: number;
  isLit: boolean;
}> = ({from, to, order, frame, startAt, litAt, isLit}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const x1 = from.x + ux * inset(from);
  const y1 = from.y + uy * inset(from);
  const x2 = to.x - ux * inset(to);
  const y2 = to.y - uy * inset(to);

  const inAt = startAt + 8 + order * 1.8;
  const appear = interpolate(frame, [inAt, inAt + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  if (!isLit) {
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

  const on = interpolate(frame, [litAt, litAt + 11], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const colour = interpolateColors(on, [0, 1], [C.edge, C.red]);
  const width = interpolate(on, [0, 1], [1.25, 2.4]);
  const travel = -Math.max(0, frame - litAt) * 0.9;

  return (
    <>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colour}
        strokeWidth={width}
        opacity={appear * interpolate(on, [0, 1], [0.95, 0.22])}
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colour}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={appear * on}
        strokeDasharray="7 8.5"
        strokeDashoffset={travel}
      />
    </>
  );
};

/** Screen position of a node, for pointing a label at it. */
export const nodeAt = (
  id: string,
  box: {left: number; top: number; scale: number},
) => {
  const n = NODE_BY_ID[id];
  return {
    x: box.left + n.x * box.scale,
    y: box.top + n.y * box.scale,
    r: (n.kind === 'person' ? PERSON_R : ITEM_S / 2) * box.scale,
  };
};

export const CutawayGraph: React.FC<CutawayGraphProps> = ({
  frame,
  startAt,
  litAt,
  lit,
  litEdges,
  box,
}) => (
  <svg
    width={LOCAL.width * box.scale}
    height={LOCAL.height * box.scale}
    viewBox={`0 0 ${LOCAL.width} ${LOCAL.height}`}
    style={{
      position: 'absolute',
      left: box.left,
      top: box.top,
      overflow: 'visible',
    }}
  >
    {EDGES.map((e) => (
      <EdgeLine
        key={`${e.from}-${e.to}`}
        from={NODE_BY_ID[e.from]}
        to={NODE_BY_ID[e.to]}
        order={e.order}
        frame={frame}
        startAt={startAt}
        litAt={litAt}
        isLit={litEdges.includes(`${e.from}-${e.to}`)}
      />
    ))}
    {NODES.map((n) => (
      <NodeMark
        key={n.id}
        node={n}
        frame={frame}
        startAt={startAt}
        litAt={litAt}
        isLit={lit.includes(n.id)}
      />
    ))}
  </svg>
);
