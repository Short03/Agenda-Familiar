# 0003. Build our own accessible month grid

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The calendar shows one month, Monday to Sunday, with Mexican holidays, family birthdays
and (later) tasks on each day. It must work on an iPhone screen, with a keyboard and with
a screen reader, and it must follow both themes.

Special days come from our own rules engine (`src/features/special-days`),
which returns plain `"YYYY-MM-DD"` dates.

## Decision

Build the month grid ourselves instead of using a calendar library:

- `buildMonthGrid` (pure function) returns the weeks; the UI only renders them.
- The grid follows the WAI-ARIA APG date grid pattern: a `<table role="grid">`, one
  button per day, roving `tabindex` (only the selected day is tabbable), and arrow keys,
  Home/End and PageUp/PageDown to move.
- The visible month is derived from the selected day, so there is a single piece of state.
- Each day's accessible name includes the full date, "hoy" and its special days, because
  the colored markers are decorative.
- Category colors are theme tokens with at least 3:1 contrast against the surface.

## Alternatives considered

- **FullCalendar:** built for agendas with hours and events; heavy for a month view,
  hard to theme with our tokens, and it brings its own date model.
- **React Aria `Calendar` / similar headless calendars:** excellent accessibility, but
  built for picking a date, not for showing content (markers, birthdays, tasks) inside
  each cell. Customizing cells would fight the library.
- **A plain CSS grid of `<div>`s without ARIA:** simple, but screen readers would not
  know it is a grid or that arrow keys work.

## Consequences

**Positive**

- Full control over what each cell shows, which tasks will need in Phase 5.
- No extra dependency; the logic is small and fully tested.
- Learning value: the APG grid pattern is a common interview topic.

**Negative**

- We own the accessibility: keyboard model, focus management and labels must be kept
  correct by our own tests.
- `role="grid"` on a `<table>` needed a lint exception (`.oxlintrc.json`), because the
  rule does not know this pattern.
- The number of rows changes between 4 and 6, so the page height changes with the month.

**When to revisit**

- If we need week or day views with hours, a library like FullCalendar becomes worth it.
