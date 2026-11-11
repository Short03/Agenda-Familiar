/**
 * Date-only helpers. A calendar day ("2027-10-09") has no time and no time zone,
 * so we never use `new Date("2027-10-09")` (that is midnight UTC, the previous day in Mexico).
 * Internally we use UTC Date objects only to do arithmetic, never to display.
 */

declare const isoDateBrand: unique symbol

/**
 * A "YYYY-MM-DD" string. The brand makes plain strings unassignable,
 * so the only way to get an ISODate is through `toISODate` or `parseISODate`.
 */
export type ISODate = string & { readonly [isoDateBrand]: true }

export interface DateParts {
  year: number
  /** 1-12 */
  month: number
  /** 1-31 */
  day: number
}

/** 0 = Sunday ... 6 = Saturday (same as Date#getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

const pad = (value: number, length = 2) => String(value).padStart(length, '0')

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function isValidDate({ year, month, day }: DateParts): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  )
}

export function toISODate(year: number, month: number, day: number): ISODate {
  if (!isValidDate({ year, month, day })) {
    throw new RangeError(`Invalid date: ${year}-${month}-${day}`)
  }
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}` as ISODate
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/** Validates untrusted input (storage, forms). Returns null instead of throwing. */
export function parseISODate(value: string): ISODate | null {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return null
  const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
  return isValidDate(parts) ? (value as ISODate) : null
}

export function getDateParts(date: ISODate): DateParts {
  const [year = 0, month = 0, day = 0] = date.split('-').map(Number)
  return { year, month, day }
}

export function weekdayOf(year: number, month: number, day: number): Weekday {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() as Weekday
}

export function addDays(date: ISODate, amount: number): ISODate {
  const { year, month, day } = getDateParts(date)
  const result = new Date(Date.UTC(year, month - 1, day + amount))
  return toISODate(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate())
}

/** Today in the device's local time zone. */
export function todayISODate(now: Date = new Date()): ISODate {
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/** Local Date at noon, only for display with Intl/date-fns (noon avoids DST edge cases). */
export function toLocalDate(date: ISODate): Date {
  const { year, month, day } = getDateParts(date)
  return new Date(year, month - 1, day, 12)
}
