import { z } from 'zod'
import { db, type SettingRecord } from '../../db/db'
import { parseISODate, type ISODate } from '../../shared/lib/date'
import {
  CUSTOM_DAY_CATEGORIES,
  SPECIAL_DAY_CATEGORIES,
  type CustomSpecialDay,
} from '../special-days/types'
import type { Task } from '../tasks/task-model'

export const BACKUP_VERSION = 1

// A backup file is untrusted input: anyone can edit it. Validate every field.

const timestamp = z.iso.datetime()
const isoDate = z
  .string()
  .refine((value) => parseISODate(value) !== null)
  .transform((value) => value as ISODate) // safe: validated just above

const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  notes: z.string().max(5000),
  important: z.boolean(),
  urgent: z.boolean(),
  dueDate: isoDate.nullable(),
  completedAt: timestamp.nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp.nullable(),
})

const customDaySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  category: z.enum(CUSTOM_DAY_CATEGORIES),
  rule: z.object({
    kind: z.literal('fixed'),
    month: z.int().min(1).max(12),
    day: z.int().min(1).max(31),
  }),
  sinceYear: z.int().min(1800).max(3000).optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp.nullable(),
})

const settingSchema = z.object({
  key: z.literal('specialDayPreferences'),
  value: z.object({
    hiddenCategories: z.array(z.enum(SPECIAL_DAY_CATEGORIES)),
    hiddenDayIds: z.array(z.string()),
  }),
  updatedAt: timestamp,
})

export const backupSchema = z.object({
  app: z.literal('agenda-familiar'),
  version: z.literal(BACKUP_VERSION),
  exportedAt: timestamp,
  tasks: z.array(taskSchema),
  specialDays: z.array(customDaySchema),
  settings: z.array(settingSchema),
})

export interface Backup {
  app: 'agenda-familiar'
  version: typeof BACKUP_VERSION
  exportedAt: string
  tasks: Task[]
  specialDays: CustomSpecialDay[]
  settings: SettingRecord[]
}

/**
 * Last-write-wins merge (ADR 0001 / 0004): an incoming record is written only if it is new
 * or newer than ours. Returns the records to write. Pure, so it is easy to test, and it is
 * the same rule the future backend sync will use.
 */
export function recordsToWrite<T extends { updatedAt: string }>(
  local: readonly T[],
  incoming: readonly T[],
  keyOf: (record: T) => string,
): T[] {
  const localByKey = new Map(local.map((record) => [keyOf(record), record]))
  return incoming.filter((record) => {
    const current = localByKey.get(keyOf(record))
    return !current || record.updatedAt > current.updatedAt
  })
}

/** Everything, including soft-deleted records, so deletions survive a restore. */
export async function createBackup(now: Date = new Date()): Promise<Backup> {
  const [tasks, specialDays, settings] = await Promise.all([
    db.tasks.toArray(),
    db.specialDays.toArray(),
    db.settings.toArray(),
  ])
  return {
    app: 'agenda-familiar',
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    tasks,
    specialDays,
    settings,
  }
}

export type ImportResult =
  | { ok: true; written: { tasks: number; specialDays: number; settings: number } }
  | { ok: false; error: string }

function toCustomDay({ sinceYear, ...rest }: z.output<typeof customDaySchema>): CustomSpecialDay {
  // exactOptionalPropertyTypes: omit the key instead of storing `sinceYear: undefined`.
  return sinceYear === undefined ? rest : { ...rest, sinceYear }
}

export async function importBackup(text: string): Promise<ImportResult> {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'El archivo no es un respaldo válido.' }
  }

  const parsed = backupSchema.safeParse(json)
  if (!parsed.success) {
    return { ok: false, error: 'El archivo no es un respaldo de Agenda familiar o está dañado.' }
  }

  const incoming = parsed.data
  const incomingDays = incoming.specialDays.map(toCustomDay)

  return db.transaction('rw', [db.tasks, db.specialDays, db.settings], async () => {
    const [tasks, specialDays, settings] = await Promise.all([
      db.tasks.toArray(),
      db.specialDays.toArray(),
      db.settings.toArray(),
    ])
    const newTasks = recordsToWrite(tasks, incoming.tasks, (t) => t.id)
    const newDays = recordsToWrite(specialDays, incomingDays, (d) => d.id)
    const newSettings = recordsToWrite(settings, incoming.settings, (s) => s.key)

    await db.tasks.bulkPut(newTasks)
    await db.specialDays.bulkPut(newDays)
    await db.settings.bulkPut(newSettings)

    return {
      ok: true as const,
      written: {
        tasks: newTasks.length,
        specialDays: newDays.length,
        settings: newSettings.length,
      },
    }
  })
}

/**
 * On iPhone the share sheet ("Guardar en Archivos", AirDrop, WhatsApp) is the natural way
 * to keep a file. Elsewhere we fall back to a normal download.
 */
export async function saveBackupFile(backup: Backup, fileDate: string): Promise<void> {
  const fileName = `agenda-familiar-${fileDate}.json`
  const file = new File([JSON.stringify(backup, null, 2)], fileName, { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Respaldo de Agenda familiar' })
    } catch (error) {
      // Closing the share sheet is not an error.
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error
    }
    return
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
