import { daysInMonth, getDateParts, toISODate, type ISODate } from '../../shared/lib/date'
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

const byDateThenCategory = (a: SpecialDayOccurrence, b: SpecialDayOccurrence) =>
  a.date.localeCompare(b.date) ||
  CATEGORY_ORDER.indexOf(a.specialDay.category) - CATEGORY_ORDER.indexOf(b.specialDay.category)

/**
 * Visible special days between two dates (inclusive), sorted. Works across years,
 * which the month grid needs (it shows late December next to January).
 * ISO dates compare correctly as strings, so no Date objects are needed.
 */
export function getSpecialDaysInRange(
  days: readonly SpecialDay[],
  from: ISODate,
  to: ISODate,
  preferences: SpecialDayPreferences,
): SpecialDayOccurrence[] {
  const firstYear = getDateParts(from).year
  const lastYear = getDateParts(to).year
  const visible = days.filter((day) => isSpecialDayVisible(day, preferences))
  const result: SpecialDayOccurrence[] = []

  for (let year = firstYear; year <= lastYear; year++) {
    for (const day of visible) {
      const occurrence = occurrenceInYear(day, year)
      if (occurrence && occurrence.date >= from && occurrence.date <= to) result.push(occurrence)
    }
  }
  return result.toSorted(byDateThenCategory)
}

/** Groups occurrences by date for O(1) lookup while rendering each grid cell. */
export function groupByDate(
  occurrences: readonly SpecialDayOccurrence[],
): Map<ISODate, SpecialDayOccurrence[]> {
  const map = new Map<ISODate, SpecialDayOccurrence[]>()
  for (const occurrence of occurrences) {
    const list = map.get(occurrence.date)
    if (list) list.push(occurrence)
    else map.set(occurrence.date, [occurrence])
  }
  return map
}

/** "Cumple 30" for family birthdays, "Nacimiento" on the birth year. */
export function yearsLabel({ specialDay, years }: SpecialDayOccurrence): string | null {
  if (years === undefined || specialDay.category !== 'familia') return null
  return years === 0 ? 'Nacimiento' : `Cumple ${years}`
}

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
  return getSpecialDaysInRange(
    days,
    toISODate(year, month, 1),
    toISODate(year, month, daysInMonth(year, month)),
    preferences,
  )
}
