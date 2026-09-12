const KEYS: [string, string][] = [
  ['J / ↓', 'next risk'],
  ['K / ↑', 'previous risk'],
  ['A', 'approve the open risk'],
  ['D', 'dismiss it'],
  ['E', 'trigger an inbound event'],
  ['R', 'toggle the rules registry'],
  ['/', 'ask the workspace a question'],
  ['F', 'fit the graph'],
  ['[  ]', 'narrow / widen the queue'],
  ['\\', 'open / close the audit trail'],
  ['G', 'light or dark'],
  ['T', 'start the tour'],
  ['?', 'this list'],
  ['Esc', 'close'],
];

export function Shortcuts({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-void/70 p-6"
      onClick={onClose}
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="bt-count w-full max-w-[420px] border border-hair bg-panel shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-hair px-4 py-3">
          <span className="baton-rule w-4" />
          <span className="kicker text-dim">keyboard</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto font-mono text-[0.6875rem] text-dim hover:text-strong"
          >
            ESC
          </button>
        </div>
        <dl className="divide-y divide-hair">
          {KEYS.map(([k, label]) => (
            <div key={k} className="flex items-center gap-4 px-4 py-2">
              <dt className="w-16 shrink-0">
                <kbd className="rounded border border-hair-2 bg-panel-2 px-1.5 py-0.5 font-mono text-[0.6875rem] text-strong">
                  {k}
                </kbd>
              </dt>
              <dd className="text-[0.8125rem] text-mid">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
