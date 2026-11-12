import { freezeToday } from '../support/constants'

describe('Navigation and themes', () => {
  beforeEach(freezeToday)

  it('opens on the calendar and moves between sections', () => {
    cy.visitApp('/')

    cy.location('pathname').should('eq', '/calendario')
    cy.findByRole('heading', { level: 1, name: 'Calendario' }).should('exist')
    cy.title().should('eq', 'Calendario · Agenda familiar')

    cy.findByRole('link', { name: 'Tareas' }).click()
    cy.findByRole('heading', { level: 1, name: 'Tareas' }).should('have.focus')
    cy.findByRole('link', { name: 'Tareas' }).should('have.attr', 'aria-current', 'page')

    cy.findByRole('link', { name: 'Ajustes' }).click()
    cy.findByRole('heading', { level: 1, name: 'Ajustes' }).should('have.focus')
  })

  it('offers a skip link as the first keyboard stop', () => {
    cy.visitApp('/calendario')
    cy.findByRole('heading', { level: 1, name: 'Calendario' })

    cy.press(Cypress.Keyboard.Keys.TAB)
    cy.focused().should('have.text', 'Saltar al contenido').and('be.visible')
  })

  it('switches theme and keeps it after closing the app, with no flash', () => {
    cy.visitApp('/calendario')

    cy.findByRole('button', { name: 'Cambiar a tema Aventura' }).click()
    cy.get('html').should('have.attr', 'data-theme', 'aventura')
    cy.get('meta[name="theme-color"]').should('have.attr', 'content', '#0f2418')

    // Reload: the inline script must apply the theme before React even starts.
    cy.reload()
    cy.document().its('documentElement.dataset.theme').should('eq', 'aventura')
    cy.findByRole('button', { name: 'Cambiar a tema Kawaii' }).should('exist')
  })

  it('shows a friendly page for unknown addresses', () => {
    cy.visitApp('/no-existe')

    cy.findByRole('heading', { level: 1, name: 'Página no encontrada' }).should('exist')
    cy.findByRole('link', { name: 'Ir al calendario' }).click()
    cy.location('pathname').should('eq', '/calendario')
  })
})
