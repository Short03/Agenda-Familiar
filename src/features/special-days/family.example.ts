import type { SpecialDay } from './types'

/**
 * Copy this file to `family.local.ts` (ignored by git) and put real data there.
 * `sinceYear` is the birth year, used to show the age ("cumple 30").
 */
export const FAMILY_SPECIAL_DAYS: readonly SpecialDay[] = [
  {
    id: 'family-example',
    name: 'Cumpleaños de ejemplo',
    category: 'familia',
    rule: { kind: 'fixed', month: 1, day: 15 },
    sinceYear: 1990,
  },
]
