import {
  addDays,
  daysInMonth,
  isValidDate,
  toISODate,
  weekdayOf,
  type ISODate,
} from '../../shared/lib/date'
import { easterSunday } from './easter'
import type { DateRule } from './types'

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number,
): ISODate | null {
  if (n === -1) {
    const lastDay = daysInMonth(year, month)
    const offset = (weekdayOf(year, month, lastDay) - weekday + 7) % 7
    return toISODate(year, month, lastDay - offset)
  }
  const firstOffset = (weekday - weekdayOf(year, month, 1) + 7) % 7
  const day = 1 + firstOffset + (n - 1) * 7
  return day <= daysInMonth(year, month) ? toISODate(year, month, day) : null
}

/**
 * The date a rule falls on in `year`, or null if it does not happen that year
 * (Feb 29 in a non-leap year, a 5th Monday that does not exist, an off-year of a 6-year cycle).
 */
export function resolveRule(rule: DateRule, year: number): ISODate | null {
  switch (rule.kind) {
    case 'fixed':
      return isValidDate({ year, month: rule.month, day: rule.day })
        ? toISODate(year, rule.month, rule.day)
        : null

    case 'nthWeekday':
      return nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.n)

    case 'easterOffset':
      return addDays(easterSunday(year), rule.days)

    case 'everyNYears': {
      const yearsSinceAnchor = year - rule.anchorYear
      const happensThisYear = yearsSinceAnchor >= 0 && yearsSinceAnchor % rule.interval === 0
      return happensThisYear ? toISODate(year, rule.month, rule.day) : null
    }

    default: {
      // Exhaustiveness check: adding a new rule kind without handling it is a compile error.
      const unhandled: never = rule
      throw new Error(`Unhandled rule: ${JSON.stringify(unhandled)}`)
    }
  }
}
