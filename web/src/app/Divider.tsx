/**
 * The grab handle between two panes.
 *
 * A 1px hairline is a 1px target, which nobody can hit, so the real hit area is
 * 13px of transparent nothing centred on the line and spilling over both
 * panes. Fitts's law, basically. Double-click resets the pane to its default,
 * which is the cheapest possible way out of a layout somebody has dragged into
 * a corner.
 */
export function Divider({
  axis,
  dragging,
  onDrag,
  onReset,
  label,
}: {
  axis: 'x' | 'y';
  dragging: boolean;
  onDrag: () => void;
  onReset: () => void;
  label: string;
}) {
  const vertical = axis === 'x';
  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label={label}
      onMouseDown={onDrag}
      onDoubleClick={onReset}
      title={`${label}. Double-click to reset.`}
      className={`group relative shrink-0 transition-colors ${
        vertical ? 'w-px cursor-col-resize' : 'h-px cursor-row-resize'
      } ${dragging ? 'bg-accent' : 'bg-hair hover:bg-accent'}`}
    >
      <span
        className={`absolute ${
          vertical ? 'inset-y-0 -left-[6px] w-[13px] cursor-col-resize' : 'inset-x-0 -top-[6px] h-[13px] cursor-row-resize'
        }`}
      />
      <span
        aria-hidden
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${
          vertical ? 'h-7 w-[3px]' : 'h-[3px] w-7'
        } ${dragging ? 'bg-accent' : 'bg-hair-2 group-hover:bg-accent'}`}
      />
    </div>
  );
}
