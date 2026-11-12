import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import { db, nowISO } from '../../db/db'
import { DEFAULT_PREFERENCES, type SpecialDayCategory, type SpecialDayPreferences } from './types'

const KEY = 'specialDayPreferences'

function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

async function updatePreferences(
  update: (current: SpecialDayPreferences) => SpecialDayPreferences,
): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    const record = await db.settings.get(KEY)
    await db.settings.put({
      key: KEY,
      value: update(record?.value ?? DEFAULT_PREFERENCES),
      updatedAt: nowISO(),
    })
  })
}

/** Same API as before (Phase 3); now the choices survive a reload. */
export function useSpecialDayPreferences() {
  const record = useLiveQuery(() => db.settings.get(KEY), [])
  const preferences = record?.value ?? DEFAULT_PREFERENCES

  const toggleCategory = useCallback(
    (category: SpecialDayCategory) =>
      updatePreferences((p) => ({ ...p, hiddenCategories: toggle(p.hiddenCategories, category) })),
    [],
  )

  const hideDay = useCallback(
    (id: string) =>
      updatePreferences((p) =>
        p.hiddenDayIds.includes(id) ? p : { ...p, hiddenDayIds: [...p.hiddenDayIds, id] },
      ),
    [],
  )

  const showDay = useCallback(
    (id: string) =>
      updatePreferences((p) => ({ ...p, hiddenDayIds: p.hiddenDayIds.filter((x) => x !== id) })),
    [],
  )

  return { preferences, toggleCategory, hideDay, showDay }
}
