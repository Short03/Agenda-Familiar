import { useCallback, useState } from 'react'
import { DEFAULT_PREFERENCES, type SpecialDayCategory, type SpecialDayPreferences } from './types'

function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

/**
 * Preferences live in memory for now: they reset on reload.
 * Phase 5 keeps the same API and stores them in IndexedDB (Dexie).
 */
export function useSpecialDayPreferences(initial: SpecialDayPreferences = DEFAULT_PREFERENCES) {
  const [preferences, setPreferences] = useState(initial)

  const toggleCategory = useCallback((category: SpecialDayCategory) => {
    setPreferences((p) => ({ ...p, hiddenCategories: toggle(p.hiddenCategories, category) }))
  }, [])

  const hideDay = useCallback((id: string) => {
    setPreferences((p) =>
      p.hiddenDayIds.includes(id) ? p : { ...p, hiddenDayIds: [...p.hiddenDayIds, id] },
    )
  }, [])

  const showDay = useCallback((id: string) => {
    setPreferences((p) => ({ ...p, hiddenDayIds: p.hiddenDayIds.filter((x) => x !== id) }))
  }, [])

  return { preferences, toggleCategory, hideDay, showDay }
}
