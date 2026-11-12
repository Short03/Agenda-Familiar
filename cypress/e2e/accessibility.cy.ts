import { freezeToday } from '../support/constants'

/**
 * jsdom cannot measure color contrast (unit tests disable that rule). A real browser can:
 * this audits every page in both themes, contrast included, with real fonts and layout.
 */
const PAGES = [
  { path: '/calendario', heading: 'Calendario' },
  { path: '/tareas', heading: 'Tareas' },
  { path: '/ajustes', heading: 'Ajustes' },
] as const

const THEMES = ['kawaii', 'aventura'] as const

describe('Accessibility (WCAG 2.2 AA) in a real browser', () => {
  beforeEach(freezeToday)

  for (const theme of THEMES) {
    for (const { path, heading } of PAGES) {
      it(`${heading} in the ${theme} theme has no violations`, () => {
        cy.visitApp(path, { theme })
        cy.findByRole('heading', { level: 1, name: heading }).should('exist')
        cy.checkPageA11y()
      })
    }

    it(`forms with errors and open filters have no violations (${theme})`, () => {
      cy.visitApp('/tareas', { theme })
      cy.findByRole('button', { name: 'Agregar tarea' }).click()
      cy.findByText('Escribe qué hay que hacer.').should('be.visible')
      cy.checkPageA11y()

      cy.findByRole('link', { name: 'Calendario' }).click()
      cy.contains('summary', 'Filtros del calendario').click()
      cy.findByRole('switch', { name: 'Descanso oficial' }).should('be.visible')
      cy.checkPageA11y()
    })
  }
})
