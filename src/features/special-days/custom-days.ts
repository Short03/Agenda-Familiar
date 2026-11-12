import { useLiveQuery } from 'dexie-react-hooks'
import { db, nowISO } from '../../db/db'
import { createId } from '../../shared/lib/id'
import type { CustomDayCategory, CustomSpecialDay } from './types'

export interface NewCustomDayInput {
  name: string
  category: CustomDayCategory
  month: number
  day: number
  /** Birth or start year, to show the age. Null when years should not be counted. */
  sinceYear: number | null
}

export function createCustomDay(
  input: NewCustomDayInput,
  id: string,
  now: string,
): CustomSpecialDay {
  return {
    id,
    name: input.name,
    category: input.category,
    rule: { kind: 'fixed', month: input.month, day: input.day },
    ...(input.sinceYear === null ? {} : { sinceYear: input.sinceYear }),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
}

async function update(id: string, change: (day: CustomSpecialDay) => CustomSpecialDay) {
  await db.transaction('rw', db.specialDays, async () => {
    const day = await db.specialDays.get(id)
    if (day) await db.specialDays.put(change(day))
  })
}

export const customDayRepository = {
  async add(input: NewCustomDayInput): Promise<CustomSpecialDay> {
    const day = createCustomDay(input, createId(), nowISO())
    await db.specialDays.add(day)
    return day
  },
  remove: (id: string) => update(id, (d) => ({ ...d, deletedAt: nowISO(), updatedAt: nowISO() })),
  restore: (id: string) => update(id, (d) => ({ ...d, deletedAt: null, updatedAt: nowISO() })),
  listActive: () => db.specialDays.filter((day) => day.deletedAt === null).toArray(),
}

const NO_DAYS: readonly CustomSpecialDay[] = []

/** Family and personal days entered in the app, sorted by month and day. */
export function useCustomSpecialDays(): readonly CustomSpecialDay[] {
  const days = useLiveQuery(async () => {
    const list = await customDayRepository.listActive()
    return list.toSorted((a, b) => a.rule.month - b.rule.month || a.rule.day - b.rule.day)
  }, [])
  return days ?? NO_DAYS
}
