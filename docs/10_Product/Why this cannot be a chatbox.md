---
title: "Why this cannot be a chatbox"
type: reference
status: current
tags: [type/reference, topic/judging]
last-reviewed: 2026-09-12
---

# Why this cannot be a chatbox

The rubric rewards a pattern that is impossible in a chat window. This is the argument, in the form
it should be said on camera.

## The claim

> A chatbot answers the question you thought to ask. Every risk Baton surfaces is one you did not
> think to ask about, and three of the four are invisible from inside any single app.

## The three supporting facts

1. **The open loop needs two apps at once.** Mail knows the ask went unanswered. The calendar knows
   the deadline is in two days. Neither alone makes it urgent; the conjunction does.
2. **The single point of failure is not in any record.** It is a property of the *shape* of the
   graph: sole ownership counted across every task, plus betweenness across the whole workspace.
   There is no document you could open that contains it.
3. **You cannot type your way to a risk you cannot see.** The whole category of value here is
   unprompted detection. A prompt box requires you to already suspect the thing.

## And the acting half

Detection is only half of it. Baton **writes back** into Mail, Chat, Tasks, Calendar and Sheets
under its own identity. A chat window can tell you to send a nudge; it cannot be a member of your
workspace that sends it and logs it.

## Where it appears in the product

The site has a dedicated navy band making this argument, with a six-app grid showing what Baton
**reads** and what it **acts** on for each surface (`web/src/landing/Claim.tsx`). The grid is the
proof that the claim is structural rather than rhetorical.

## Related

- [[What Baton is]] · [[Spine]] · [[MOC-product]]
