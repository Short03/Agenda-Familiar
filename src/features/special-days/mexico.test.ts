import { describe, expect, it } from 'vitest'
import { MEXICAN_SPECIAL_DAYS } from './mexico'
import { occurrenceInYear } from './occurrences'

function officialRestDays(year: number): string[] {
  return MEXICAN_SPECIAL_DAYS.filter((day) => day.category === 'oficial')
    .map((day) => occurrenceInYear(day, year)?.date)
    .filter((date) => date !== undefined)
    .toSorted()
}

describe('MEXICAN_SPECIAL_DAYS', () => {
  it('has unique ids', () => {
    const ids = MEXICAN_SPECIAL_DAYS.map((day) => day.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('resolves every day in every year of a long range without throwing', () => {
    for (let year = 2000; year <= 2100; year++) {
      for (const day of MEXICAN_SPECIAL_DAYS) {
        expect(() => occurrenceInYear(day, year)).not.toThrow()
      }
    }
  })

  it('lists the 2026 official rest days', () => {
    expect(officialRestDays(2026)).toEqual([
      '2026-01-01',
      '2026-02-02',
      '2026-03-16',
      '2026-05-01',
      '2026-09-16',
      '2026-11-16',
      '2026-12-25',
    ])
  })

  it('adds the transfer of power in a presidential year (2030)', () => {
    expect(officialRestDays(2030)).toContain('2030-10-01')
  })
})
