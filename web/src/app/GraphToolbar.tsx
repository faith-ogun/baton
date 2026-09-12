import { ChevronIcon } from '../ui/theme-icons';

/**
 * The graph's own controls, in a strip under its header rather than floating
 * over the canvas. A zoom slider because a graph you cannot resize is a
 * picture, and a fit button because once you have zoomed, getting back to the
 * whole thing should be one click and not a gesture.
 */
export function GraphToolbar({
  zoom,
  setZoom,
  fit,
  labels,
  setLabels,
  counts,
}: {
  zoom: number;
  setZoom: (k: number) => void;
  fit: () => void;
  labels: boolean;
  setLabels: (v: boolean) => void;
  counts: { nodes: number; edges: number; open: number };
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-hair bg-panel px-3.5 py-1.5">
      <span className="baton-rule w-4" />
      <span className="kicker text-dim">graph</span>

      <span className="hidden font-mono text-[0.625rem] text-dim sm:inline">
        {counts.nodes} nodes · {counts.edges} edges ·{' '}
        <span className="text-risk">{counts.open} open</span>
      </span>

      <div className="ml-auto flex items-center gap-3">
        <label className="flex items-center gap-2" title="Zoom">
          <span className="font-mono text-[0.625rem] text-dim">SIZE</span>
          <input
            type="range"
            min={0.3}
            max={2.6}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-[104px] accent-[var(--color-accent)]"
            aria-label="Graph zoom"
          />
          <span className="num w-8 text-[0.625rem] text-dim">{zoom.toFixed(2)}×</span>
        </label>

        <button
          type="button"
          onClick={fit}
          className="rounded border border-hair px-2 py-1 font-mono text-[0.625rem] tracking-[0.06em] text-mid uppercase transition-colors hover:border-accent hover:text-strong"
          title="Fit the whole graph (F)"
        >
          Fit
        </button>

        <button
          type="button"
          onClick={() => setLabels(!labels)}
          aria-pressed={labels}
          className={`rounded border px-2 py-1 font-mono text-[0.625rem] tracking-[0.06em] uppercase transition-colors ${
            labels
              ? 'border-accent bg-accent-soft text-accent-ink'
              : 'border-hair text-dim hover:text-mid'
          }`}
          title="Show node names"
        >
          Names
        </button>
      </div>
    </div>
  );
}

/** The queue's sort control. Two orders, because a third is a settings page. */
export function SortToggle({
  sort,
  setSort,
}: {
  sort: 'severity' | 'cost';
  setSort: (s: 'severity' | 'cost') => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setSort(sort === 'severity' ? 'cost' : 'severity')}
      className="inline-flex items-center gap-1 font-mono text-[0.625rem] tracking-[0.04em] text-dim uppercase transition-colors hover:text-strong"
      title="Change the ordering"
    >
      by {sort}
      <ChevronIcon size={12} />
    </button>
  );
}
