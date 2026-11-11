import {
  addDays,
  daysInMonth,
  mondayBasedWeekday,
  toISODate,
  type ISODate,
} from '../../shared/lib/date'

interface MonthGridRange {
  /** Monday on or before the 1st. */
  start: ISODate
  /** Sunday on or after the last day of the month. */
  end: ISODate
  weekCount: number
}

export function getMonthGridRange(year: number, month: number): MonthGridRange {
  const firstOfMonth = toISODate(year, month, 1)
  const leadingDays = mondayBasedWeekday(firstOfMonth)
  const weekCount = Math.ceil((leadingDays + daysInMonth(year, month)) / 7)
  const start = addDays(firstOfMonth, -leadingDays)
  return { start, end: addDays(start, weekCount * 7 - 1), weekCount }
}

/**
 * Weeks of a month view, Monday to Sunday. It includes the days of the previous and next
 * month needed to complete the first and last week, so every row has 7 days.
 * The number of rows changes (4 to 6) with the month.
 */
export function buildMonthGrid(year: number, month: number): ISODate[][] {
  const { start, weekCount } = getMonthGridRange(year, month)
  return Array.from({ length: weekCount }, (_week, week) =>
    Array.from({ length: 7 }, (_day, weekday) => addDays(start, week * 7 + weekday)),
  )
}
