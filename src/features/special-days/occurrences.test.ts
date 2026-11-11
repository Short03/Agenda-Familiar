import { describe, expect, it } from 'vitest'
import {
  getSpecialDaysInMonth,
  getSpecialDaysInRange,
  groupByDate,
  isSpecialDayVisible,
  occurrenceInYear,
  yearsLabel,
} from './occurrences'
import { toISODate } from '../../shared/lib/date'
import { DEFAULT_PREFERENCES, type SpecialDay } from './types'

// Fictional data: real family birthdays never go into the repository.
const birthday: SpecialDay = {
  id: 'family-test-birthday',
  name: 'Cumpleaños de prueba',
  category: 'familia',
  rule: { kind: 'fixed', month: 10, day: 9 },
  sinceYear: 2000,
}
const holiday: SpecialDay = {
  id: 'test-holiday',
  name: 'Feriado de prueba',
  category: 'oficial',
  rule: { kind: 'fixed', month: 10, day: 9 },
}
const tradition: SpecialDay = {
  id: 'test-tradition',
  name: 'Tradición de prueba',
  category: 'tradicion',
  rule: { kind: 'fixed', month: 10, day: 1 },
}
const otherMonth: SpecialDay = {
  id: 'test-other-month',
  name: 'Otro mes',
  category: 'civica',
  rule: { kind: 'fixed', month: 11, day: 2 },
}

describe('occurrenceInYear', () => {
  it('computes the age for days with sinceYear', () => {
    expect(occurrenceInYear(birthday, 2027)).toEqual({
      date: '2027-10-09',
      specialDay: birthday,
      years: 27,
    })
  })

  it('has no occurrence before sinceYear', () => {
    expect(occurrenceInYear(birthday, 1999)).toBeNull()
  })

  it('omits years for days without sinceYear', () => {
    expect(occurrenceInYear(holiday, 2027)).not.toHaveProperty('years')
  })
})

describe('isSpecialDayVisible', () => {
  it('hides by category and by id', () => {
    expect(isSpecialDayVisible(holiday, DEFAULT_PREFERENCES)).toBe(true)
    expect(isSpecialDayVisible(holiday, { hiddenCategories: ['oficial'], hiddenDayIds: [] })).toBe(
      false,
    )
    expect(
      isSpecialDayVisible(holiday, { hiddenCategories: [], hiddenDayIds: ['test-holiday'] }),
    ).toBe(false)
  })
})

describe('getSpecialDaysInMonth', () => {
  const all = [holiday, otherMonth, tradition, birthday]

  it('returns only the month, sorted by date, family first on the same date', () => {
    const result = getSpecialDaysInMonth(all, 2027, 10, DEFAULT_PREFERENCES)

    expect(result.map((o) => o.specialDay.id)).toEqual([
      'test-tradition',
      'family-test-birthday',
      'test-holiday',
    ])
  })

  it('respects preferences', () => {
    const result = getSpecialDaysInMonth(all, 2027, 10, {
      hiddenCategories: ['tradicion'],
      hiddenDayIds: ['test-holiday'],
    })

    expect(result.map((o) => o.specialDay.id)).toEqual(['family-test-birthday'])
  })
})

describe('getSpecialDaysInRange', () => {
  const newYear: SpecialDay = {
    id: 'test-new-year',
    name: 'Año nuevo de prueba',
    category: 'oficial',
    rule: { kind: 'fixed', month: 1, day: 1 },
  }
  const christmas: SpecialDay = {
    id: 'test-christmas',
    name: 'Navidad de prueba',
    category: 'oficial',
    rule: { kind: 'fixed', month: 12, day: 25 },
  }

  it('works across the year boundary', () => {
    const result = getSpecialDaysInRange(
      [newYear, christmas],
      toISODate(2026, 12, 20),
      toISODate(2027, 1, 5),
      DEFAULT_PREFERENCES,
    )

    expect(result.map((o) => o.date)).toEqual(['2026-12-25', '2027-01-01'])
  })

  it('includes both ends of the range', () => {
    const result = getSpecialDaysInRange(
      [christmas],
      toISODate(2026, 12, 25),
      toISODate(2026, 12, 25),
      DEFAULT_PREFERENCES,
    )

    expect(result).toHaveLength(1)
  })
})

describe('groupByDate', () => {
  it('groups occurrences that fall on the same date', () => {
    const grouped = groupByDate(
      getSpecialDaysInMonth([holiday, birthday, tradition], 2027, 10, DEFAULT_PREFERENCES),
    )

    expect(grouped.get(toISODate(2027, 10, 9))?.map((o) => o.specialDay.id)).toEqual([
      'family-test-birthday',
      'test-holiday',
    ])
    expect(grouped.get(toISODate(2027, 10, 1))).toHaveLength(1)
  })
})

describe('yearsLabel', () => {
  it('shows the age only for family days', () => {
    expect(yearsLabel({ date: toISODate(2027, 10, 9), specialDay: birthday, years: 27 })).toBe(
      'Cumple 27',
    )
    expect(yearsLabel({ date: toISODate(2000, 10, 9), specialDay: birthday, years: 0 })).toBe(
      'Nacimiento',
    )
    expect(yearsLabel({ date: toISODate(2027, 10, 9), specialDay: holiday })).toBeNull()
  })
})
