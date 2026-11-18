/**
 * The only spec with the real service worker. It proves the app opens with no network,
 * which unit tests cannot do (there is no service worker in jsdom or in `pnpm dev`).
 *
 * It runs in its own Cypress run (`pnpm e2e:run`). After the other specs, Chrome keeps
 * state that Storage.clearDataForOrigin does not reset, and the worker stopped answering
 * navigations. In a fresh browser it passes every time.
 */
describe('Offline app (PWA)', () => {
  // No frozen clock: nothing in this spec depends on today's date.

  it('serves a valid web manifest with the app icons', () => {
    cy.request('/manifest.webmanifest')
      .its('body')
      .should((manifest) => {
        expect(manifest).to.include({
          name: 'Agenda familiar',
          display: 'standalone',
          lang: 'es-MX',
        })
        expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).to.include.members([
          '192x192',
          '512x512',
        ])
      })
  })

  it('installs the service worker, then opens every page without network', () => {
    cy.visitApp('/calendario', { serviceWorker: true })

    // First install: the worker activates and precaches every file of the build.
    cy.window().then((win) => win.navigator.serviceWorker.ready)
    cy.window()
      .then(async (win) => {
        const cache = await win.caches.open(`workbox-precache-v2-${win.location.origin}/`)
        return (await cache.keys()).map((request) => new URL(request.url).pathname)
      })
      .should((paths: string[]) => {
        expect(paths).to.include('/index.html')
        expect(paths.some((p) => p.includes('TasksPage'))).to.equal(true)
      })
    // ...and the app tells the person it can be used offline.
    cy.contains('Lista para usarse sin internet.', { timeout: 20_000 }).should('be.visible')

    // The worker is active now; pages opened from here on are served by it.
    // Cut the network: every request that reaches the server now fails.
    cy.intercept({ url: '**', middleware: true }, (req) => req.reply({ forceNetworkError: true }))

    // Prove the network is really gone: a file that is not precached cannot load.
    cy.window()
      .then((win) =>
        win.fetch(`/manifest.webmanifest?offline-check=${Date.now()}`).then(
          () => 'online',
          () => 'offline',
        ),
      )
      .should('equal', 'offline')

    for (const [path, heading] of [
      ['/calendario', 'Calendario'],
      ['/tareas', 'Tareas'],
      ['/ajustes', 'Ajustes'],
    ] as const) {
      // Open each page in an iframe: a real navigation that the service worker answers
      // from its cache. Navigating the main page instead (cy.visit or location.assign)
      // goes through Cypress's own page-load handling, which made this test flaky.
      const frameId = `offline-${path.slice(1)}`
      cy.document().then((doc) => {
        const frame = doc.createElement('iframe')
        frame.id = frameId
        frame.title = heading
        frame.src = path
        doc.body.append(frame)
      })
      cy.get(`#${frameId}`, { timeout: 15_000 })
        .its('0.contentDocument.body')
        .find('h1', { timeout: 15_000 })
        .should('have.text', heading)
    }
  })
})
