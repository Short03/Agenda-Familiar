/** Fixed "today" for every spec: Monday, November 16, 2026 (Revolution Day), 10:00 local. */
export const NOW = new Date(2026, 10, 16, 10, 0).getTime()

/** Only fake Date: Dexie, React Hook Form and Cypress itself still need real timers. */
export const freezeToday = () => cy.clock(NOW, ['Date'])
