import { describe, expect, it } from 'vitest'
import { easterSunday } from './easter'

describe('easterSunday', () => {
  // Reference dates from published Easter tables.
  it.each([
    [2000, '2000-04-23'],
    [2008, '2008-03-23'], // very early Easter
    [2011, '2011-04-24'], // very late Easter
    [2019, '2019-04-21'],
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    [2038, '2038-04-25'],
  ])('Easter %i is on %s', (year, expected) => {
    expect(easterSunday(year)).toBe(expected)
  })
})
