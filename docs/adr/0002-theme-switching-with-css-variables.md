# 0002. Theme switching with a data-theme attribute and CSS variables

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The app has two visual themes, "Kawaii" and "Aventura", switched with one button in the
top-left corner. The whole app must change instantly, and the choice must survive a reload.
More themes may be added later.

Each person uses the app on their own iPhone and may prefer a different theme, so the theme
is a per-device preference, not shared data.

If the theme is read after React starts, the browser first paints the default theme and then
switches, which looks like a flash.

## Decision

- The active theme is a `data-theme` attribute on `<html>`
  (`<html data-theme="aventura">`).
- Each theme defines the same set of semantic CSS variables (`--t-bg`, `--t-fg`,
  `--t-accent`, ...) in `src/index.css`. Tailwind maps them to utilities with
  `@theme inline`, so components use `bg-surface` or `text-accent` and never raw colors.
- An inline script in `index.html` reads the saved theme and sets the attribute before
  the first paint.
- The theme is saved in `localStorage`, not IndexedDB, because the inline script needs
  to read it synchronously.
- `src/features/theme/themes.ts` is the typed source of truth (`THEMES`, `isTheme`).
  Values read from storage or the DOM are validated with `isTheme` before use.

## Alternatives considered

- **Tailwind variants per element** (`kawaii:bg-pink-100 aventura:bg-green-900`): every
  component would know every theme, and adding a third theme would mean editing all of them.
- **A React ThemeProvider passing colors through context or inline styles:** changing the
  theme would re-render the whole tree, styles would mix with logic, and it would still
  flash on load.
- **Saving the theme in IndexedDB with the rest of the data:** the API is asynchronous, so
  the theme could not be applied before the first paint.

## Consequences

**Positive**

- Switching is instant and does not re-render React components (only the toggle updates).
- Adding a theme means adding one CSS block and one entry in `THEMES`; components do not change.
- No flash of the wrong theme on load.
- Themes can change more than colors (fonts, border radius) with the same mechanism.

**Negative**

- The theme names and browser colors are duplicated in the inline script, because it does
  not go through Vite. They must be kept in sync by hand.
- The inline script will need a hash in the Content Security Policy when CSP is added.
- Semantic token names must be chosen carefully; a bad name is expensive to rename later.

**When to revisit**

- If themes start to differ in layout or components, not only in tokens.
- If the theme needs to be shared between devices (then it moves to synced settings,
  and the inline script reads a cached copy).
