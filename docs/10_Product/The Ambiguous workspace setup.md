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
| Frank Bouvier | `frank.bouvier@aldermere.ambi.cc` | regulatory lead. Sends the unanswered ask |
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

## Provisioning Baton, and the two-workspace trap

```bash
npm install -g ambiguous
npx ambiguous auth signup --name "Baton" --human-email faithogun12@gmail.com
```

> [!warning] The CLI signup creates its OWN workspace, and it is not the one you want
> `auth signup` has nowhere to put a new agent, so it scaffolds a workspace around it. Ours came
> out as **`Baton's Workspace` / `baton-workspace`**, with the agent at
> `baton@baton-workspace.ambi.cc`. That is a holding pen, not the destination, which is why the
> claim page then offers **Claim** or **Merge**.
>
> Leaving it there would name the workspace after the agent, and the graph on screen would be a
> graph of *Baton's own* workspace rather than a customer's. That quietly destroys the premise, for
> the same reason set out at the top of this note.
>
> **The fix was Merge**, into the `aldermere` workspace created through the web flow. Baton then
> lives at `baton@aldermere.ambi.cc` as a member of Aldermere Bio, which is what the dashboard
> status bar already claimed.

Useful to know, established by querying the API directly rather than guessing:

| Endpoint | What it told us |
|---|---|
| `GET /api/users/me` | the agent's identity, role, and `can_provision_coworkers` |
| `GET /api/workspaces` | every workspace the caller can see. The agent token sees only its own, **not** ones owned by the human's personal account, which is what made the situation confusing |
| `GET /api/workspaces/check-slug?slug=` | whether a URL is free. `aldermere` was taken (by us), `aldermere-bio` was free |
| `POST /api/auth/merge-workspace` | takes `token` + `target_workspace_id`, moves the agent and its content across |
| `POST /api/auth/claim-workspace` | also accepts `workspace_name` and `workspace_slug`, so a claim can rename in one step |
| `PATCH /api/workspace` | renames the active workspace, but the **slug is not in the body**, so a wrong slug is not fixable this way |

After the merge, confirm before doing anything else:

```bash
npx ambiguous auth status
```

The API key lives in `./.ambi/config.json`, which is **already gitignored**. The merge may reissue
it, so re-read it rather than caching the old value.

> [!warning] The verification email gates the rest of the setup
> `can_provision_coworkers` came back **false**, and the CLI said as much: the human has to click
> the link mailed to `faithogun12@gmail.com` before invites, billing or provisioning more agents
> will work. So the four teammates cannot be added until that is done.

Then register the webhooks against the backend and set `VITE_API_BASE`, and the dashboard flips
from `seeded workspace` to `webhooks live`.

## What must be true before recording

- [ ] the four teammates exist, with the planted situations seeded (see [[What Baton is]])
- [ ] Baton is a member and `auth status` is clean
- [ ] webhooks registered and firing
- [ ] the status bar reads `webhooks live`, not `seeded workspace`. **Do not narrate a live
      workspace over the seeded state.** See [[Demo facts]]

## Related

- [[What Baton is]] · [[System architecture]] · [[Demo facts]] · [[MOC-product]]
