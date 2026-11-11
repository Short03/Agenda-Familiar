import { afterEach, describe, expect, it, vi } from 'vitest'
import { createId } from './id'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('createId', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a UUID v4', () => {
    expect(createId()).toMatch(UUID_V4)
  })

  it('returns different ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createId()))
    expect(ids.size).toBe(100)
  })

  it('works without crypto.randomUUID (insecure context, e.g. iPhone on the LAN)', () => {
    const realCrypto = globalThis.crypto
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array<ArrayBuffer>) => realCrypto.getRandomValues(array),
    })

    expect(createId()).toMatch(UUID_V4)
  })
})
