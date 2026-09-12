# How to work in this vault

You are working inside the markdown knowledge vault for **Baton**. This file is the procedural
memory: it tells you how to behave here. Read it before doing anything and follow it exactly,
because consistency is the only thing that makes this vault navigable later.

- **Owner:** Faith Ogundimu
- **The work:** Baton, an AI coworker that lives in a team's Ambiguous workspace, holds the graph of
  who owes whom what, and hands off the work about to fall through the cracks before it does. Built
  for the "Agents, Everywhere" hackathon (AI Tinkerers x OpenAI), 12 September 2026.
- **Today's job, usually:** record a decision, log a build iteration, or draft a deliverable.

British English. **No em dashes anywhere** (use commas, semicolons or a plain hyphen).

## The rooms

| Folder | What goes in it |
|---|---|
| `00_Inbox/` | anything unsorted. cleared regularly, never permanent |
| `10_Product/` | what Baton is and why it wins: identity, scope, naming, the wow |
| `20_Architecture/` | how it is built: the graph, the registry, the split, the front end |
| `30_Domain/` | the problem and the field: dropped work, competitors, the cost model |
| `40_Deliverables/` | anything with an audience: README, submission text, demo script, facts |
| `50_Hackathon/` | the event itself: rules, timings, judging criteria |
| `90_Log/` | one note per build iteration, `YYYY-MM-DD-iter-NNN-slug.md`. append-only |
| `99_Templates/` | the shape of each note type. copy, do not edit, unless asked |
| `_meta/` | how the vault works, and the Maps of Content |
| `people/` | one note per human |

## Filing rules

When you create a note, all of the following are required.

1. **Pick the room by what the note IS, not what it is about.** A note about how the risk engine
   scores goes in `20_Architecture/` because it is architecture. A note about a rival product goes
   in `30_Domain/` because it is domain, even though it mentions architecture.
2. **Give it a real, human title.** Never a bare date, never a code. `The scoping decision` is a
   title. `decision_03.md` is not. Renaming later is free because links follow.
3. **Write the frontmatter**, exactly these fields, in this order:
   ```yaml
   ---
   title: "The same as the H1 below"
   type: decision         # decision|architecture|competitor|deliverable|reference|log|person|moc
   status: current        # current|active|done|superseded|archived
   tags: [type/decision, topic/whatever]
   last-reviewed: YYYY-MM-DD
   ---
   ```
4. **Open with an H1 that matches the title.**
5. **End with a `## Related` block** containing at least two `[[wikilinks]]`. This is not
   decoration. A note with no links is invisible to the graph and will be lost. If you genuinely
   cannot think of two, link the room's MOC and say why in one line.
6. **Add the note to the relevant MOC** in the room if a future reader would need it signposted.
7. **Record it in the current log note** in `90_Log/`, one line, so the episodic record is complete.

## Tags

Tags are facets, not folders. Three namespaces only:

- `type/` mirrors the frontmatter `type`
- `status/` mirrors the frontmatter `status`
- `topic/` is the subject. lowercase, hyphenated, reuse existing ones before inventing new ones

Before inventing a `topic/` tag, grep the vault for something close. Tag sprawl is the most common
way a vault stops being searchable.

## Links

- Links carry the meaning; folders only carry tidiness.
- Link the specific note, not the folder.
- A link to a note that does not exist yet is fine and often useful. It marks the gap.
- When you link a person, link `people/Their Name`, and create the note if it is missing.

## Writing style

- Plain and factual. No filler, no salesmanship, no "it is worth noting that".
- Say what is known, what is uncertain, and what is not known, and mark which is which.
- **Never invent a citation, a number, a date or a result.** If you do not have it, write
  `TODO: confirm` and say so in your reply. A blank is recoverable; a fabricated fact is not.
- Record the **reasoning**, not just the outcome. A decision note whose "why" is missing is a note
  that gets reversed by accident in three weeks.
- Keep the owner's voice. This is their notebook, not your essay.

## The loop, and where it stops

Multi-step work follows: trigger, retrieve, work, file and link, then **stop and hand back**.

You are not the approval node. Draft, file, and say what you did and what you were unsure about. Do
not delete notes, do not rewrite an existing note wholesale, and do not reorganise folders unless
explicitly asked. Additive by default. A decision that changes sets the old note's `status` to
`superseded` and links forward; it does not overwrite it.

## Build logs

One note per working session in `90_Log/`, named `YYYY-MM-DD-iter-NNN-slug.md`. It records what
changed, what broke, and what was learned, including the things that did not work. A log that only
lists successes is useless for picking the project back up.
