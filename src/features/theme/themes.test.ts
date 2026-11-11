import { describe, expect, it } from 'vitest'
import { isTheme, nextTheme, THEMES } from './themes'

describe('isTheme', () => {
  it.each(THEMES)('accepts the known theme %s', (theme) => {
    expect(isTheme(theme)).toBe(true)
  })

  it.each([['zelda'], [''], ['KAWAII'], [null], [undefined], [42], [{}]])('rejects %j', (value) => {
    expect(isTheme(value)).toBe(false)
  })
})

describe('nextTheme', () => {
  it('cycles through every theme and wraps around', () => {
    expect(nextTheme('kawaii')).toBe('aventura')
    expect(nextTheme('aventura')).toBe('kawaii')
  })
})
