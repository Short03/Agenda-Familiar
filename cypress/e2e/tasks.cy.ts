import { freezeToday } from '../support/constants'

describe('Tasks', () => {
  beforeEach(freezeToday)

  it('adds a prioritized task, sees it on the calendar and completes it there', () => {
    cy.visitApp('/tareas')

    cy.findByRole('textbox', { name: '¿Qué hay que hacer?' }).type('Comprar pastel')
    cy.findByRole('checkbox', { name: 'Importante' }).check()
    cy.findByRole('checkbox', { name: 'Urgente' }).check()
    cy.findByRole('group', { name: 'Prioridad' }).should('contain.text', 'Va en: Hacer ya')
    cy.findByLabelText(/fecha límite/i).type('2026-11-20')
    cy.findByRole('button', { name: 'Agregar tarea' }).click()

    cy.findByRole('status').should('contain.text', 'Tarea agregada: «Comprar pastel».')
    cy.findByRole('region', { name: /hacer ya/i }).should('contain.text', 'Comprar pastel')
    cy.findByRole('textbox', { name: '¿Qué hay que hacer?' })
      .should('have.value', '')
      .and('have.focus')

    cy.findByRole('link', { name: 'Calendario' }).click()
    cy.findByRole('button', { name: /20 de noviembre, 1 tarea pendiente/ }).click()
    cy.findByRole('region', { name: /20 de noviembre de 2026/ }).within(() => {
      cy.findByRole('checkbox', { name: /Comprar pastel/ }).check()
    })

    cy.findByRole('link', { name: 'Tareas' }).click()
    cy.findByRole('tab', { name: /terminadas \(1\)/i }).click()
    cy.findByRole('checkbox', { name: 'Comprar pastel' }).should('be.checked')
  })

  it('adds a task from a calendar day and keeps it after closing the app', () => {
    cy.visitApp('/calendario')

    cy.findByRole('textbox', { name: 'Nueva tarea para este día' }).type('Desfile{enter}')
    cy.findByRole('region', { name: /16 de noviembre de 2026/ }).should('contain.text', 'Desfile')

    cy.visitApp('/tareas', { keepData: true })
    cy.findByRole('region', { name: /cuando se pueda/i }).should('contain.text', 'Desfile')
  })

  it('deletes a task and brings it back with undo', () => {
    cy.visitApp('/tareas')
    cy.findByRole('textbox', { name: '¿Qué hay que hacer?' }).type('Lavar el coche{enter}')
    cy.findByRole('checkbox', { name: 'Lavar el coche' }).should('exist')

    cy.findByRole('button', { name: 'Eliminar «Lavar el coche»' }).click()
    cy.findByRole('checkbox', { name: 'Lavar el coche' }).should('not.exist')
    cy.findByRole('button', { name: 'Deshacer' }).should('have.focus').click()
    cy.findByRole('checkbox', { name: 'Lavar el coche' }).should('exist')
  })
})
