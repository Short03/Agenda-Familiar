import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import { db } from '../db/db'

expect.extend(axeMatchers)

afterEach(async () => {
  // Unmount first, so live queries stop before the tables are emptied.
  cleanup()
  // Every test starts with an empty database (fake-indexeddb lives in memory).
  await Promise.all(db.tables.map((table) => table.clear()))
})
