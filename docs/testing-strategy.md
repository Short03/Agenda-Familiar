# Testing strategy

The goal is confidence that the two people using the app never lose data and can use
every feature on an iPhone, with a keyboard or with VoiceOver. Each layer catches what
the layer below cannot.

| Layer                   | Tools                                                  | What it covers                                                                                                                                                                                                            | Runs                     |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Unit                    | Vitest                                                 | Pure logic: date rules, Easter, month grid, task model, backup merge, Zod schemas                                                                                                                                         | `pnpm test` (seconds)    |
| Component / integration | Vitest + Testing Library + fake-indexeddb + vitest-axe | Screens with their real providers and a real (in-memory) database: forms, focus, undo, persistence after remount, ARIA                                                                                                    | `pnpm test`              |
| End-to-end              | Cypress (Chrome) + Testing Library + cypress-axe       | Critical flows on the **production build**: navigation, themes, family dates, tasks across screens, backup file round trip, offline with the real service worker, WCAG 2.2 AA **including color contrast** in both themes | `pnpm test:e2e` (~1 min) |
| Manual                  | Two real iPhones                                       | Install from Safari, Home Screen icon, VoiceOver, share sheet for backups                                                                                                                                                 | Before each release      |

## Rules

- **Query like a person.** Tests find elements by role and accessible name
  (`getByRole('button', { name: 'Agregar tarea' })`), never by CSS class or test id.
  If a test cannot find something by its name, a screen reader user cannot either.
- **Pure logic gets unit tests with edge cases** (leap years, a 5th Monday that does not
  exist, Easter in March and April, year boundaries).
- **The database is real in tests.** fake-indexeddb runs Dexie in memory, and every test
  starts with an empty database (`src/test/setup.ts`).
- **Freeze time, not timers.** Tests fake only `Date` (`vi.useFakeTimers({ toFake: ['Date'] })`,
  `cy.clock(now, ['Date'])`); Dexie, React Hook Form and user-event still need real timers.
- **Component tests run in `StrictMode`** where effects matter, like the app.
- **axe in jsdom skips color contrast** (jsdom does not render pixels). Contrast is
  audited by Cypress in a real browser.
- **E2E isolation:** Cypress does not clear service workers, Cache Storage or IndexedDB,
  so `cypress/support/e2e.ts` wipes them through the Chrome DevTools Protocol before each
  test. Only the PWA spec lets the service worker register, and it runs in a separate
  Cypress run (fresh browser): after other specs, the worker stopped answering
  navigations, which made it flaky. Isolating it beats hiding flakiness with retries.

## What we do not test

- Third-party internals (Dexie, Radix, Workbox): we test our use of them.
- Pixel-perfect visuals: no screenshot diffing for now; themes are checked by axe contrast
  and by eye.
- Real push notifications: not built yet (ADR 0001).

## CI

GitHub Actions (`.github/workflows/ci.yml`): the `check` job (types, lint, format, unit,
build) must pass before the `e2e` job runs. Screenshots of failed E2E tests are uploaded
as an artifact.
