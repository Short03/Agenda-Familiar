# Agenda familiar

A personal calendar and task manager for the family, with two switchable themes
("Kawaii" and "Aventura"). Built as a hands-on learning project for React, TypeScript,
testing and accessibility.

## Features

- **Calendar:** monthly view (Monday to Sunday), Mexican holidays and commemorative dates,
  family birthdays, toggles per category and per date, tasks with reminders on any day.
- **Tasks:** add/remove, to-do vs. done, Eisenhower priority (important × urgent), tags.
- **Themes:** one button (top left) switches the whole app between themes.
- **Settings:** family and personal dates, JSON backup (share sheet on iPhone), storage protection.
- **Storage:** everything is saved on the device in IndexedDB (Dexie).
- **PWA:** installable on a phone and usable offline.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router · date-fns ·
Dexie (IndexedDB) · React Hook Form + Zod · Radix UI · Vitest + Testing Library + axe ·
oxlint · Prettier · Husky + lint-staged + commitlint

## Getting started

Requires Node 22.12+ and pnpm 11.

```bash
pnpm install
pnpm dev
```

## Scripts

| Script                     | What it does                                    |
| -------------------------- | ----------------------------------------------- |
| `pnpm dev`                 | Start the dev server                            |
| `pnpm build`               | Type-check and build for production             |
| `pnpm typecheck`           | Run the TypeScript compiler                     |
| `pnpm lint`                | Lint with oxlint (warnings fail)                |
| `pnpm format`              | Format with Prettier                            |
| `pnpm test`                | Run unit and component tests once               |
| `pnpm test:watch`          | Run tests in watch mode                         |
| `pnpm check`               | Everything CI runs, except the production build |
| `pnpm preview`             | Serve the production build (service worker on)  |
| `pnpm generate-pwa-assets` | Regenerate the app icons from `public/icon.svg` |

## Project structure

```text
src/
├── app/              # App shell: layout, routes, providers
├── features/
│   ├── calendar/     # Month grid, day details
│   ├── special-days/ # Date rules engine (holidays, birthdays)
│   ├── tasks/        # Task manager
│   └── theme/        # Theme switcher and tokens
├── shared/
│   ├── ui/           # Reusable accessible components
│   └── lib/          # Generic helpers (no React)
├── db/               # Dexie database and schema
└── test/             # Test setup and helpers
docs/adr/             # Architecture Decision Records
```

## Testing

See [docs/testing-strategy.md](docs/testing-strategy.md).

## Offline and install (PWA)

The service worker only exists in production builds: test it with `pnpm build && pnpm preview`
(Chrome DevTools → Application). On iPhone, open the deployed HTTPS site in Safari →
Share → Add to Home Screen.

## Privacy

Family data (names, birthdays) is entered in the app and stored on the device only.
It is never committed to this repository.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) are enforced on every commit,
e.g. `feat(tasks): add eisenhower priority`.
