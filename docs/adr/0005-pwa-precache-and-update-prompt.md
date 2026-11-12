# 0005. PWA: precached app shell and an update prompt

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The app is used on two iPhones, installed on the Home Screen (ADR 0001). It must open
without internet, look like a native app, and get new versions without losing what
someone is typing. Installed apps on iOS can stay open for days without a full reload.

## Decision

- **vite-plugin-pwa (Workbox)** generates the service worker and the web manifest.
- **Precache the whole app shell**: HTML, every JavaScript chunk (including lazy pages),
  CSS, icons and the latin font subsets. Client routes (`/tareas`, `/ajustes`) fall back
  to `index.html`, so every page opens offline. Data already lives in IndexedDB.
- **`registerType: 'prompt'`**: a new version downloads in the background and waits.
  A banner says "Hay una versión nueva" and the person chooses "Actualizar". The app also
  checks for updates every hour, because an installed iPhone app may never reload.
- **Lazy routes**: each page is its own chunk, so the first screen downloads less.
- **Icons** are generated from one original SVG (`public/icon.svg`) with
  `@vite-pwa/assets-generator`, including a maskable icon and an Apple touch icon with a
  solid background (iOS does not allow transparency on Home Screen icons).

## Alternatives considered

- **`registerType: 'autoUpdate'`:** simpler, but it reloads the page by itself and could
  wipe a half-written task.
- **Runtime caching only (no precache):** the first offline visit to a page not opened
  before would fail.
- **Hand-written service worker:** full control, but easy to get cache versioning wrong;
  Workbox solves cache names, cleanup and navigation fallback.

## Consequences

**Positive**

- Opens instantly and offline after the first visit; installable on iPhone and Android.
- Updates never interrupt someone in the middle of a form.

**Negative**

- The service worker only runs in production builds; it must be tested with
  `pnpm build && pnpm preview` (or a deployed URL), not `pnpm dev`.
- Service workers need HTTPS (or localhost). Testing on a real iPhone needs a deploy.
- People who never tap "Actualizar" keep an old version until all tabs/apps are closed.
- Precaching all chunks downloads every page once, even ones never opened (~0.7 MB).

**When to revisit**

- If the app grows large enough that precaching everything is too heavy on mobile data.
- When push notifications arrive (they need the same service worker plus a server).
