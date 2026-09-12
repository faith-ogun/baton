---
title: "The Ambiguous workspace setup"
type: decision
status: active
tags: [type/decision, topic/ambiguous]
last-reviewed: 2026-09-12
---

# The Ambiguous workspace setup

## The decision

The Ambiguous workspace is **the fictional company**, not the product. So:

| Field | Value |
|---|---|
| Workspace name | `Aldermere Bio` |
| Workspace URL | `aldermere` → **`aldermere.ambi.cc`** |
| Faith's workspace email | `faith.ogundimu` (as pre-filled) → `faith.ogundimu@aldermere.ambi.cc` |
| Signup account | `faithogun12@gmail.com` (personal, for auth only) |

## Why the workspace is the company and not "Baton"

This is the distinction that is easy to get wrong on the signup screen, and getting it wrong makes
the demo incoherent.

A workspace is **a place a team works**. Baton is **a member of that place**. Naming the workspace
"Baton" would be naming an office after one of its employees, and worse, it would mean the graph on
screen was a graph of Baton's own workspace rather than a customer's, which quietly destroys the
premise: Baton is supposed to be watching somebody else's work.

So the workspace is Aldermere Bio, the fictional biotech from [[What Baton is]], and Baton is
provisioned into it as a coworker afterwards. The dashboard already shows `aldermere.ambi.cc` in the
status bar, so the real workspace and the seeded one now agree.

## Who exists in the workspace

| Member | Address | Role |
|---|---|---|
| Faith Ogundimu | `faith.ogundimu@aldermere.ambi.cc` | the real human account, the owner |
| **Baton** | assigned at provisioning | the agent. Its own identity, its own permissions |
| Nicolas Bouvier | `nicolas.bouvier@aldermere.ambi.cc` | regulatory lead. Sends the unanswered ask |
| Sally Ahmed | `sally.ahmed@aldermere.ambi.cc` | clinical ops. Never replies to it |
| Priya Raman | `priya.raman@aldermere.ambi.cc` | CMC. The single point of failure |
| Tomas Lind | `tomas.lind@aldermere.ambi.cc` | biostatistics. Has capacity, takes the redistributed task |
| Rachel Foster | `rachel.foster@aldermere.ambi.cc` | the team lead, whose board this is |

> [!info] Why the teammates are invented and the lead need not be
> The invented names carry the *failures*: somebody did not reply for six days, somebody is sitting
> on four stalled items. Attaching a real person to that is a reputational claim, so those stay
> fictional. The **lead** only ever approves, so there is no such problem: if it is simpler on
> camera, Faith can be the lead herself and Rachel Foster can be dropped. That is a one-line change
> in `web/src/app/mock.ts` plus the journey copy in `web/src/landing/Who.tsx`.

## Provisioning Baton, after the workspace exists

```bash
npm install -g ambiguous
npx ambiguous auth signup --name "Baton" --human-email faithogun12@gmail.com
npx ambiguous auth status          # confirm before anything else
```

That writes the API key to `./.ambi/config.json`, which is **already gitignored**. Then register the
webhooks and point them at the backend, and set `VITE_API_BASE` so the dashboard flips from
`seeded workspace` to `webhooks live`.

## What must be true before recording

- [ ] the four teammates exist, with the planted situations seeded (see [[What Baton is]])
- [ ] Baton is a member and `auth status` is clean
- [ ] webhooks registered and firing
- [ ] the status bar reads `webhooks live`, not `seeded workspace`. **Do not narrate a live
      workspace over the seeded state.** See [[Demo facts]]

## Related

- [[What Baton is]] · [[System architecture]] · [[Demo facts]] · [[MOC-product]]
