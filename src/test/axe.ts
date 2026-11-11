import { configureAxe } from 'vitest-axe'

/**
 * jsdom does not render pixels, so axe cannot measure color contrast here.
 * Contrast is checked in a real browser (axe DevTools now, Playwright/Cypress + axe later).
 */
export const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})
