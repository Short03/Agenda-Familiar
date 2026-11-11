# 0001. Local-first storage with IndexedDB (Dexie)

- **Status:** Proposed
- **Date:** 2026-11-11

<!--
  TODO (you write this one). Answer these questions:

  Context
  - Who uses the app, on which devices, and does it need to work offline?
  - Why is a backend not required for the first version?

  Decision
  - Store tasks, special days and settings in IndexedDB through Dexie.
  - Store date-only values as "YYYY-MM-DD" strings. Why?

  Alternatives considered
  - localStorage: why not? (size, sync API, no indexes, no queries)
  - A backend from day one (Spring Boot / .NET + Postgres): why later?
  - Firebase / Supabase: why not, given the learning goals?

  Consequences
  - Data lives on one device only: no sync between phones (yet).
  - Reminders only fire while the app is open, until we add Web Push from a server.
  - What would make us move to a backend? (sharing the calendar, push notifications)
-->
