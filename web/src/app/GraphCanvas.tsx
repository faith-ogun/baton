import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { forceCollide, forceX, forceY } from 'd3-force';
import type { GraphEdge, GraphNode, NodeKind } from '../types';
import type { Palette } from '../lib/theme';

/**
 * The live workspace graph.
 *
 * Two design decisions do the legibility work, and both came out of the first
 * version being a field of coloured dots.
 *
 * 1. TYPE AND RISK ARE SEPARATE CHANNELS. Colour used to carry risk alone,
 *    which meant nothing on screen told you whether a red blob was a person
 *    or an email. Now the shape and the glyph say WHAT a node is (a circle
 *    with initials is a person, a square with an envelope is a thread, a tick
 *    is a task, a clock is a deadline) and the ring around it says how much
 *    trouble it is in. You can read either one without decoding the other.
 * 2. THE FILL IS THE SURFACE COLOUR. Nodes read as chips sitting on the
 *    canvas rather than as saturated dots, so the risk ring is the only strong
 *    colour in the frame and the eye goes straight to it.
 *
 * The simulation objects live in a ref and are mutated in place, because
 * replacing them on every state change would fling the layout apart on every
 * webhook. The array identity changes only when the membership does, and that
 * re-warm is the animation the demo is built around.
 */

type SimNode = GraphNode & { x?: number; y?: number; fx?: number; fy?: number };
type SimLink = Omit<GraphEdge, 'source' | 'target'> & {
  source: string | SimNode;
  target: string | SimNode;
};

const KIND_LABEL: Record<NodeKind, string> = {
  person: 'Person',
  task: 'Task',
  thread: 'Thread',
  deadline: 'Deadline',
  project: 'Project',
};

function band(risk: number, p: Palette) {
  if (risk >= 0.66) return p.risk;
  if (risk >= 0.33) return p.warn;
  return p.ok;
}

function radius(n: GraphNode) {
  const base = n.kind === 'person' ? 9 : n.kind === 'project' ? 9.5 : 7.5;
  return base + n.load * (n.kind === 'person' ? 6 : 2.5);
}

/** People, projects and deadlines always; tasks and threads once they are red. */
function labelled(n: GraphNode) {
  return n.kind === 'person' || n.kind === 'project' || n.kind === 'deadline' || n.risk >= 0.72;
}

function initials(label: string) {
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** The body of a node: a circle for a person, a rounded square for work. */
function body(ctx: CanvasRenderingContext2D, kind: NodeKind, x: number, y: number, r: number) {
  ctx.beginPath();
  if (kind === 'person') {
    ctx.arc(x, y, r, 0, Math.PI * 2);
    return;
  }
  const w = kind === 'project' ? r * 1.5 : r;
  const h = kind === 'thread' ? r * 0.82 : r;
  const k = Math.min(w, h) * 0.36;
  ctx.moveTo(x - w + k, y - h);
  ctx.arcTo(x + w, y - h, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x - w, y + h, k);
  ctx.arcTo(x - w, y + h, x - w, y - h, k);
  ctx.arcTo(x - w, y - h, x + w, y - h, k);
  ctx.closePath();
}

/**
 * The glyph inside a work node. This is what actually answers "is that an
 * email or a task", so it is drawn at a fixed fraction of the node and in the
 * risk colour, never in a muted tone that disappears at a distance.
 */
function glyph(
  ctx: CanvasRenderingContext2D,
  kind: NodeKind,
  x: number,
  y: number,
  r: number,
  colour: string,
  scale: number,
) {
  const u = r * 0.5;
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = Math.max(0.9, 1.5 / scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();

  switch (kind) {
    case 'thread':
      // an envelope: the one glyph a judge reads instantly as "a message"
      ctx.rect(x - u, y - u * 0.68, u * 2, u * 1.36);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - u, y - u * 0.68);
      ctx.lineTo(x, y + u * 0.16);
      ctx.lineTo(x + u, y - u * 0.68);
      ctx.stroke();
      break;
    case 'task':
      // a tick
      ctx.moveTo(x - u * 0.86, y);
      ctx.lineTo(x - u * 0.12, y + u * 0.7);
      ctx.lineTo(x + u * 0.9, y - u * 0.72);
      ctx.stroke();
      break;
    case 'deadline':
      // a clock at five to twelve
      ctx.arc(x, y, u * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - u * 0.52);
      ctx.lineTo(x, y);
      ctx.lineTo(x + u * 0.42, y + u * 0.24);
      ctx.stroke();
      break;
    case 'project':
      // stacked layers
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x - u * 0.9, y + i * u * 0.52);
        ctx.lineTo(x + u * 0.9, y + i * u * 0.52);
        ctx.stroke();
      }
      break;
    case 'person':
      break;
  }
}

export function GraphCanvas({
  nodes,
  edges,
  selected,
  onSelect,
  palette,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  palette: Palette;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const fg = useRef<ForceGraphMethods<SimNode, SimLink> | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<string | null>(null);

  const store = useRef<{ nodes: SimNode[]; links: SimLink[] }>({ nodes: [], links: [] });
  const [version, setVersion] = useState(0);

  const nodeKey = nodes.map((n) => n.id).join('|');
  const edgeKey = edges.map((e) => `${e.source}>${e.target}:${e.kind}`).join('|');

  // Membership changed: rebuild, keeping the positions of nodes we already had.
  useEffect(() => {
    const prev = new Map(store.current.nodes.map((n) => [n.id, n]));
    store.current = {
      nodes: nodes.map((n) => {
        const old = prev.get(n.id);
        return old ? Object.assign(old, n) : { ...n };
      }),
      links: edges.map((e) => ({ ...e })),
    };
    setVersion((v) => v + 1);
  }, [nodeKey, edgeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Field-only change: patch in place so the layout is untouched. No repaint
  // call needed, because force-graph runs its render loop continuously and
  // only stops ticking the layout when it cools.
  useEffect(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    for (const sn of store.current.nodes) {
      const next = byId.get(sn.id);
      if (next) Object.assign(sn, { risk: next.risk, load: next.load, hot: next.hot, meta: next.meta });
    }
    const byEdge = new Map(edges.map((e) => [`${e.source}>${e.target}:${e.kind}`, e]));
    for (const sl of store.current.links) {
      const s = typeof sl.source === 'object' ? sl.source.id : sl.source;
      const t = typeof sl.target === 'object' ? sl.target.id : sl.target;
      const next = byEdge.get(`${s}>${t}:${sl.kind}`);
      if (next) sl.open = next.open;
    }
  }, [nodes, edges]);

  useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  /**
   * Room to breathe. The default forces pack a graph this size into a knot
   * where the labels sit on top of each other, so the charge is turned up, the
   * links are lengthened by kind, and a collision force gives every node a
   * personal space large enough for its own label.
   */
  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    /*
     * Spread is a trade, not a slider to max out. Push the nodes further
     * apart and zoom-to-fit simply zooms out further to hold them all, which
     * shrinks the nodes on screen while the labels stay at a constant screen
     * size, so the labels end up *relatively bigger* and collide more. These
     * values are tuned for the whole graph fitting a pane of this size at a
     * scale near 1, which is where the glyphs are readable.
     */
    g.d3Force('charge')?.strength(-300).distanceMax(360);
    g.d3Force('link')?.distance((l: SimLink) =>
      l.kind === 'assigned' ? 56 : l.kind === 'asks' ? 78 : l.kind === 'blocks' ? 86 : 96,
    );
    g.d3Force(
      'collide',
      forceCollide<SimNode>((n) => radius(n) + (labelled(n) ? 21 : 14)).strength(0.92),
    );

    /*
     * Match the cloud to the shape of the pane.
     *
     * Left alone, these forces settle into a roughly circular cloud. The pane
     * is nearly twice as wide as it is tall, and zoom-to-fit can only fit the
     * binding dimension, so a square cloud filled 78% of the height and 43%
     * of the width: more than half the canvas empty, and the graph zoomed in
     * further than it needed to be. Pulling harder on the vertical axis than
     * the horizontal, in proportion to the pane's own aspect ratio, flattens
     * the cloud to the same shape as the space it has to live in.
     */
    const aspect = Math.max(1, size.w / Math.max(1, size.h));
    g.d3Force('x', forceX<SimNode>(0).strength(0.014));
    g.d3Force('y', forceY<SimNode>(0).strength(0.014 * aspect * aspect));
    g.d3ReheatSimulation();
  }, [version, size.w, size.h]);

  /** Nodes in the selected risk stay lit; everything else dims. */
  const focus = useMemo(() => {
    const id = hover ?? selected;
    if (!id) return null;
    const keep = new Set<string>([id]);
    for (const e of edges) {
      if (e.source === id) keep.add(e.target);
      if (e.target === id) keep.add(e.source);
    }
    return keep;
  }, [hover, selected, edges]);

  const paintNode = useCallback(
    (n: SimNode, ctx: CanvasRenderingContext2D, scale: number) => {
      if (n.x == null || n.y == null) return;
      const r = radius(n);
      const isBaton = n.id === 'u:baton';
      const ring = isBaton ? palette.agent : band(n.risk, palette);
      const dim = focus && !focus.has(n.id) ? 0.2 : 1;
      ctx.globalAlpha = dim;

      // A node on fire: one expanding ring off the clock, so it animates with
      // no React involvement at all.
      if (n.hot || n.risk >= 0.8) {
        const t = (performance.now() % 2200) / 2200;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4 + t * 18, 0, Math.PI * 2);
        ctx.strokeStyle = palette.risk;
        ctx.globalAlpha = dim * (1 - t) * 0.5;
        ctx.lineWidth = 1.8 / scale;
        ctx.stroke();
        ctx.globalAlpha = dim;
      }

      // A sole owner wears a dashed collar: the single point of failure, drawn.
      if (n.sole) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4.5, 0, Math.PI * 2);
        ctx.setLineDash([2.4 / scale, 2.4 / scale]);
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 1.4 / scale;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // body: the surface colour, so the ring is the only strong colour here
      body(ctx, n.kind, n.x, n.y, r);
      ctx.fillStyle = palette.panel;
      ctx.fill();
      if (n.risk >= 0.66) {
        // a wash, so a page of nodes still reads red-at-a-glance from afar
        ctx.fillStyle = palette.risk;
        ctx.globalAlpha = dim * 0.13;
        ctx.fill();
        ctx.globalAlpha = dim;
      }
      ctx.strokeStyle = ring;
      ctx.lineWidth = (selected === n.id || hover === n.id ? 3.4 : 2.4) / scale;
      ctx.stroke();

      if (n.kind === 'person') {
        ctx.font = `600 ${Math.max(6, r * 0.92)}px 'JetBrains Mono', ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isBaton ? palette.agent : n.risk >= 0.66 ? palette.risk : palette.mid;
        ctx.fillText(initials(n.label), n.x, n.y + r * 0.06);
      } else {
        glyph(ctx, n.kind, n.x, n.y, r, ring, scale);
      }

      ctx.globalAlpha = 1;
    },
    [focus, hover, selected, palette],
  );

  /**
   * Labels are painted after every node, so a node can never land on top of a
   * neighbour's label.
   *
   * The collision force cannot help here: it works in graph units on a node's
   * radius, while a label is a wide box of constant *screen* size sitting
   * beside the node, so two nodes a comfortable distance apart can still have
   * labels straight through each other.
   *
   * Each label gets four candidate positions and takes the best. Other labels
   * veto a position outright, because two names on top of each other are
   * worse than one name. Node circles only rank it, because at high zoom a
   * label is wide enough in graph units that every position crosses
   * something, and treating that as fatal silently deletes the whole layer.
   * The visible rectangle is a hard boundary, or an edge node's label reaches
   * out of frame and gets sliced in half.
   */
  const paintLabels = useCallback(
    (ctx: CanvasRenderingContext2D, scale: number) => {
      if (scale < 0.45) return;
      /*
       * Dividing by the scale is what keeps a label a constant size on SCREEN
       * whatever the zoom. The floor this used to carry, Math.max(8.5, ...),
       * was quietly in the wrong unit: 8.5 is graph units, so at a zoom of 2.2
       * it forced labels to 19 real pixels, dwarfing the nodes. There is no
       * floor to apply here; labels simply stop being drawn below 0.45 zoom.
       */
      const fs = 11 / scale;
      const h = fs * 1.15;
      const gap = 7 / scale;
      const pad = 2.5 / scale;
      ctx.font = `500 ${fs}px 'JetBrains Mono', ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      // The halo is drawn in the ground colour and has to be wide enough to
      // knock out an EDGE passing behind the text, not just soften the
      // letterforms. Too thin and a link runs through a name like a strike
      // through it, which is the single ugliest thing a node graph does.
      ctx.lineWidth = 5.5 / scale;
      ctx.strokeStyle = palette.ground;
      ctx.lineJoin = 'round';

      type Box = [number, number, number, number];
      const hits = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
      const grow = (b: Box): Box => [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad];

      const g = fg.current;
      const tl = g?.screen2GraphCoords(6, 6);
      const br = g?.screen2GraphCoords(size.w - 6, size.h - 6);
      const inside = (b: Box) =>
        !tl || !br || (b[0] >= tl.x && b[1] >= tl.y && b[2] <= br.x && b[3] <= br.y);

      const nodeBoxes = new Map<string, Box>(
        store.current.nodes
          .filter((n) => n.x != null && n.y != null)
          .map((n) => {
            const r = radius(n) + 2;
            return [n.id, [n.x! - r, n.y! - r, n.x! + r, n.y! + r] as Box];
          }),
      );

      const rank = (n: SimNode) =>
        n.kind === 'person' ? 0 : n.kind === 'project' ? 1 : n.kind === 'deadline' ? 2 : 3;

      const queue = store.current.nodes
        .filter((n) => n.x != null && n.y != null && (labelled(n) || n.id === hover))
        .sort((a, b) => rank(a) - rank(b) || b.risk - a.risk);

      const placed: Box[] = [];

      for (const n of queue) {
        const text = n.label.length > 24 ? `${n.label.slice(0, 23)}…` : n.label;
        const w = ctx.measureText(text).width;
        const r = radius(n);
        const x = n.x!;
        const y = n.y!;

        /*
         * Eight positions rather than four. The four cardinals alone are not
         * enough once the nodes are big enough to read: in a cluster every
         * cardinal crosses a neighbour, the ranking picks the least bad one,
         * and you get a name lying across a circle. The diagonals are usually
         * clear, so adding them turns "least bad" back into "clean".
         * Order is the preference order, so a label only moves as far as it
         * has to.
         */
        const d = 0.72; // diagonal offsets, in units of the node radius
        const mk = (
          cx: number,
          cy: number,
          align: CanvasTextAlign,
        ): { x: number; y: number; align: CanvasTextAlign; box: Box } => {
          const x0 = align === 'center' ? cx - w / 2 : align === 'left' ? cx : cx - w;
          return { x: cx, y: cy, align, box: [x0, cy, x0 + w, cy + h] };
        };
        const candidates = [
          mk(x, y + r + gap, 'center'),
          mk(x, y - r - gap - h, 'center'),
          mk(x + r + gap, y - h / 2, 'left'),
          mk(x - r - gap, y - h / 2, 'right'),
          mk(x + (r + gap) * d, y + (r + gap) * d, 'left'),
          mk(x - (r + gap) * d, y + (r + gap) * d, 'right'),
          mk(x + (r + gap) * d, y - (r + gap) * d - h, 'left'),
          mk(x - (r + gap) * d, y - (r + gap) * d - h, 'right'),
        ];

        const viable = candidates.filter(
          (c) => inside(c.box) && !placed.some((l) => hits(grow(c.box), l)),
        );
        const cost = (box: Box) => {
          let k = 0;
          for (const [id, nb] of nodeBoxes) if (id !== n.id && hits(box, nb)) k++;
          return k;
        };
        const pick =
          viable.length === 0 ? null : viable.reduce((b, c) => (cost(c.box) < cost(b.box) ? c : b));

        // The hovered node always wins: you asked for that one by name.
        const use = pick ?? (n.id === hover ? candidates[0] : null);
        if (!use) continue;
        placed.push(use.box);

        ctx.textAlign = use.align;
        ctx.globalAlpha = focus && !focus.has(n.id) ? 0.2 : 1;
        ctx.strokeText(text, use.x, use.y);
        ctx.fillStyle =
          n.id === 'u:baton' ? palette.agent : n.risk >= 0.66 ? palette.risk : palette.dim;
        ctx.fillText(text, use.x, use.y);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
    },
    [focus, hover, palette, size.w, size.h],
  );

  const paintPointer = useCallback((n: SimNode, colour: string, ctx: CanvasRenderingContext2D) => {
    if (n.x == null || n.y == null) return;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(n.x, n.y, radius(n) + 6, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const dimmedLink = useCallback(
    (l: SimLink) => {
      if (!focus) return false;
      const s = typeof l.source === 'object' ? l.source.id : String(l.source);
      const t = typeof l.target === 'object' ? l.target.id : String(l.target);
      return !(focus.has(s) && focus.has(t));
    },
    [focus],
  );

  return (
    <div ref={wrap} className="relative h-full w-full">
      {size.w > 0 && (
        <ForceGraph2D<SimNode, SimLink>
          ref={fg}
          width={size.w}
          height={size.h}
          graphData={store.current}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={1}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={paintPointer}
          nodeLabel={(n) => `${KIND_LABEL[n.kind]} · ${n.label}${n.meta ? ` · ${n.meta}` : ''}`}
          linkColor={(l) => (dimmedLink(l) ? palette.line : l.open ? palette.risk : palette.line2)}
          linkWidth={(l) => (dimmedLink(l) ? 0.7 : l.open ? 1.7 : 1)}
          // An ask has a direction, and the direction is the whole point of an
          // open loop, so every edge carries an arrowhead.
          linkDirectionalArrowLength={(l) => (dimmedLink(l) ? 0 : l.kind === 'participates' ? 0 : 4.2)}
          linkDirectionalArrowRelPos={0.86}
          linkDirectionalArrowColor={(l) => (l.open ? palette.risk : palette.line2)}
          linkDirectionalParticles={(l) => (l.open && !dimmedLink(l) ? 3 : 0)}
          linkDirectionalParticleWidth={2.4}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={() => palette.risk}
          onNodeClick={(n) => onSelect(selected === n.id ? null : n.id)}
          onNodeHover={(n) => setHover(n ? n.id : null)}
          onBackgroundClick={() => onSelect(null)}
          cooldownTime={4200}
          d3VelocityDecay={0.32}
          warmupTicks={40}
          onRenderFramePost={paintLabels}
          onEngineStop={() => fg.current?.zoomToFit(700, 52)}
          enableNodeDrag
        />
      )}
    </div>
  );
}
