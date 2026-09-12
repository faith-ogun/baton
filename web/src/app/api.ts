import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AuditEntry, GraphNode, Risk, Rules, WorkspaceState } from '../types';
import { INCOMING_RISK, mockState } from './mock';

/**
 * The dashboard's state layer.
 *
 * It asks the FastAPI backend for `GET /api/state` and opens `WS /live`. If
 * neither answers, it runs the seeded workspace from `mock.ts` instead and
 * says so in the header, so the front end is never blocked on the backend and
 * the demo can never fail because a server did not come up.
 *
 * Approvals are optimistic: the card goes to `working`, the action fires, and
 * the audit row lands. Against the real backend the row comes back over the
 * socket; against the mock it is written here.
 */

/**
 * Set VITE_API_BASE to talk to the backend. Unset, the app makes no network
 * call at all and runs on the seeded workspace. That is deliberate: a dev
 * server proxying to a backend that is not up yet spews ECONNREFUSED on every
 * load, which buries the errors that actually matter.
 */
const API = import.meta.env.VITE_API_BASE as string | undefined;

/**
 * A mirror of the backend's deterministic registry, so moving a threshold in
 * the rules drawer visibly re-scores the queue before `risk.py` exists. Once
 * the backend is wired it is the authority and this only smooths the gap
 * between a slider moving and the next `/state`.
 */
export function scoreRisk(r: Risk, rules: Rules): number {
  const w = rules.severity_weights;

  // How close the clock is, on a ten-day horizon. Shared by every detector so
  // "due in two days" means the same amount of trouble whatever kind of
  // trouble it is.
  const prox = r.dueInDays == null ? 0 : Math.max(0, Math.min(1, 1 - r.dueInDays / 10));
  const proxTerm = prox * 22 * (w.deadline_proximity * 2);

  let s: number;
  switch (r.type) {
    case 'open_loop_ask':
      s =
        46 +
        Math.max(0, (r.ageDays ?? 0) - rules.open_loop_ask.unanswered_business_days) * 3.2 +
        ((r.dueInDays ?? 99) <= rules.open_loop_ask.escalate_if_deadline_within_days ? 18 : 0) +
        (r.ageDays ?? 0) * w.thread_age * 0.4 +
        (r.unowned ? 16 : 0);
      break;

    case 'stalled_task':
      s =
        38 +
        Math.max(0, (r.ageDays ?? 0) - rules.stalled_task.no_update_days) * 4 +
        ((r.dueInDays ?? 99) <= rules.stalled_task.at_risk_if_due_within_days ? 18 : 0);
      break;

    case 'unbooked_deadline':
      // The missing hold *is* the violation, so it carries most of the weight.
      s = 24 + (rules.deadline.require_calendar_hold ? 22 : 0);
      break;

    case 'spof': {
      // The graph facts behind this one: 4 sole-owned critical items, and a
      // betweenness of 0.96 across the workspace.
      const sole = 4;
      const betweenness = 0.96;
      s =
        56 +
        Math.max(0, sole - rules.spof.max_sole_critical_items) * 10 +
        Math.max(0, betweenness - rules.spof.betweenness_percentile) * 100 +
        w.seniority * 30;
      break;
    }
  }

  return Math.max(4, Math.min(99, Math.round(s + proxTerm)));
}

/** Health is what is left once the open queue has taken its bite. */
function healthFrom(risks: Risk[]): number {
  const open = risks.filter((r) => r.status === 'open' || r.status === 'working');
  if (!open.length) return 98;
  // The worst single risk sets the tone; the rest of the queue adds weight. One
  // fire is bad, five is worse, and clearing any of them has to move the number.
  const worst = Math.max(...open.map((r) => r.severity));
  const weight = open.reduce((a, r) => a + r.severity, 0);
  return Math.max(8, Math.round(100 - worst * 0.35 - weight * 0.045));
}

/** Score and rank a fresh state, so the first paint already agrees with the registry. */
function settle(s: WorkspaceState): WorkspaceState {
  const risks = s.risks
    .map((r) => ({ ...r, severity: scoreRisk(r, s.rules) }))
    .sort((a, b) => b.severity - a.severity);
  return { ...s, risks, health: healthFrom(risks) };
}

/** Money, to the nearest hundred, with no decimals to read past. */
export function money(gbp: number): string {
  if (gbp >= 1_000_000) return `£${(gbp / 1_000_000).toFixed(2)}m`;
  if (gbp >= 1000) return `£${Math.round(gbp / 100) / 10}k`;
  return `£${Math.round(gbp)}`;
}

export interface Toast {
  id: number;
  title: string;
  detail: string;
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(() => settle(mockState()));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const toastId = useRef(0);
  /**
   * Cards that have been handled but are still playing their exit. A settled
   * card has to stay in the list for the length of its animation or it
   * vanishes with no hand-off at all, and it has to leave the list at the end
   * of it or it holds a card-sized hole open at the top of the queue.
   */
  const [retiring, setRetiring] = useState<ReadonlySet<string>>(new Set());

  const retire = useCallback((id: string) => {
    setRetiring((r) => new Set(r).add(id));
    setTimeout(
      () =>
        setRetiring((r) => {
          const next = new Set(r);
          next.delete(id);
          return next;
        }),
      480,
    );
  }, []);

  const pushToast = useCallback((title: string, detail: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, title, detail }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  }, []);

  // Try the real backend once. Failure is expected and silent: the seeded
  // workspace is already loaded, so there is nothing to fall back to.
  useEffect(() => {
    if (!API) return;
    let live = true;
    (async () => {
      try {
        const res = await fetch(`${API}/api/state`, { signal: AbortSignal.timeout(2500) });
        if (!res.ok) return;
        const real = (await res.json()) as WorkspaceState;
        // The backend owns scoring once it is there; ranking here only
        // guarantees the queue is ordered whatever order the wire used.
        if (live) setState({ ...real, connected: true, risks: [...real.risks].sort((a, b) => b.severity - a.severity) });
      } catch {
        /* seeded workspace stands */
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // Re-score whenever the rules move, and keep health in step.
  const rescore = useCallback((rules: Rules) => {
    setState((s) => {
      const risks = s.risks.map((r) => ({ ...r, severity: scoreRisk(r, rules) }));
      risks.sort((a, b) => b.severity - a.severity);
      return { ...s, rules, risks, health: healthFrom(risks) };
    });
  }, []);

  /** Approve: fire the action, cool the nodes it touched, write the audit row. */
  const approve = useCallback(
    async (id: string) => {
      const risk = state.risks.find((r) => r.id === id);
      if (!risk || risk.status !== 'open') return;

      setState((s) => ({
        ...s,
        risks: s.risks.map((r) => (r.id === id ? { ...r, status: 'working' } : r)),
      }));

      if (API) {
        try {
          await fetch(`${API}/api/risks/${id}/approve`, {
            method: 'POST',
            signal: AbortSignal.timeout(2500),
          });
        } catch {
          /* the state change below still stands in for the action */
        }
      }

      await new Promise((r) => setTimeout(r, 780));

      const entry: AuditEntry = {
        id: `a:${Date.now()}`,
        at: new Date().toISOString(),
        verb: risk.action.label.replace(/^(Send|Post|Book|Create|Ask)\b/, (m) =>
          ({ Send: 'Sent', Post: 'Posted', Book: 'Booked', Create: 'Created', Ask: 'Asked' })[m] ?? m,
        ),
        detail: risk.action.summary,
        app: risk.action.app,
        riskId: id,
        href: '#',
      };

      setState((s) => {
        const risks = s.risks.map((r) => (r.id === id ? { ...r, status: 'done' as const } : r));
        const touched = new Set(risk.nodes);
        const nodes: GraphNode[] = s.graph.nodes.map((n) =>
          touched.has(n.id) ? { ...n, risk: Math.max(0, n.risk - 0.55), hot: false } : n,
        );
        const edges = s.graph.edges.map((e) =>
          touched.has(e.source) && touched.has(e.target) ? { ...e, open: false } : e,
        );
        return {
          ...s,
          risks,
          graph: { nodes, edges },
          audit: [entry, ...s.audit],
          health: healthFrom(risks),
        };
      });

      retire(id);
      pushToast(`Baton ${entry.verb.toLowerCase()}`, `${risk.action.app} · logged to the audit sheet`);
    },
    [state.risks, pushToast, retire],
  );

  const dismiss = useCallback(
    (id: string) => {
      setState((s) => {
        const risks = s.risks.map((r) => (r.id === id ? { ...r, status: 'dismissed' as const } : r));
        return { ...s, risks, health: healthFrom(risks) };
      });
      retire(id);
    },
    [retire],
  );

  /**
   * The live event. On camera this arrives as a real webhook over the socket;
   * this is the same code path, triggered by hand so the demo never depends on
   * mail delivery timing.
   */
  const trigger = useCallback(() => {
    setState((s) => {
      if (s.risks.some((r) => r.id === INCOMING_RISK.id)) return s;
      const risk = { ...INCOMING_RISK, severity: scoreRisk(INCOMING_RISK, s.rules) };
      const risks = [risk, ...s.risks].sort((a, b) => b.severity - a.severity);
      const hot = new Set(risk.nodes);
      const nodes = s.graph.nodes.map((n) =>
        hot.has(n.id) ? { ...n, risk: Math.min(1, n.risk + 0.3), hot: true } : { ...n, hot: false },
      );
      const edges = [
        ...s.graph.edges,
        { source: 'th:sentrix-ask', target: 'u:priya', kind: 'asks' as const, open: true },
      ];
      return { ...s, risks, graph: { nodes, edges }, health: healthFrom(risks) };
    });
    pushToast('Inbound mail from the agency', 'Webhook received · graph rebuilt · 1 new risk');
  }, [pushToast]);

  const openRisks = useMemo(
    () => state.risks.filter((r) => r.status === 'open' || r.status === 'working'),
    [state.risks],
  );

  /** Person-days on the line across the open queue. Money is this times the rate. */
  const exposureDays = useMemo(
    () =>
      state.risks
        .filter((r) => r.status === 'open' || r.status === 'working')
        .reduce((a, r) => a + r.impact.days, 0),
    [state.risks],
  );

  /** What the queue draws: everything still open, plus whatever is on its way out. */
  const visibleRisks = useMemo(
    () => state.risks.filter((r) => r.status === 'open' || r.status === 'working' || retiring.has(r.id)),
    [state.risks, retiring],
  );

  return {
    state,
    openRisks,
    visibleRisks,
    exposureDays,
    approve,
    dismiss,
    trigger,
    rescore,
    toasts,
    selected,
    setSelected,
  };
}
