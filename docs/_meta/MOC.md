---
title: "Master MOC"
type: moc
status: current
tags: [type/moc]
last-reviewed: 2026-09-12
---

# Master MOC

A Map of Content is a hand-curated index. Search finds a note you already know exists; a MOC tells
you what exists at all. Every room gets one, and **a room without a MOC will rot**, because nothing
signposts the notes nobody has opened in six months.

Keep this page short. It points at the room MOCs; the room MOCs point at the notes.

## The rooms

- **Product** — [[MOC-product]]
- **Architecture** — [[MOC-architecture]]
- **Domain** — [[MOC-domain]]
- **Deliverables** — [[MOC-deliverables]]
- **Hackathon** — [[MOC-hackathon]]

## Start here

If you have just opened this vault and know nothing about Baton, read in this order:

1. [[What Baton is]] — one sentence, then the four detectors
2. [[The scoping decision]] — who the user is, and why it is not the CEO
3. [[The deterministic and LLM split]] — the credibility moat
4. [[Demo facts]] — what is invented, derived, and unverified

## How the vault works

- [[VAULT]] — the operating manual
- [[tag-conventions]] — the tag namespaces
- [[callout-conventions]] — the callout types

## Live views

With Dataview installed, these stay current on their own:

```dataview
TABLE type, status, last-reviewed
FROM "10_Product" OR "20_Architecture" OR "30_Domain"
SORT last-reviewed DESC
LIMIT 20
```

Anything still open:

```dataview
TABLE status, last-reviewed
WHERE status = "active"
SORT last-reviewed ASC
```
