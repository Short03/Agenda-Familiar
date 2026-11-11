# 0001. Local-first storage with IndexedDB (Dexie)

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The app is used by two people (a couple), both on iPhone. They want to share the same
calendar and task list. It must work offline and load fast on a phone. This is also a
learning project, so the first versions should focus on the frontend before adding a backend.

Safari can delete website data (including IndexedDB) after about seven days without use,
unless the site is installed on the Home Screen.

## Decision

Store all data (tasks, special days and settings) in IndexedDB, the browser's database,
using the Dexie library.

The data model is ready for a future sync between both phones:

- Every record has a UUID (`crypto.randomUUID()`), so two phones can create records
  offline without ID collisions.
- Every record has an `updatedAt` timestamp, so conflicts can be resolved with
  last-write-wins.
- Records are never hard-deleted. A `deletedAt` timestamp marks them as deleted
  (soft delete), so the deletion can reach the other phone.

Date-only values (birthdays, due dates) are stored as `"YYYY-MM-DD"` strings, not as
`Date` objects, to avoid time zone bugs.

To prevent Safari from deleting the data:

- The app is used as an installed PWA (added to the Home Screen).
- The app calls `navigator.storage.persist()` on startup.
- Users can export and import a JSON backup.

## Alternatives considered

- **localStorage:** limited to about 5 MB, stores only strings, has a synchronous API
  that blocks the main thread, and has no indexes or queries (for example, "all tasks
  in October").
- **A backend from day one (Spring Boot or .NET + PostgreSQL):** too many new
  technologies at once (API, database, Docker, deployment, authentication). It would
  take weeks before anything useful runs on the phone. It is planned, not rejected.
- **Firebase or Supabase:** they would solve sync quickly, but they tie the app to a
  vendor and skip the backend skills this project is meant to practice.

## Consequences

**Positive**

- Fast: reads and writes are local, with no network round trip.
- Works offline by default.
- No server cost and nothing to deploy besides static files.
- Adding sync later does not require changing the data model.

**Negative**

- Until the backend exists, each phone has its own copy of the data. Changes made on
  one phone are not visible on the other.
- Data can still be lost if Safari evicts it or a phone is replaced; the JSON backup
  is the mitigation.
- Reminders and push notifications are out of scope for the first version. The two
  users do not need them yet. On iOS they also require a server (Web Push), so they
  will be added after the backend.

**When to revisit**

- When the core features (calendar and tasks) are done, build the backend to sync both
  phones. Sharing is a confirmed requirement, so this is planned work, not a "maybe".
- If the data model needs relations or queries that IndexedDB handles poorly.
