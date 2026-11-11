import { describe, expect, it } from 'vitest'
import { buildMonthGrid } from './month-grid'

describe('buildMonthGrid', () => {
  it('starts on the Monday before the 1st and fills whole weeks', () => {
    // November 2026 starts on a Sunday
    const grid = buildMonthGrid(2026, 11)

    expect(grid[0]?.[0]).toBe('2026-10-26')
    expect(grid[0]?.[6]).toBe('2026-11-01')
    expect(grid.at(-1)?.at(-1)).toBe('2026-12-06')
    expect(grid).toHaveLength(6)
    expect(grid.every((week) => week.length === 7)).toBe(true)
  })

  it('has no leading days when the month starts on Monday', () => {
    const grid = buildMonthGrid(2026, 6)

    expect(grid[0]?.[0]).toBe('2026-06-01')
  })

  it('can be only four weeks (February 2027 starts on Monday)', () => {
    const grid = buildMonthGrid(2027, 2)

    expect(grid).toHaveLength(4)
    expect(grid[0]?.[0]).toBe('2027-02-01')
    expect(grid[3]?.[6]).toBe('2027-02-28')
  })

  it('crosses the year boundary', () => {
    const grid = buildMonthGrid(2027, 1)

    expect(grid[0]?.[0]).toBe('2026-12-28')
  })
})
