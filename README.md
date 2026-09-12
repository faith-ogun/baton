# Baton

**Never drop the baton.**

The AI coworker that catches the work about to fall through the cracks, and hands it off
before it does. Baton lives inside your team's Ambiguous workspace, maps the whole graph of
who owes whom what, spots the stalled ask, the overloaded person, the unbooked deadline and
the single point of failure, then rescues each one with a governed, one-click hand-off across
your apps. Nothing auto-sends; every action is human-approved and logged.

Its value cannot exist in a chatbox: it only works because it sees and acts across Mail, Chat,
Tasks, Calendar and CRM at once.

Built for the "Agents, Everywhere: Bots, Channels & More" global hackathon
(AI Tinkerers x OpenAI), 12 September 2026. Target: Best Use of Ambiguous AI.

## Stack
Next.js + Tailwind + Framer Motion + react-force-graph-2d (frontend) · FastAPI + NetworkX +
OpenAI Agents SDK (backend) · Ambiguous AI (workspace: MCP / CLI / REST + webhooks) ·
Google Cloud Run (deploy).

See `CLAUDE.md` for the full build spec.
