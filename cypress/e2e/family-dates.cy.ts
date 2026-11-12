import { freezeToday } from '../support/constants'

describe('Family dates on the calendar', () => {
  beforeEach(freezeToday)

  it('adds a birthday in Settings and shows it, with the age, on the calendar', () => {
    cy.visitApp('/ajustes')

    cy.findByRole('textbox', { name: 'Nombre' }).type('Cumpleaños de prueba')
    cy.findByLabelText('Fecha').type('1996-11-20')
    cy.findByRole('button', { name: 'Agregar fecha' }).click()
    cy.findByRole('list', { name: 'Fechas guardadas' }).should(
      'contain.text',
      '20 de noviembre · desde 1996',
    )

    cy.findByRole('link', { name: 'Calendario' }).click()
    cy.findByRole('button', { name: /20 de noviembre, Cumpleaños de prueba/ }).click()
    cy.findByRole('region', { name: /20 de noviembre de 2026/ })
      .should('contain.text', 'Cumpleaños de prueba')
      .and('contain.text', 'Cumple 30')
  })

  it('remembers hidden categories after closing the app', () => {
    cy.visitApp('/calendario')
    cy.findByRole('region', { name: /16 de noviembre de 2026/ }).should(
      'contain.text',
      'Día de la Revolución',
    )

    cy.contains('summary', 'Filtros del calendario').click()
    cy.findByRole('switch', { name: 'Descanso oficial' }).click().should('not.be.checked')
    cy.findByRole('region', { name: /16 de noviembre de 2026/ }).should(
      'contain.text',
      'Sin fechas especiales.',
    )

    cy.visitApp('/calendario', { keepData: true })
    cy.findByRole('region', { name: /16 de noviembre de 2026/ }).should(
      'contain.text',
      'Sin fechas especiales.',
    )
  })

  it('moves through the calendar with the keyboard', () => {
    cy.visitApp('/calendario')

    cy.findByRole('button', { name: /16 de noviembre, hoy/ }).focus()
    cy.press(Cypress.Keyboard.Keys.RIGHT)
    cy.focused().should('have.attr', 'data-date', '2026-11-17')
    cy.press(Cypress.Keyboard.Keys.PAGEDOWN)
    cy.focused().should('have.attr', 'data-date', '2026-12-17')
    cy.findByRole('heading', { level: 2, name: /diciembre de 2026/ }).should('exist')
  })
})
