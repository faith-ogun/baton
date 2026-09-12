/**
 * The wire contract between the FastAPI backend and this front end.
 *
 * `GET /state` returns a `WorkspaceState`; `WS /live` pushes `LiveEvent`s that
 * patch it. The mock workspace in `app/mock.ts` implements exactly this shape,
 * so swapping the real backend in is a matter of pointing `api.ts` at it.
 */

export type NodeKind = 'person' | 'task' | 'thread' | 'deadline' | 'project';

export type RiskBand = 'ok' | 'warn' | 'risk';

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** 0..1. Drives node colour through the three-stop scale. */
  risk: number;
  /** 0..1. Drives node radius: how much this node is carrying. */
  load: number;
  /** People only: sole owner of critical work, i.e. a single point of failure. */
  sole?: boolean;
  /** Set for one tick when a webhook has just touched this node. */
  hot?: boolean;
  meta?: string;
}

export type EdgeKind = 'asks' | 'assigned' | 'mentions' | 'participates' | 'blocks';

export interface GraphEdge {
  source: string;
  target: string;
  kind: EdgeKind;
  /** An unanswered ask, or a blocked dependency. Drawn hot. */
  open?: boolean;
}

export type RiskType = 'open_loop_ask' | 'stalled_task' | 'unbooked_deadline' | 'spof';

export type ActionKind = 'mail' | 'chat' | 'task_patch' | 'task_comment' | 'calendar';

export interface ProposedAction {
  kind: ActionKind;
  /** The button's verb, e.g. "Send the nudge". */
  label: string;
  /** One line of what will happen, in plain English. */
  summary: string;
  /** The app this lands in. Shown as a chip so the cross-app reach is visible. */
  app: 'Mail' | 'Chat' | 'Tasks' | 'Calendar' | 'Sheets';
  /** Editable draft body, where the action has one. LLM-written, human-approved. */
  draft?: string;
  to?: string[];
  /** Structural changes the rules decided, never the model. */
  patch?: Record<string, string>;
}

export interface Risk {
  id: string;
  type: RiskType;
  /** 0..100, from the deterministic registry in `rules`. */
  severity: number;
  title: string;
  detail: string;
  people: string[];
  nodes: string[];
  project?: string;
  ageDays?: number;
  dueInDays?: number;
  /** No assignee at all, which is its own kind of dropped. */
  unowned?: boolean;
  /** The rule that fired, quoted so the score is never a black box. */
  because: string;
  action: ProposedAction;
  status: 'open' | 'working' | 'done' | 'dismissed';
}

export interface AuditEntry {
  id: string;
  at: string;
  verb: string;
  detail: string;
  app: ProposedAction['app'];
  riskId?: string;
  /** Deep link to the record Baton wrote in the workspace. */
  href?: string;
}

export interface Rules {
  open_loop_ask: { unanswered_business_days: number; escalate_if_deadline_within_days: number };
  stalled_task: { no_update_days: number; at_risk_if_due_within_days: number };
  deadline: { require_calendar_hold: boolean; warn_within_days: number };
  spof: { max_sole_critical_items: number; betweenness_percentile: number };
  severity_weights: { deadline_proximity: number; seniority: number; thread_age: number };
}

export interface WorkspaceState {
  generatedAt: string;
  workspace: string;
  /** 0..100 org health. Rises as risks are cleared. */
  health: number;
  connected: boolean;
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  risks: Risk[];
  audit: AuditEntry[];
  rules: Rules;
}

export type LiveEvent =
  | { type: 'graph_update'; nodes: GraphNode[]; edges: GraphEdge[]; health: number }
  | { type: 'new_risk'; risk: Risk }
  | { type: 'action_logged'; entry: AuditEntry; riskId: string; health: number };
