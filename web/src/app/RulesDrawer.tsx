import type { Rules } from '../types';

/** Every slider in the drawer, flattened so the panel is one map over a list. */
const FIELDS: {
  group: keyof Rules;
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}[] = [
  { group: 'open_loop_ask', key: 'unanswered_business_days', label: 'unanswered', min: 1, max: 10, step: 1, unit: 'business days' },
  { group: 'open_loop_ask', key: 'escalate_if_deadline_within_days', label: 'escalate inside', min: 0, max: 7, step: 1, unit: 'days' },
  { group: 'stalled_task', key: 'no_update_days', label: 'no update for', min: 1, max: 14, step: 1, unit: 'days' },
  { group: 'stalled_task', key: 'at_risk_if_due_within_days', label: 'at risk inside', min: 0, max: 10, step: 1, unit: 'days' },
  { group: 'deadline', key: 'warn_within_days', label: 'warn inside', min: 1, max: 14, step: 1, unit: 'days' },
  { group: 'spof', key: 'max_sole_critical_items', label: 'sole critical items', min: 1, max: 8, step: 1 },
  { group: 'spof', key: 'betweenness_percentile', label: 'betweenness above', min: 0.5, max: 0.99, step: 0.01 },
  { group: 'severity_weights', key: 'deadline_proximity', label: 'deadline proximity', min: 0, max: 1, step: 0.05 },
  { group: 'severity_weights', key: 'seniority', label: 'seniority', min: 0, max: 1, step: 0.05 },
  { group: 'severity_weights', key: 'thread_age', label: 'thread age', min: 0, max: 1, step: 0.05 },
  { group: 'cost_model', key: 'blended_day_rate_gbp', label: 'blended day rate', min: 150, max: 1200, step: 10, unit: 'GBP' },
];

const GROUP_LABEL: Record<string, string> = {
  open_loop_ask: 'open_loop_ask',
  stalled_task: 'stalled_task',
  deadline: 'deadline',
  spof: 'spof',
  severity_weights: 'severity_weights',
  cost_model: 'cost_model',
};

/**
 * The rules registry, opened up. This is the inspectable half of the moat:
 * every threshold that decides what counts as dropped is here, and moving one
 * re-scores the queue in front of you.
 */
export function RulesDrawer({
  rules,
  onChange,
  onClose,
}: {
  rules: Rules;
  onChange: (next: Rules) => void;
  onClose: () => void;
}) {
  const set = (group: string, key: string, value: number | boolean) =>
    onChange({
      ...rules,
      [group]: { ...(rules as unknown as Record<string, object>)[group], [key]: value },
    } as Rules);

  return (
    <aside className="flex h-full w-[304px] shrink-0 flex-col border-l border-hair bg-panel">
      <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-hair px-3.5">
        <span className="baton-rule w-4" />
        <span className="kicker text-dim">rules.yaml</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-md px-2 py-1 text-[0.75rem] text-dim transition-colors hover:bg-white/5 hover:text-strong"
        >
          Close
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5">
        <p className="text-[0.8125rem] leading-[1.65] text-mid">
          Baton&rsquo;s whole judgement about what counts as dropped. Move a number and the queue
          re-scores in front of you. There is no second set of thresholds hidden in a prompt.
        </p>

        <div className="mt-5 space-y-5">
          {FIELDS.map((f, i) => {
            // A group header opens each run of fields. Read off the previous
            // entry rather than carried in a variable across the loop: the
            // list is the source of truth, and a mutable cursor would quietly
            // produce the wrong headers the moment anything reorders.
            const header = FIELDS[i - 1]?.group !== f.group;
            const value = (rules as unknown as Record<string, Record<string, number>>)[f.group][f.key];
            return (
              <div key={`${f.group}.${f.key}`}>
                {header && (
                  <p className="mb-3 font-mono text-[0.6875rem] tracking-[0.08em] text-accent-lift">
                    {GROUP_LABEL[f.group]}
                  </p>
                )}
                <label className="block">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[0.8125rem] text-mid">{f.label}</span>
                    <span className="num ml-auto text-[0.8125rem] text-strong">
                      {f.step < 1 ? value.toFixed(2) : value}
                    </span>
                    {f.unit && <span className="font-mono text-[0.625rem] text-dim">{f.unit}</span>}
                  </span>
                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={value}
                    onChange={(e) => set(f.group, f.key, Number(e.target.value))}
                    className="mt-2 w-full accent-[var(--color-accent)]"
                  />
                </label>
              </div>
            );
          })}

          <label className="flex items-center gap-2.5 border-t border-hair pt-4">
            <input
              type="checkbox"
              checked={rules.deadline.require_calendar_hold}
              onChange={(e) => set('deadline', 'require_calendar_hold', e.target.checked)}
              className="size-4 accent-[var(--color-accent)]"
            />
            <span className="text-[0.8125rem] text-mid">
              a deadline must have a calendar hold
            </span>
          </label>
        </div>
      </div>

      <div className="flex h-6 shrink-0 items-center border-t border-hair px-3.5 font-mono text-[0.625rem] text-dim">
        cannot go differently on a second run
      </div>
    </aside>
  );
}
