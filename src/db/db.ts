import { Dexie, type EntityTable } from 'dexie'
import type { CustomSpecialDay, SpecialDayPreferences } from '../features/special-days/types'
import type { Task } from '../features/tasks/task-model'

/** Key-value settings. A union on `key` keeps each value typed. */
export type SettingRecord = {
  key: 'specialDayPreferences'
  value: SpecialDayPreferences
  updatedAt: string
}

/**
 * The local database (ADR 0001).
 *
 * Tables are declared with a type cast instead of class fields on purpose: with
 * `useDefineForClassFields` (the default for modern targets) a field like `tasks!: Table`
 * is initialized to undefined and overwrites the table Dexie creates.
 */
export const db = new Dexie('agenda-familiar') as Dexie & {
  tasks: EntityTable<Task, 'id'>
  specialDays: EntityTable<CustomSpecialDay, 'id'>
  settings: EntityTable<SettingRecord, 'key'>
}

// Only indexed fields are listed. Never edit a released version: add version(2) with a
// migration instead, or existing phones will fail to open the database.
db.version(1).stores({
  tasks: 'id, dueDate, updatedAt',
  specialDays: 'id, updatedAt',
  settings: 'key',
})

export const nowISO = (): string => new Date().toISOString()
