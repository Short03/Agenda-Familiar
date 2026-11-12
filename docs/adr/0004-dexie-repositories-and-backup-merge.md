# 0004. Dexie behind repositories, and backups merged with last-write-wins

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

ADR 0001 chose IndexedDB (Dexie) with a sync-ready model. Phase 5 makes tasks, special-day
preferences and family days persistent, and adds a backup file because Safari can still
lose data. The two phones will sync through a backend later, so the way we write and merge
data now should still make sense then.

Family birthdays were in a git-ignored local file. That only worked on the developer's
machine, and the people using the app cannot edit code.

## Decision

- **Repositories hide Dexie.** `taskRepository` and `customDayRepository` are the only
  modules that write to the database. Components use React context (`useTasks`) or hooks,
  never `db` directly. Updates are read-modify-write inside a Dexie transaction, and reuse
  the pure functions from the domain model (`setTaskDone`, `softDeleteTask`).
- **Live queries.** Screens read with `useLiveQuery`, so every view (calendar, tasks,
  another tab) updates when the data changes, with no manual refresh or shared state.
- **Family and personal days are entered in the app** (Ajustes → Fechas de la familia)
  and stored in a `specialDays` table with the same sync fields as tasks.
- **Backups contain everything**, including soft-deleted records, and are validated
  with Zod on import (a file is untrusted input).
- **Importing merges with last-write-wins**: a record is written only if it is new or its
  `updatedAt` is newer. The merge is a pure function (`recordsToWrite`), the same rule the
  backend sync will use.
- On iPhone the backup is saved through the share sheet (Web Share API with files);
  other browsers get a normal download.

## Alternatives considered

- **Components calling Dexie directly:** less code today, but every screen would change
  when sync arrives, and tests would need the database for every component.
- **Replacing all data on import:** simpler, but restoring an old backup would silently
  undo newer changes made on the phone.
- **Keeping the in-memory reducer and saving a snapshot:** two sources of truth, and
  writes from another tab would be lost.

## Consequences

**Positive**

- Data survives reloads; screens stay in sync automatically.
- Moving to a backend changes the repositories and the provider, not the screens.
- Restoring a backup never destroys newer work.

**Negative**

- All writes are asynchronous: the UI handles a loading state and failed writes
  (the task form keeps what was typed if saving fails).
- Last-write-wins can lose one of two edits made to the same record at nearly the same
  time on two phones. Acceptable for two people and a shared family list.
- Soft-deleted records stay in IndexedDB forever until we add a cleanup step.
- The database schema is versioned: changing indexes needs `db.version(2)` with a migration.

**When to revisit**

- When the backend sync is built (Phase 8): conflict handling may need per-field merges.
