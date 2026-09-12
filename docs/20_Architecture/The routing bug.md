---
title: "The routing bug"
type: architecture
status: done
tags: [type/architecture, topic/frontend]
last-reviewed: 2026-09-12
---

# The routing bug

Kept as its own note because it is the cleanest example in this build of three symptoms with one
cause, and of why "it looks like three bugs" is usually wrong.

## The symptoms

Faith reported three separate faults:

1. `/app` "goes nowhere"
2. the hero's *See it catch one* button does nothing, but *What it catches* works
3. clicking the logo inside the workspace does not return to the homepage

## The cause

One bug. `usePath` kept the current path in **each hook instance's own `useState`**:

```tsx
export function usePath(): [string, (to: string) => void] {
  const [path, setPath] = useState(() => window.location.pathname);
  // ...
}
```

`App` called it, and so did every `Link`. When a `Link` called its own `go()`, it ran
`history.pushState` and then updated **only its own copy** of the path. And `pushState` fires no
`popstate` event, so the component actually rendering the route never heard about it.

The URL in the address bar changed. The screen did not. Which is indistinguishable, from the
outside, from a dead link.

`What it catches` worked because it is a plain `#dropped` anchor and never touched the router at
all. That asymmetry was the clue.

## The fix

One module-level store, read through `useSyncExternalStore`, so every caller shares a subscription:

```tsx
const listeners = new Set<() => void>();
let current = window.location.pathname;

function sync() {
  current = window.location.pathname;
  for (const l of listeners) l();
}
window.addEventListener('popstate', sync);

export function navigate(to: string) {
  if (to === window.location.pathname) return;
  window.history.pushState({}, '', to);
  sync();
  window.scrollTo(0, 0);
}
```

## What was learned

Per-component state for anything that is genuinely **global to the document** is a bug waiting for a
second reader. The tell was that one navigation path worked and two did not: shared state failing
produces *partial* symptoms, which is exactly what makes it read as several unrelated faults.

## A deployment note that falls out of this

`/app` is a client route. Any static host needs unknown paths rewritten to `index.html`. The Vite
dev server and `vite preview` already do; Cloud Run or Firebase Hosting will need the rewrite
configured.

## Related

- [[System architecture]] · [[MOC-architecture]]
