import type { WorkspaceState } from '../types';
import { money } from './api';

/**
 * The grounded answerer behind the Ask panel.
 *
 * Three properties matter more than breadth of coverage, and all three are
 * structural rather than promises made in a prompt:
 *
 *  1. **It is computed, not generated.** Every answer below is derived from the
 *     WorkspaceState by arithmetic and lookups. That is why each one can cite
 *     the exact nodes and risks behind it, and why the same question always
 *     returns the same answer. A generated paragraph can do neither.
 *  2. **It is read-only by construction.** Nothing in this module can reach the
 *     executor. There is no code path from a question to an action, so "it
 *     cannot act" is not a rule it follows, it is a thing it is unable to do.
 *  3. **It refuses outside its scope, and says why.** Baton reads work items
 *     and hand-offs for one team. Asked about salaries, another team, or
 *     anything the graph does not contain, it says so rather than guessing.
 *
 * When the backend lands, the model's job here is to map a question onto one of
 * these intents and to phrase the answer. The facts stay computed. That split
 * is the same one the rest of the product uses.
 */

export type AnswerKind = 'answer' | 'empty' | 'refused' | 'cannot-act';

export interface Cite {
  /** A node id, so clicking the chip can light it up in the graph. */
  id: string;
  label: string;
}

export interface Answer {
  kind: AnswerKind;
  /** The answer in plain English. */
  text: string;
  /** What it was computed from. This is the grounding, shown in the UI. */
  cites: Cite[];
  /** How it was derived, in the registry's own terms. */
  basis?: string;
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

/** Turn node ids into citation chips with their real labels. */
function citeNodes(state: WorkspaceState, ids: string[]): Cite[] {
  const byId = new Map(state.graph.nodes.map((n) => [n.id, n]));
  return ids.flatMap((id) => {
    const n = byId.get(id);
    return n ? [{ id: n.id, label: n.label }] : [];
  });
}

export function answer(question: string, state: WorkspaceState): Answer {
  const q = question.toLowerCase().trim();
  if (!q) return { kind: 'empty', text: '', cites: [] };

  const open = state.risks.filter((r) => r.status === 'open' || r.status === 'working');
  const rate = state.rules.cost_model.blended_day_rate_gbp;
  const people = state.graph.nodes.filter((n) => n.kind === 'person' && n.id !== 'u:baton');

  /* ── things it will not do, first ──────────────────────── */

  // Asked to act. This is the governance guarantee, made answerable.
  if (has(q, 'send ', 'email ', 'nudge ', 'remind ', 'reassign', 'book ', 'chase ', 'approve ', 'do it', 'fix it')) {
    return {
      kind: 'cannot-act',
      text: 'I cannot. This panel only reads. Every action Baton takes is a draft on a card in the queue, and it happens when you approve it, never when you ask me to. That is not a setting, there is no path from here to the executor.',
      cites: [],
      basis: 'read-only by construction',
    };
  }

  // Outside what Baton is allowed to look at.
  if (has(q, 'salary', 'salaries', 'pay ', 'paid', 'revenue', 'profit', 'headcount cost', 'performance review', 'appraisal', 'fire ', 'promote', 'hr ')) {
    return {
      kind: 'refused',
      text: 'Out of scope. Baton reads work items and hand-offs: tasks, threads, dates and who owns what. It has no access to pay, performance or personnel records, and its permissions are the team’s permissions, so it could not reach them even if asked.',
      cites: [],
      basis: 'scope · work items and hand-offs only',
    };
  }

  // Another team. The scoping argument, enforced.
  if (has(q, 'other team', 'another team', 'clinical ops', 'cmc team', 'whole company', 'everyone at', 'across the company', 'other workstream')) {
    const others = state.scope.siblings.slice(1).map((t) => t.team).join(' and ');
    return {
      kind: 'refused',
      text: `I only see ${state.scope.team}. ${state.scope.lead} owns ${others} as well, and those are separate boards with their own health, because a fix is only useful if whoever approves it has the standing to send it. Switch team in the header to look at one of those.`,
      cites: [],
      basis: `scope · ${state.scope.org} / ${state.scope.team}`,
    };
  }

  /* ── what it can answer, from the graph ────────────────── */

  // The money.
  if (has(q, 'how much', 'cost', 'worth', 'money', '£', 'risk right now', 'exposure')) {
    const days = open.reduce((a, r) => a + r.impact.days, 0);
    const worst = [...open].sort((a, b) => b.impact.days - a.impact.days)[0];
    return {
      kind: 'answer',
      text: `${money(days * rate)} across ${open.length} open risks, which is ${days} person-days at the ${money(rate)} blended day rate in the registry. The largest single one is ${money((worst?.impact.days ?? 0) * rate)}: ${worst?.title.toLowerCase()}`,
      cites: worst ? citeNodes(state, worst.nodes) : [],
      basis: `${days} person-days × ${money(rate)} · cost_model.blended_day_rate_gbp`,
    };
  }

  // Who is the single point of failure.
  if (has(q, 'single point', 'spof', 'bus factor', 'only person', 'overloaded', 'carrying too much', 'too much on')) {
    const spof = open.find((r) => r.type === 'spof');
    const sole = people.find((p) => p.sole);
    if (!spof || !sole) {
      return { kind: 'answer', text: 'Nobody is a single point of failure on this board right now.', cites: [] };
    }
    return {
      kind: 'answer',
      text: `${sole.label}. ${spof.detail} If she is out for a day, ${money(spof.impact.days * rate)} of work stops.`,
      cites: citeNodes(state, spof.nodes),
      basis: spof.because,
    };
  }

  // Who has not replied / open loops.
  if (has(q, 'not replied', "hasn't replied", 'no reply', 'unanswered', 'waiting on', 'open loop', 'ignoring', 'ghosted')) {
    const loops = open.filter((r) => r.type === 'open_loop_ask');
    if (!loops.length) return { kind: 'answer', text: 'No asks are sitting unanswered past the threshold.', cites: [] };
    return {
      kind: 'answer',
      text: loops
        .map((r) => `${r.title} ${money(r.impact.days * rate)} at stake.`)
        .join(' '),
      cites: citeNodes(state, loops.flatMap((r) => r.nodes)),
      basis: `open_loop_ask · unanswered > ${state.rules.open_loop_ask.unanswered_business_days} business days`,
    };
  }

  // What is blocking the filing / the deadline.
  if (has(q, 'blocking', 'blocked', 'in the way', 'holding up', 'stopping')) {
    const blockers = state.graph.edges.filter((e) => e.kind === 'blocks' && e.open);
    const ids = [...new Set(blockers.map((e) => e.source))];
    if (!ids.length) return { kind: 'answer', text: 'Nothing is blocking a deadline on this board.', cites: [] };
    const named = citeNodes(state, ids);
    return {
      kind: 'answer',
      text: `${named.length} things, and they all land on the same date: ${named.map((c) => c.label).join(', ')}. Each has an open blocking edge into a deadline node, which is what puts them on the critical path rather than just being late.`,
      cites: named,
      basis: `${blockers.length} open edges of kind "blocks"`,
    };
  }

  // What does a named person own.
  const named = people.find((p) => {
    const first = p.label.split(' ')[0]!.toLowerCase();
    const last = p.label.split(' ').slice(-1)[0]!.toLowerCase();
    return q.includes(first) || q.includes(last);
  });
  if (named) {
    const owned = state.graph.edges
      .filter((e) => e.source === named.id && (e.kind === 'assigned' || e.kind === 'asks'))
      .map((e) => e.target);
    const theirRisks = open.filter((r) => r.people.includes(named.label));
    const cost = theirRisks.reduce((a, r) => a + r.impact.days, 0) * rate;
    const items = citeNodes(state, owned);
    return {
      kind: 'answer',
      text: items.length
        ? `${named.label} is ${named.meta?.toLowerCase() ?? 'on the team'} and holds ${items.length} item${items.length === 1 ? '' : 's'}: ${items.map((c) => c.label).join(', ')}. ${theirRisks.length ? `${theirRisks.length} of the open risks name ${named.label.split(' ')[0]}, worth ${money(cost)}.` : `No open risk names ${named.label.split(' ')[0]}.`}`
        : `${named.label} is ${named.meta?.toLowerCase() ?? 'on the team'} and owns nothing on this board.`,
      cites: [{ id: named.id, label: named.label }, ...items],
      basis: `graph · outgoing "assigned" and "asks" edges from ${named.id}`,
    };
  }

  // What is due / at risk soonest.
  if (has(q, 'due', 'deadline', 'this week', 'soonest', 'first', 'urgent', 'worst')) {
    const soon = [...open].filter((r) => r.dueInDays != null).sort((a, b) => a.dueInDays! - b.dueInDays!);
    const top = soon[0];
    if (!top) return { kind: 'answer', text: 'Nothing on this board has a date attached.', cites: [] };
    return {
      kind: 'answer',
      text: `${top.title} It is due in ${top.dueInDays} day${top.dueInDays === 1 ? '' : 's'} and scores ${top.severity}, the highest on the board. ${soon.length - 1} other risk${soon.length - 1 === 1 ? '' : 's'} carry a date.`,
      cites: citeNodes(state, top.nodes),
      basis: top.because,
    };
  }

  // What has Baton already done.
  if (has(q, 'what have you done', 'what did you do', 'already done', 'audit', 'history', 'so far', 'actions')) {
    const last = state.audit.slice(0, 3);
    return {
      kind: 'answer',
      text: `${state.audit.length} actions, all approved by a person first. Most recently: ${last.map((a) => a.verb.toLowerCase()).join(', ')}. Every one is a row here and a row in the audit sheet inside the workspace, which is also where I read my own history so I never chase the same thing twice.`,
      cites: [],
      basis: 'audit trail · written to Sheets',
    };
  }

  // Health.
  if (has(q, 'health', 'how are we', 'how bad', 'overall', 'state of')) {
    return {
      kind: 'answer',
      text: `${state.health} out of 100, with ${open.length} risks open and ${money(open.reduce((a, r) => a + r.impact.days, 0) * rate)} at stake. The score is the worst single risk weighted at 0.35 plus the whole queue at 0.045, so clearing any one of them moves it.`,
      cites: [],
      basis: '100 - (worst × 0.35) - (sum × 0.045)',
    };
  }

  // Who is on the team.
  if (has(q, 'who is on', 'who works', 'team members', 'how many people', 'who else')) {
    return {
      kind: 'answer',
      text: `${people.length} people plus me: ${people.map((p) => `${p.label} (${p.meta?.toLowerCase()})`).join(', ')}. ${state.scope.lead} leads.`,
      cites: people.map((p) => ({ id: p.id, label: p.label })),
      basis: `${state.scope.org} / ${state.scope.team}`,
    };
  }

  /* ── it does not know, and says so ─────────────────────── */

  return {
    kind: 'empty',
    text: 'The workspace does not contain an answer to that, and I will not guess. I can tell you what is about to drop and why, what it costs, who owns what, what is blocking a date, and what I have already done.',
    cites: [],
    basis: 'no matching facts in the graph',
  };
}

/** Shown as starting points, and they double as proof of the scope guard. */
export const SUGGESTIONS = [
  'What is blocking the filing?',
  'How much is at risk?',
  'Who is the single point of failure?',
  'What has Priya got on?',
  'Who has not replied?',
  'What have you done so far?',
  'Send Sally a nudge',
  "What are everyone's salaries?",
];
