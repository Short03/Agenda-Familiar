import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  daysInMonth,
  getDateParts,
  isLeapYear,
  mondayBasedWeekday,
  parseISODate,
  toISODate,
  todayISODate,
  weekdayOf,
} from './date'

describe('toISODate', () => {
  it('pads month and day', () => {
    expect(toISODate(2027, 9, 27)).toBe('2027-09-27')
  })

  it('rejects impossible dates', () => {
    expect(() => toISODate(2026, 2, 29)).toThrow(RangeError)
    expect(() => toISODate(2026, 13, 1)).toThrow(RangeError)
    expect(() => toISODate(2026, 4, 31)).toThrow(RangeError)
  })
})

describe('parseISODate', () => {
  it('accepts valid dates', () => {
    expect(parseISODate('2028-02-29')).toBe('2028-02-29')
  })

  it.each(['2026-02-29', '2026-1-05', '05/01/2026', '', '2026-00-10', 'hola'])(
    'rejects %j',
    (value) => {
      expect(parseISODate(value)).toBeNull()
    },
  )
})

describe('calendar math', () => {
  it('knows leap years', () => {
    expect(isLeapYear(2028)).toBe(true)
    expect(isLeapYear(2026)).toBe(false)
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2000)).toBe(true)
  })

  it('counts days in a month', () => {
    expect(daysInMonth(2026, 2)).toBe(28)
    expect(daysInMonth(2028, 2)).toBe(29)
    expect(daysInMonth(2026, 11)).toBe(30)
    expect(daysInMonth(2026, 12)).toBe(31)
  })

  it('gets the weekday (0 = Sunday)', () => {
    expect(weekdayOf(2026, 11, 11)).toBe(3) // Wednesday
    expect(weekdayOf(2027, 10, 9)).toBe(6) // Saturday
  })

  it('adds days across months and years', () => {
    expect(addDays(toISODate(2026, 12, 31), 1)).toBe('2027-01-01')
    expect(addDays(toISODate(2027, 3, 1), -1)).toBe('2027-02-28')
  })

  it('splits a date into parts', () => {
    expect(getDateParts(toISODate(2027, 10, 9))).toEqual({ year: 2027, month: 10, day: 9 })
  })
})

describe('addMonths', () => {
  it('moves to the same day in another month', () => {
    expect(addMonths(toISODate(2026, 11, 16), 1)).toBe('2026-12-16')
    expect(addMonths(toISODate(2026, 12, 16), 1)).toBe('2027-01-16')
    expect(addMonths(toISODate(2027, 1, 16), -1)).toBe('2026-12-16')
  })

  it('clamps to the last day of shorter months', () => {
    expect(addMonths(toISODate(2027, 1, 31), 1)).toBe('2027-02-28')
    expect(addMonths(toISODate(2028, 3, 31), -1)).toBe('2028-02-29')
  })
})

describe('mondayBasedWeekday', () => {
  it('starts the week on Monday', () => {
    expect(mondayBasedWeekday(toISODate(2026, 11, 16))).toBe(0) // Monday
    expect(mondayBasedWeekday(toISODate(2026, 11, 22))).toBe(6) // Sunday
  })
})

describe('todayISODate', () => {
  it('uses the local calendar day, not UTC', () => {
    // 11:30 pm local time must still be the same day
    expect(todayISODate(new Date(2026, 10, 11, 23, 30))).toBe('2026-11-11')
  })
})
