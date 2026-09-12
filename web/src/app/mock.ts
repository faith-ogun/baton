import type { AuditEntry, GraphEdge, GraphNode, Risk, Rules, Scope, WorkspaceState } from '../types';

/**
 * The seeded demo workspace: the regulatory affairs team at Aldermere Bio,
 * eight people, pushing the Sentrix filing at a fixed agency deadline.
 *
 * Aldermere Bio and Sentrix are invented. The scenario is not: a module of a
 * regulatory submission gated by one sign-off, one sole owner carrying the
 * critical path, and a date nobody put in a calendar.
 *
 * This is the same shape `GET /state` returns, so the dashboard is built and
 * polished against it and the real backend drops straight in. Three situations
 * are planted here on purpose, one for each of the reliable detectors, plus a
 * fourth that the live webhook creates on camera.
 */

const P = (id: string, label: string, risk: number, load: number, meta: string, sole = false): GraphNode => ({
  id,
  kind: 'person',
  label,
  risk,
  load,
  meta,
  sole,
});

const W = (id: string, kind: GraphNode['kind'], label: string, risk: number, load: number, meta: string): GraphNode => ({
  id,
  kind,
  label,
  risk,
  load,
  meta,
});

export const PEOPLE: GraphNode[] = [
  P('u:nicolas', 'Nicolas Bouvier', 0.46, 0.62, 'Regulatory lead'),
  P('u:sally', 'Sally Ahmed', 0.88, 0.71, 'Clinical ops'),
  P('u:priya', 'Priya Raman', 0.79, 0.94, 'CMC / quality', true),
  P('u:tomas', 'Tomas Lind', 0.31, 0.44, 'Biostatistics'),
  P('u:rachel', 'Rachel Foster', 0.12, 0.35, 'Regulatory affairs lead'),
  P('u:baton', 'Baton', 0, 0.5, 'AI coworker'),
];

const WORK: GraphNode[] = [
  W('p:sentrix', 'project', 'Sentrix filing', 0.84, 1, 'Module 3 due 14 Sep'),
  W('p:safety', 'project', 'Safety training', 0.58, 0.5, 'Annual, site-wide'),

  W('t:cmc-batch', 'task', 'CMC batch records', 0.91, 0.8, 'Priya · no update 8d'),
  W('t:stability', 'task', 'Stability tables', 0.74, 0.6, 'Priya · no update 6d'),
  W('t:method-val', 'task', 'Method validation', 0.7, 0.55, 'Priya · no update 6d'),
  W('t:impurity', 'task', 'Impurity memo', 0.68, 0.5, 'Priya · no update 5d'),
  W('t:sap-sync', 'task', 'SAP alignment', 0.24, 0.4, 'Tomas · in progress'),
  W('t:cover-letter', 'task', 'Cover letter', 0.08, 0.3, 'Rachel · in progress'),
  W('t:train-deck', 'task', 'Training deck', 0.52, 0.35, 'Sally · unscheduled'),

  W('th:sentrix-ask', 'thread', 'Module 3 sign-off', 0.93, 0.7, 'Mail · 6 days, no reply'),
  W('th:qa-window', 'thread', 'QA review', 0.28, 0.4, 'Chat · active'),

  W('d:module3', 'deadline', 'Module 3 filing', 0.86, 0.9, 'In 2 days'),
  W('d:safety-due', 'deadline', 'Safety deadline', 0.61, 0.5, 'In 3 days · no hold'),
];

export const NODES: GraphNode[] = [...PEOPLE, ...WORK];

export const EDGES: GraphEdge[] = [
  // the open loop: Nicolas asked, Sally never answered
  { source: 'u:nicolas', target: 'th:sentrix-ask', kind: 'asks', open: true },
  { source: 'th:sentrix-ask', target: 'u:sally', kind: 'asks', open: true },
  { source: 'th:sentrix-ask', target: 'p:sentrix', kind: 'mentions' },
  { source: 'th:sentrix-ask', target: 'd:module3', kind: 'blocks', open: true },

  // Priya as the single point of failure
  { source: 'u:priya', target: 't:cmc-batch', kind: 'assigned' },
  { source: 'u:priya', target: 't:stability', kind: 'assigned' },
  { source: 'u:priya', target: 't:method-val', kind: 'assigned' },
  { source: 'u:priya', target: 't:impurity', kind: 'assigned' },
  { source: 't:cmc-batch', target: 'd:module3', kind: 'blocks', open: true },
  { source: 't:stability', target: 'd:module3', kind: 'blocks', open: true },
  { source: 't:method-val', target: 'p:sentrix', kind: 'mentions' },
  { source: 't:impurity', target: 'p:sentrix', kind: 'mentions' },

  // the rest of the team
  { source: 'u:tomas', target: 't:sap-sync', kind: 'assigned' },
  { source: 'u:rachel', target: 't:cover-letter', kind: 'assigned' },
  { source: 't:cover-letter', target: 'p:sentrix', kind: 'mentions' },
  { source: 't:sap-sync', target: 'p:sentrix', kind: 'mentions' },
  { source: 'u:nicolas', target: 'p:sentrix', kind: 'participates' },
  { source: 'u:sally', target: 'p:sentrix', kind: 'participates' },
  { source: 'u:rachel', target: 'th:qa-window', kind: 'participates' },
  { source: 'u:tomas', target: 'th:qa-window', kind: 'participates' },
  { source: 'd:module3', target: 'p:sentrix', kind: 'mentions' },

  // the unbooked deadline
  { source: 'u:sally', target: 't:train-deck', kind: 'assigned' },
  { source: 't:train-deck', target: 'd:safety-due', kind: 'blocks', open: true },
  { source: 'd:safety-due', target: 'p:safety', kind: 'mentions' },

  // Baton watches everything it has acted on
  { source: 'u:baton', target: 'p:sentrix', kind: 'participates' },
  { source: 'u:baton', target: 'p:safety', kind: 'participates' },
];

export const RISKS: Risk[] = [
  {
    id: 'r:open-loop-1',
    type: 'open_loop_ask',
    severity: 92,
    title: 'Nicolas asked Sally for Module 3 sign-off 6 days ago. No reply.',
    detail:
      'The ask sits in a mail thread with four other recipients, so nobody reads it as theirs. The filing deadline is in 2 days and this sign-off blocks it.',
    people: ['Nicolas Bouvier', 'Sally Ahmed'],
    nodes: ['u:nicolas', 'u:sally', 'th:sentrix-ask', 'd:module3'],
    project: 'Sentrix filing',
    ageDays: 6,
    dueInDays: 2,
    because: 'open_loop_ask · unanswered 6 business days > 3, and deadline within 2 days < 2',
    impact: { days: 42, basis: 'the filing slips to the next review cycle: 6 working days across the 7 people on the critical path' },
    action: {
      kind: 'mail',
      label: 'Send the nudge',
      summary: 'Reply in the existing thread, addressed to Sally only, with the deadline stated.',
      app: 'Mail',
      to: ['sally@aldermere.ambi'],
      draft:
        'Hi Sally, quick one on Module 3. Nicolas asked for your sign-off on 6 September and I do not think it reached you as an action, the thread had five people on it. The filing is on 14 September, so this is the last working day it can move. Is there anything blocking the sign-off I can clear from here? Baton',
    },
    status: 'open',
  },
  {
    id: 'r:stalled-1',
    type: 'stalled_task',
    severity: 83,
    title: 'Reconcile CMC batch records has not moved in 8 days, and it is due in 3.',
    detail:
      'Priya is the sole assignee. The task blocks the Module 3 filing directly, and no comment, status change or attachment has landed on it since 4 September.',
    people: ['Priya Raman'],
    nodes: ['u:priya', 't:cmc-batch', 'd:module3'],
    project: 'Sentrix filing',
    ageDays: 8,
    dueInDays: 3,
    because: 'stalled_task · no update 8 days > 5, and due within 3 days <= 3',
    impact: { days: 12, basis: '3 days of re-validation plus 9 days of the two reviewers waiting on it' },
    action: {
      kind: 'task_comment',
      label: 'Post the check-in',
      summary: 'Comment on the task, set a 24-hour checkpoint and copy Nicolas as second owner.',
      app: 'Tasks',
      patch: { 'second owner': 'Nicolas Bouvier', checkpoint: 'tomorrow 09:00' },
      draft:
        'Flagging this one: no movement since 4 September and it blocks the 14 September filing. I have added Nicolas as a second owner so it is not on one person, and set a checkpoint for 09:00 tomorrow. Priya, if the hold-up is the missing batch 22-041 certificate, say so here and I will chase it. Baton',
    },
    status: 'open',
  },
  {
    id: 'r:spof-1',
    type: 'spof',
    severity: 78,
    title: 'Priya is the only owner of 4 stalled items on the critical path.',
    detail:
      'Four of the five tasks gating the submission sit with one person, and her betweenness in the workspace graph is in the 96th percentile. If she is out for a day the filing stops.',
    people: ['Priya Raman', 'Tomas Lind'],
    nodes: ['u:priya', 't:stability', 't:method-val', 't:impurity', 'u:tomas'],
    project: 'Sentrix filing',
    because: 'spof · 4 sole-owned critical items > 3, betweenness 0.96 > 0.90',
    impact: { days: 20, basis: 'one week of Priya unavailable stalls 4 critical items across 5 people' },
    action: {
      kind: 'task_patch',
      label: 'Redistribute one task',
      summary: 'Reassign Stability data tables to Tomas, who has capacity and the prior context.',
      app: 'Tasks',
      patch: { from: 'Priya Raman', to: 'Tomas Lind', task: 'Stability data tables' },
      draft:
        'Tomas, moving Stability data tables to you. You built the same tables for the Q2 filing so the format is yours already, and Priya is carrying four of the five critical items. Due 13 September. Shout if that does not work and I will put it back. Baton',
    },
    status: 'open',
  },
  {
    id: 'r:deadline-1',
    type: 'unbooked_deadline',
    severity: 61,
    title: 'The safety-training deadline is in 3 days with nothing booked.',
    detail:
      'A site-wide commitment with an owner and a deck, but no calendar hold for anyone who has to attend. Nothing in the workspace will remind the team it exists.',
    people: ['Sally Ahmed', 'Rachel Foster'],
    nodes: ['u:sally', 't:train-deck', 'd:safety-due'],
    project: 'Safety training',
    dueInDays: 3,
    because: 'deadline · require_calendar_hold true, none found, and due within 3 days',
    impact: { days: 6, basis: 're-booking a site-wide session at short notice, across 5 attendees' },
    action: {
      kind: 'calendar',
      label: 'Book the hold',
      summary: 'Create a 45-minute hold on Friday 14:00, the only slot all five attendees share.',
      app: 'Calendar',
      patch: { when: 'Fri 14:00 - 14:45', attendees: '5', title: 'Annual safety training' },
    },
    status: 'open',
  },
  {
    id: 'r:stalled-2',
    type: 'stalled_task',
    severity: 44,
    title: 'Align SAP with Module 5 has been quiet for 6 days.',
    detail:
      'Not on the critical path and not yet overdue, so this is a watch rather than an alarm. Surfaced because the same owner has a deliverable the day after.',
    people: ['Tomas Lind'],
    nodes: ['u:tomas', 't:sap-sync'],
    project: 'Sentrix filing',
    ageDays: 6,
    dueInDays: 9,
    because: 'stalled_task · no update 6 days > 5, but due in 9 days so not escalated',
    impact: { days: 3, basis: 'a day of rework plus two days of review time' },
    action: {
      kind: 'chat',
      label: 'Ask in chat',
      summary: 'One line in the existing QA review window thread, no new thread, no email.',
      app: 'Chat',
      draft:
        'Tomas, is Align SAP with Module 5 still on for the 21st? No movement for 6 days and you have the stability tables landing the day before. Baton',
    },
    status: 'open',
  },
];

/** The risk the live webhook creates on camera, at the 0:50 mark of the video. */
export const INCOMING_RISK: Risk = {
  id: 'r:open-loop-2',
  type: 'open_loop_ask',
  severity: 98,
  title: 'The agency just asked for the dissolution dataset. Nobody owns it.',
  detail:
    'A mail from the agency landed 4 seconds ago requesting the comparative dissolution dataset within 48 hours. It names no owner, and the person who holds that data is the same person already carrying four stalled items.',
  people: ['Priya Raman', 'Nicolas Bouvier'],
  nodes: ['u:priya', 'th:sentrix-ask', 'd:module3', 'p:sentrix'],
  project: 'Sentrix filing',
  ageDays: 0,
  dueInDays: 2,
  unowned: true,
  because: 'open_loop_ask · inbound request with no assignee, deadline within 2 days < 2',
  impact: { days: 35, basis: 'a missed 48-hour agency request restarts the clock on the module: 5 days across 7 people' },
  action: {
    kind: 'task_patch',
    label: 'Create and assign it',
    summary: 'Open a task owned by Nicolas, due in 24 hours, linked to the agency thread.',
    app: 'Tasks',
    patch: { owner: 'Nicolas Bouvier', due: 'tomorrow 17:00', links: 'agency thread' },
    draft:
      'Nicolas, the agency asked for the comparative dissolution dataset with a 48-hour clock. I have opened it as a task on you rather than Priya, who is already sole owner of four critical items. The 22-041 and 22-044 runs are the ones they will want. Baton',
  },
  status: 'open',
};

export const AUDIT: AuditEntry[] = [
  {
    id: 'a:4',
    at: '2026-09-12T08:12:00Z',
    verb: 'Chased a missing attachment',
    detail: 'Replied in "Batch 22-041 CoA" asking the supplier for the certificate. Priya copied.',
    app: 'Mail',
    href: '#',
  },
  {
    id: 'a:3',
    at: '2026-09-11T16:40:00Z',
    verb: 'Booked a review slot',
    detail: 'Created "Module 3 pre-read" Thu 11:00 for Nicolas, Sally and Rachel.',
    app: 'Calendar',
    href: '#',
  },
  {
    id: 'a:2',
    at: '2026-09-11T09:05:00Z',
    verb: 'Set a second owner',
    detail: 'Added Rachel to "Draft cover letter" after 4 days of no movement.',
    app: 'Tasks',
    href: '#',
  },
  {
    id: 'a:1',
    at: '2026-09-10T14:22:00Z',
    verb: 'Opened the audit sheet',
    detail: 'Created "Baton — action log" in the workspace. Every row below is written there too.',
    app: 'Sheets',
    href: '#',
  },
];

/**
 * Who is looking. Baton is scoped to one workstream and its lead, because
 * every intervention it proposes needs someone with the standing to send it.
 * A director switches between the teams they own; nobody gets a view of a
 * whole company, because a graph of a whole company is unreadable and a
 * nudge from four levels up is not a nudge.
 */
export const SCOPE: Scope = {
  org: 'Aldermere Bio',
  team: 'Regulatory affairs',
  lead: 'Rachel Foster',
  headcount: 8,
  siblings: [
    { id: 'reg', team: 'Regulatory affairs', open: 5, health: 52 },
    { id: 'cmc', team: 'CMC / quality', open: 3, health: 71 },
    { id: 'clin', team: 'Clinical operations', open: 2, health: 84 },
  ],
};

export const RULES: Rules = {
  open_loop_ask: { unanswered_business_days: 3, escalate_if_deadline_within_days: 2 },
  stalled_task: { no_update_days: 5, at_risk_if_due_within_days: 3 },
  deadline: { require_calendar_hold: true, warn_within_days: 3 },
  spof: { max_sole_critical_items: 3, betweenness_percentile: 0.9 },
  severity_weights: { deadline_proximity: 0.5, seniority: 0.2, thread_age: 0.3 },
  cost_model: { blended_day_rate_gbp: 520 },
};

export function mockState(): WorkspaceState {
  return {
    generatedAt: new Date().toISOString(),
    workspace: 'aldermere.ambi',
    scope: SCOPE,
    health: 61,
    connected: false,
    graph: { nodes: NODES.map((n) => ({ ...n })), edges: EDGES.map((e) => ({ ...e })) },
    risks: RISKS.map((r) => ({ ...r })),
    audit: AUDIT.map((a) => ({ ...a })),
    rules: RULES,
  };
}
