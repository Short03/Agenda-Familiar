import { freezeToday } from '../support/constants'

const BACKUP_FILE = 'cypress/downloads/agenda-familiar-2026-11-16.json'

describe('Backup', () => {
  // Cypress empties the downloads folder before each run (trashAssetsBeforeRuns).
  beforeEach(freezeToday)

  it('saves a backup, and restores it on an empty phone', () => {
    // 1. Some data
    cy.visitApp('/tareas')
    cy.findByRole('textbox', { name: '¿Qué hay que hacer?' }).type('Pagar la luz{enter}')
    cy.findByRole('checkbox', { name: 'Pagar la luz' }).should('exist')
    cy.findByRole('link', { name: 'Ajustes' }).click()
    cy.findByRole('textbox', { name: 'Nombre' }).type('Aniversario')
    cy.findByLabelText('Fecha').type('2019-03-02')
    cy.findByRole('button', { name: 'Agregar fecha' }).click()
    cy.findByRole('list', { name: 'Fechas guardadas' }).should('contain.text', 'Aniversario')

    // 2. Save the backup file
    cy.findByRole('button', { name: 'Guardar respaldo' }).click()
    cy.readFile(BACKUP_FILE).should((backup: { app: string; tasks: unknown[] }) => {
      expect(backup.app).to.equal('agenda-familiar')
      expect(backup.tasks).to.have.length(1)
    })

    // 3. A brand-new, empty app (another phone, or a reinstall)
    cy.visitApp('/ajustes')
    cy.findByText('Todavía no hay fechas de la familia.').should('exist')

    // 4. Restore
    cy.get('input[type="file"]').selectFile(BACKUP_FILE, { force: true })
    cy.findAllByRole('status').should(
      'contain.text',
      'Respaldo cargado: 1 tareas y 1 fechas actualizadas.',
    )
    cy.findByRole('list', { name: 'Fechas guardadas' }).should('contain.text', 'Aniversario')
    cy.findByRole('link', { name: 'Tareas' }).click()
    cy.findByRole('checkbox', { name: 'Pagar la luz' }).should('exist')
  })

  it('rejects a file that is not a backup', () => {
    cy.visitApp('/ajustes')

    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('{"app":"otra"}'), fileName: 'otra.json' },
      { force: true },
    )

    cy.findAllByRole('status').should(
      'contain.text',
      'El archivo no es un respaldo de Agenda familiar o está dañado.',
    )
  })
})
