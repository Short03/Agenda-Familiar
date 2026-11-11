import { getDateParts } from '../../shared/lib/date'
import { resolveRule } from './rules'
import type { SpecialDay, SpecialDayOccurrence, SpecialDayPreferences } from './types'

export function isSpecialDayVisible(day: SpecialDay, preferences: SpecialDayPreferences): boolean {
  return (
    !preferences.hiddenCategories.includes(day.category) &&
    !preferences.hiddenDayIds.includes(day.id)
  )
}

/** Where a special day falls in `year`, or null if it does not happen (or had not started yet). */
export function occurrenceInYear(day: SpecialDay, year: number): SpecialDayOccurrence | null {
  if (day.sinceYear !== undefined && year < day.sinceYear) return null

  const date = resolveRule(day.rule, year)
  if (!date) return null

  return day.sinceYear === undefined
    ? { date, specialDay: day }
    : { date, specialDay: day, years: year - day.sinceYear }
}

const CATEGORY_ORDER = ['familia', 'personal', 'oficial', 'civica', 'tradicion'] as const

/**
 * Visible special days in a month, sorted by date. Family and personal days come first
 * on the same date, because they matter most to the people using the app.
 */
export function getSpecialDaysInMonth(
  days: readonly SpecialDay[],
  year: number,
  month: number,
  preferences: SpecialDayPreferences,
): SpecialDayOccurrence[] {
  return days
    .filter((day) => isSpecialDayVisible(day, preferences))
    .map((day) => occurrenceInYear(day, year))
    .filter((occurrence): occurrence is SpecialDayOccurrence => occurrence !== null)
    .filter((occurrence) => getDateParts(occurrence.date).month === month)
    .toSorted(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        CATEGORY_ORDER.indexOf(a.specialDay.category) -
          CATEGORY_ORDER.indexOf(b.specialDay.category),
    )
}
