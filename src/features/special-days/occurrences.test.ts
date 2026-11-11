import { describe, expect, it } from 'vitest'
import { getSpecialDaysInMonth, isSpecialDayVisible, occurrenceInYear } from './occurrences'
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
