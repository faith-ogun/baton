import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';
import type { GraphEdge, GraphNode, NodeKind } from '../types';

/**
 * The live workspace graph.
 *
 * Two things matter here and they pull against each other. The simulation has
 * to keep its layout across a state change, or every webhook would fling the
 * graph apart; and the nodes have to re-colour the instant risk moves. So the
 * node and link objects live in a ref and are mutated in place, and the array
 * identity only changes when the membership does. When a webhook genuinely
 * adds a node or an edge the layout *should* re-warm, and that re-warm is the
 * animation the demo is built around.
 */

// The token palette, as canvas cannot read CSS variables per frame.
const C = {
  ok: '#2e7d5b',
  warn: '#d9a441',
  risk: '#c2402f',
  agent: '#7a6ff0',
  info: '#5e8fa8',
  hair: '#22405c',
  hair2: '#2d5273',
  void: '#08111d',
  paper: '#f3eee4',
  grey: '#8a96a3',
  accent: '#e0834f',
};

type SimNode = GraphNode & { x?: number; y?: number; fx?: number; fy?: number };
type SimLink = Omit<GraphEdge, 'source' | 'target'> & {
  source: string | SimNode;
  target: string | SimNode;
};

function band(risk: number) {
  if (risk >= 0.66) return C.risk;
  if (risk >= 0.33) return C.warn;
  return C.ok;
}

function radius(n: GraphNode) {
  const base = n.kind === 'person' ? 7 : n.kind === 'project' ? 7.5 : 5;
  return base + n.load * (n.kind === 'person' ? 7 : 4);
}

/**
 * Who gets a name on screen. People, projects and deadlines always, because
 * they are the story; tasks and threads only once they are red, because
 * labelling all nineteen nodes is just noise.
 */
function labelled(n: GraphNode) {
  return n.kind === 'person' || n.kind === 'project' || n.kind === 'deadline' || n.risk >= 0.72;
}

/** One silhouette per kind, so the graph reads as a graph of *things*. */
function shape(ctx: CanvasRenderingContext2D, kind: NodeKind, x: number, y: number, r: number) {
  ctx.beginPath();
  switch (kind) {
    case 'person':
    case 'project':
      ctx.arc(x, y, r, 0, Math.PI * 2);
      break;
    case 'task': {
      const s = r * 0.92;
      const k = s * 0.42;
      ctx.moveTo(x - s + k, y - s);
      ctx.arcTo(x + s, y - s, x + s, y + s, k);
      ctx.arcTo(x + s, y + s, x - s, y + s, k);
      ctx.arcTo(x - s, y + s, x - s, y - s, k);
      ctx.arcTo(x - s, y - s, x + s, y - s, k);
      ctx.closePath();
      break;
    }
    case 'thread': {
      const s = r * 1.18;
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s, y);
      ctx.closePath();
      break;
    }
    case 'deadline': {
      const s = r * 1.22;
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s * 0.92, y + s * 0.7);
      ctx.lineTo(x - s * 0.92, y + s * 0.7);
      ctx.closePath();
      break;
    }
  }
}

export function GraphCanvas({
  nodes,
  edges,
  selected,
  onSelect,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const fg = useRef<ForceGraphMethods<SimNode, SimLink> | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<string | null>(null);

  // Stable simulation objects. Mutated in place; replaced only on membership change.
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

  // Field-only change: patch in place so the layout is untouched, then repaint.
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
    // No repaint call needed: force-graph runs its render loop continuously and
    // only stops *ticking the layout* when it cools, so a colour change lands
    // on the next frame without disturbing a single position.
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
   * where the labels sit on top of each other, which is useless on camera, so
   * the charge is turned well up, the links are lengthened by kind, and a
   * collision force gives every node a personal space large enough for its
   * own label.
   */
  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    g.d3Force('charge')?.strength(-260).distanceMax(340);
    g.d3Force('link')?.distance((l: SimLink) =>
      l.kind === 'assigned' ? 48 : l.kind === 'asks' ? 70 : l.kind === 'blocks' ? 78 : 88,
    );
    g.d3Force(
      'collide',
      forceCollide<SimNode>((n) => radius(n) + (labelled(n) ? 18 : 11)).strength(0.9),
    );
  }, [version]);

  /** Nodes in the selected risk stay lit; everything else dims. */
  const focus = useMemo(() => {
    const id = hover ?? selected;
    if (!id) return null;
    const keep = new Set<string>([id]);
    for (const e of edges) {
      const s = typeof e.source === 'string' ? e.source : '';
      const t = typeof e.target === 'string' ? e.target : '';
      if (s === id) keep.add(t);
      if (t === id) keep.add(s);
    }
    return keep;
  }, [hover, selected, edges]);

  const paintNode = useCallback(
    (n: SimNode, ctx: CanvasRenderingContext2D, scale: number) => {
      if (n.x == null || n.y == null) return;
      const r = radius(n);
      const isBaton = n.id === 'u:baton';
      const fill = isBaton ? C.agent : n.kind === 'person' ? band(n.risk) : band(n.risk);
      const dim = focus && !focus.has(n.id) ? 0.22 : 1;

      ctx.globalAlpha = dim;

      // A hot node flares: one expanding ring, driven off the clock so it
      // animates without any React involvement.
      if (n.hot || n.risk >= 0.8) {
        const t = (performance.now() % 2200) / 2200;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + t * 16, 0, Math.PI * 2);
        ctx.strokeStyle = C.risk;
        ctx.globalAlpha = dim * (1 - t) * 0.55;
        ctx.lineWidth = 1.6 / scale;
        ctx.stroke();
        ctx.globalAlpha = dim;
      }

      // A sole owner wears a dashed collar: the single point of failure, drawn.
      if (n.sole) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 3.5, 0, Math.PI * 2);
        ctx.setLineDash([2.2 / scale, 2.2 / scale]);
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 1.3 / scale;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      shape(ctx, n.kind, n.x, n.y, r);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = C.void;
      ctx.lineWidth = 1.8 / scale;
      ctx.stroke();

      if (n.kind === 'project') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 2.6, 0, Math.PI * 2);
        ctx.strokeStyle = fill;
        ctx.globalAlpha = dim * 0.5;
        ctx.lineWidth = 1.2 / scale;
        ctx.stroke();
        ctx.globalAlpha = dim;
      }

      if (selected === n.id || hover === n.id) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = C.paper;
        ctx.lineWidth = 1.4 / scale;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    },
    [focus, hover, selected],
  );

  /**
   * Labels are painted in a second pass, after every node, so a node can never
   * land on top of a neighbour's label.
   *
   * The collision force cannot help here: it works in graph units on a node's
   * radius, while a label is a wide box of constant *screen* size sitting
   * beside the node, so two nodes a comfortable distance apart can still have
   * labels straight through each other. So this pass places them itself.
   *
   * Each label gets four candidate positions, below, above, right, left, and
   * takes the first that hits neither an already-placed label nor any node
   * circle. Trying four beats trying one and giving up: a single fixed
   * position means a crowded corner silently loses names that matter, and the
   * alternative, nudging a label a few pixels, just leaves you guessing which
   * node it belongs to. Candidates are walked in priority order so that if
   * something does have to go unlabelled it is a task and never a person.
   */
  const paintLabels = useCallback(
    (ctx: CanvasRenderingContext2D, scale: number) => {
      if (scale < 0.5) return;
      const fs = Math.max(8.5, 9.8 / scale);
      const h = fs * 1.15;
      const gap = 4.5 / scale;
      const pad = 2.5 / scale;
      ctx.font = `500 ${fs}px 'JetBrains Mono', ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = C.void;

      type Box = [number, number, number, number];
      const hits = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
      const grow = (b: Box): Box => [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad];

      /*
       * The visible rectangle, in graph units. A label placed to the side of a
       * node near the pane edge reaches straight out of view and gets sliced
       * in half, so the placement has to know where the edges are; otherwise
       * the only cure is padding the zoom-to-fit until the graph is tiny.
       */
      const g = fg.current;
      const tl = g?.screen2GraphCoords(6, 6);
      const br = g?.screen2GraphCoords(size.w - 6, size.h - 6);
      const inside = (b: Box) =>
        !tl || !br || (b[0] >= tl.x && b[1] >= tl.y && b[2] <= br.x && b[3] <= br.y);

      const nodeBoxes = new Map<string, Box>(
        store.current.nodes
          .filter((n) => n.x != null && n.y != null)
          .map((n) => {
            const r = radius(n) + 1;
            return [n.id, [n.x! - r, n.y! - r, n.x! + r, n.y! + r] as Box];
          }),
      );

      const rank = (n: SimNode) =>
        n.kind === 'person' ? 0 : n.kind === 'project' ? 1 : n.kind === 'deadline' ? 2 : 3;

      const queue = store.current.nodes
        // Hovering a quiet node names it, so nothing is unreachable just
        // because it did not clear the labelling threshold.
        .filter((n) => n.x != null && n.y != null && (labelled(n) || n.id === hover))
        .sort((a, b) => rank(a) - rank(b) || b.risk - a.risk);

      const placed: Box[] = [];

      for (const n of queue) {
        const text = n.label.length > 24 ? `${n.label.slice(0, 23)}…` : n.label;
        const w = ctx.measureText(text).width;
        const r = radius(n);
        const x = n.x!;
        const y = n.y!;

        const candidates: { x: number; y: number; align: CanvasTextAlign; box: Box }[] = [
          { x, y: y + r + gap, align: 'center', box: [x - w / 2, y + r + gap, x + w / 2, y + r + gap + h] },
          { x, y: y - r - gap - h, align: 'center', box: [x - w / 2, y - r - gap - h, x + w / 2, y - r - gap] },
          { x: x + r + gap, y: y - h / 2, align: 'left', box: [x + r + gap, y - h / 2, x + r + gap + w, y + h / 2] },
          { x: x - r - gap, y: y - h / 2, align: 'right', box: [x - r - gap - w, y - h / 2, x - r - gap, y + h / 2] },
        ];

        /*
         * Two constraints, and they are not equal. Overlapping another label is
         * fatal, because two names on top of each other are worse than one
         * name: neither is readable and you cannot tell there are two. Crossing
         * a node circle is only untidy, and at high zoom a label is wide enough
         * in graph units that *every* position crosses something, so treating
         * that as fatal too silently deletes the whole layer. So: labels veto,
         * nodes merely rank, and the best of the four positions wins.
         */
        const viable = candidates.filter(
          (c) => inside(c.box) && !placed.some((l) => hits(grow(c.box), l)),
        );
        const pick =
          viable.length === 0
            ? null
            : viable.reduce((best, c) => (cost(c.box) < cost(best.box) ? c : best));

        function cost(box: Box) {
          let k = 0;
          for (const [id, nb] of nodeBoxes) if (id !== n.id && hits(box, nb)) k++;
          return k;
        }

        // The hovered node always wins: you asked for that one by name.
        const use = pick ?? (n.id === hover ? candidates[0] : null);
        if (!use) continue;
        placed.push(use.box);

        ctx.textAlign = use.align;
        ctx.globalAlpha = focus && !focus.has(n.id) ? 0.18 : 1;
        ctx.strokeText(text, use.x, use.y);
        ctx.fillStyle = n.id === 'u:baton' ? '#9a92f5' : n.risk >= 0.66 ? '#e8b5ad' : C.grey;
        ctx.fillText(text, use.x, use.y);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
    },
    [focus, hover, size.w, size.h],
  );

  const paintPointer = useCallback((n: SimNode, colour: string, ctx: CanvasRenderingContext2D) => {
    if (n.x == null || n.y == null) return;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(n.x, n.y, radius(n) + 5, 0, Math.PI * 2);
    ctx.fill();
  }, []);

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
          linkColor={(l) => {
            const dimmed =
              focus &&
              !(
                focus.has(typeof l.source === 'object' ? l.source.id : String(l.source)) &&
                focus.has(typeof l.target === 'object' ? l.target.id : String(l.target))
              );
            if (dimmed) return 'rgba(34,64,92,0.35)';
            return l.open ? 'rgba(194,64,47,0.8)' : C.hair2;
          }}
          linkWidth={(l) => (l.open ? 1.6 : 0.9)}
          linkDirectionalParticles={(l) => (l.open ? 3 : 0)}
          linkDirectionalParticleWidth={2.2}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={() => C.risk}
          onNodeClick={(n) => onSelect(selected === n.id ? null : n.id)}
          onNodeHover={(n) => setHover(n ? n.id : null)}
          onBackgroundClick={() => onSelect(null)}
          cooldownTime={4200}
          d3VelocityDecay={0.32}
          warmupTicks={40}
          onRenderFramePost={paintLabels}
          onEngineStop={() => fg.current?.zoomToFit(700, 64)}
          enableNodeDrag
        />
      )}
    </div>
  );
}
