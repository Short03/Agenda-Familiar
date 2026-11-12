import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // E2E runs against the production build (`pnpm build`, then `vite preview`),
    // the same code that gets deployed, service worker included.
    baseUrl: 'http://localhost:4173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    downloadsFolder: 'cypress/downloads',
    // iPhone 15 / 16 screen in CSS pixels: the device the app is built for.
    viewportWidth: 393,
    viewportHeight: 852,
    video: false,
    // One retry in CI hides rare infrastructure hiccups; locally a failure fails at once.
    retries: { runMode: 1, openMode: 0 },
    setupNodeEvents(on) {
      on('task', {
        log(message: unknown) {
          console.log(message)
          return null
        },
      })
    },
  },
})
