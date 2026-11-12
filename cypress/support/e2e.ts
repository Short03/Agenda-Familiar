import '@testing-library/cypress/add-commands'
import 'cypress-axe'
import type { Result } from 'axe-core'

type Theme = 'kawaii' | 'aventura'

interface VisitAppOptions {
  /** Theme saved before the app loads. */
  theme?: Theme
  /** Keep IndexedDB from the previous visit (to test that data survives a reload). */
  keepData?: boolean
  /** Let the real service worker register (only the PWA spec needs it). */
  serviceWorker?: boolean
}

declare global {
  namespace Cypress {
    interface Chainable {
      /** Visits a page with a clean, predictable app state. */
      visitApp(path: string, options?: VisitAppOptions): Chainable<AUTWindow>
      /** Full WCAG 2.2 AA audit in a real browser (color contrast included). */
      checkPageA11y(): Chainable<void>
    }
  }
}

/**
 * Cypress test isolation clears cookies and localStorage, but NOT service workers,
 * Cache Storage or IndexedDB. A worker left by an earlier test (or an earlier run: the
 * Cypress browser profile is reused) would keep serving an old build from its cache.
 * Chrome DevTools Protocol wipes them for our origin before every test.
 */
beforeEach(() => {
  const origin = new URL(Cypress.config('baseUrl') ?? '').origin
  cy.wrap(
    Cypress.automation('remote:debugger:protocol', {
      command: 'Storage.clearDataForOrigin',
      params: { origin, storageTypes: 'service_workers,cache_storage,indexeddb' },
    }),
    { log: false },
  )
})

Cypress.Commands.add('visitApp', (path: string, options: VisitAppOptions = {}) => {
  const { theme = 'kawaii', keepData = false, serviceWorker = false } = options
  return cy.visit(path, {
    onBeforeLoad(win) {
      // Cypress clears localStorage between tests, but not IndexedDB.
      // deleteDatabase is queued before the app opens it, so the app starts empty.
      if (!keepData) win.indexedDB.deleteDatabase('agenda-familiar')
      win.localStorage.setItem('theme', theme)

      // Desktop Chrome supports the Web Share API: the backup would open the OS share
      // dialog and block the test. Force the download path instead.
      Object.defineProperty(win.navigator, 'canShare', { value: () => false })

      // Most specs test features, not caching: without a service worker, every visit
      // gets the current build and no "offline ready" banner covers the page.
      if (!serviceWorker) {
        Object.defineProperty(win.navigator, 'serviceWorker', { value: undefined })
      }
    },
  })
})

function logViolations(violations: Result[]) {
  cy.task(
    'log',
    violations.map(({ id, impact, nodes }) => `${impact ?? ''} ${id}: ${nodes.length} node(s)`),
  )
}

Cypress.Commands.add('checkPageA11y', () => {
  cy.injectAxe()
  cy.checkA11y(
    undefined,
    { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } },
    logViolations,
  )
})
