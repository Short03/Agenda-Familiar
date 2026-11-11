import type { ISODate, Weekday } from '../../shared/lib/date'

export const SPECIAL_DAY_CATEGORIES = [
  'oficial',
  'civica',
  'tradicion',
  'familia',
  'personal',
] as const
export type SpecialDayCategory = (typeof SPECIAL_DAY_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<SpecialDayCategory, string> = {
  oficial: 'Descanso oficial',
  civica: 'Cívicas',
  tradicion: 'Tradiciones',
  familia: 'Familia',
  personal: 'Personales',
}

/**
 * How a special day falls on the calendar each year. A discriminated union:
 * the `kind` field tells TypeScript which other fields exist.
 */
export type DateRule =
  /** Same month and day every year (May 1st). */
  | { kind: 'fixed'; month: number; day: number }
  /** The nth weekday of a month (third Monday of November). n = -1 means the last one. */
  | { kind: 'nthWeekday'; month: number; weekday: Weekday; n: 1 | 2 | 3 | 4 | 5 | -1 }
  /** Days relative to Easter Sunday (Good Friday = -2). */
  | { kind: 'easterOffset'; days: number }
  /** A fixed date that only happens every `interval` years, counting from `anchorYear`. */
  | { kind: 'everyNYears'; month: number; day: number; interval: number; anchorYear: number }

export interface SpecialDay {
  /** Stable id: preferences ("hide this day") and sync refer to it. Never reuse or rename one. */
  id: string
  name: string
  category: SpecialDayCategory
  rule: DateRule
  /**
   * First year it happened (birth year for birthdays). Before it there is no occurrence,
   * and after it we can show "cumple 30" / "30 años".
   */
  sinceYear?: number
}

/** One special day placed on a concrete date. */
export interface SpecialDayOccurrence {
  date: ISODate
  specialDay: SpecialDay
  /** Years since `sinceYear` (the age, for birthdays). */
  years?: number
}

/** What the person chose to hide. Arrays (not Sets) so they serialize to JSON/IndexedDB. */
export interface SpecialDayPreferences {
  hiddenCategories: readonly SpecialDayCategory[]
  hiddenDayIds: readonly string[]
}

export const DEFAULT_PREFERENCES: SpecialDayPreferences = {
  hiddenCategories: [],
  hiddenDayIds: [],
}
