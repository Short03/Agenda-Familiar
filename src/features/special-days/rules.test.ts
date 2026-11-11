import { describe, expect, it } from 'vitest'
import { resolveRule } from './rules'

describe('resolveRule', () => {
  describe('fixed', () => {
    it('returns the same day every year', () => {
      expect(resolveRule({ kind: 'fixed', month: 9, day: 16 }, 2026)).toBe('2026-09-16')
      expect(resolveRule({ kind: 'fixed', month: 9, day: 16 }, 2027)).toBe('2027-09-16')
    })

    it('returns null for Feb 29 in a non-leap year', () => {
      expect(resolveRule({ kind: 'fixed', month: 2, day: 29 }, 2027)).toBeNull()
      expect(resolveRule({ kind: 'fixed', month: 2, day: 29 }, 2028)).toBe('2028-02-29')
    })
  })

  describe('nthWeekday', () => {
    it.each([
      // [description, month, weekday, n, year, expected]
      ['1st Monday of Feb (Constitution)', 2, 1, 1, 2026, '2026-02-02'],
      ['3rd Monday of Mar (Benito Juárez)', 3, 1, 3, 2026, '2026-03-16'],
      ['3rd Monday of Nov (Revolution)', 11, 1, 3, 2026, '2026-11-16'],
      ['3rd Sunday of Jun (Father’s Day)', 6, 0, 3, 2026, '2026-06-21'],
      ['1st Monday when the month starts on Monday', 6, 1, 1, 2026, '2026-06-01'],
      ['last Monday of May', 5, 1, -1, 2026, '2026-05-25'],
      ['last Sunday when the month ends on Sunday', 5, 0, -1, 2026, '2026-05-31'],
      ['3rd Monday of Nov 2027', 11, 1, 3, 2027, '2027-11-15'],
    ] as const)('%s', (_, month, weekday, n, year, expected) => {
      expect(resolveRule({ kind: 'nthWeekday', month, weekday, n }, year)).toBe(expected)
    })

    it('returns null when the 5th weekday does not exist', () => {
      // February 2026 has only four Mondays
      expect(resolveRule({ kind: 'nthWeekday', month: 2, weekday: 1, n: 5 }, 2026)).toBeNull()
    })
  })

  describe('easterOffset', () => {
    it('places Holy Thursday and Good Friday before Easter', () => {
      expect(resolveRule({ kind: 'easterOffset', days: -3 }, 2026)).toBe('2026-04-02')
      expect(resolveRule({ kind: 'easterOffset', days: -2 }, 2026)).toBe('2026-04-03')
    })

    it('crosses month boundaries', () => {
      // Easter 2027 is March 28, so Good Friday is March 26 and +7 is April 4
      expect(resolveRule({ kind: 'easterOffset', days: -2 }, 2027)).toBe('2027-03-26')
      expect(resolveRule({ kind: 'easterOffset', days: 7 }, 2027)).toBe('2027-04-04')
    })
  })

  describe('everyNYears', () => {
    const transferOfPower = {
      kind: 'everyNYears',
      month: 10,
      day: 1,
      interval: 6,
      anchorYear: 2024,
    } as const

    it('happens on cycle years', () => {
      expect(resolveRule(transferOfPower, 2024)).toBe('2024-10-01')
      expect(resolveRule(transferOfPower, 2030)).toBe('2030-10-01')
    })

    it('does not happen on other years or before the anchor', () => {
      expect(resolveRule(transferOfPower, 2027)).toBeNull()
      expect(resolveRule(transferOfPower, 2018)).toBeNull()
    })
  })
})
