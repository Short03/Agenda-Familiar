import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { db } from '../../db/db'
import { axe } from '../../test/axe'
import { SettingsPage } from './SettingsPage'

function renderPage() {
  const user = userEvent.setup()
  return { user, ...render(<SettingsPage />) }
}

const savedList = () => screen.getByRole('list', { name: 'Fechas guardadas' })

describe('SettingsPage', () => {
  it('adds a birthday that counts years and stores month, day and birth year', async () => {
    const { user } = renderPage()

    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Cumpleaños de prueba')
    await user.type(screen.getByLabelText('Fecha'), '2002-10-09')
    await user.click(screen.getByRole('button', { name: 'Agregar fecha' }))

    expect(
      await within(await screen.findByRole('list', { name: 'Fechas guardadas' })).findByText(
        'Cumpleaños de prueba',
      ),
    ).toBeInTheDocument()
    expect(within(savedList()).getByText('9 de octubre · desde 2002')).toBeInTheDocument()
    expect(await db.specialDays.toArray()).toMatchObject([
      {
        name: 'Cumpleaños de prueba',
        category: 'familia',
        rule: { month: 10, day: 9 },
        sinceYear: 2002,
      },
    ])
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveFocus())
  })

  it('adds a personal date without counting years', async () => {
    const { user } = renderPage()

    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Día del primer viaje')
    await user.type(screen.getByLabelText('Fecha'), '2020-06-15')
    await user.click(screen.getByRole('radio', { name: 'Personales' }))
    await user.click(screen.getByRole('checkbox', { name: /contar los años/i }))
    await user.click(screen.getByRole('button', { name: 'Agregar fecha' }))

    expect(await screen.findByText('15 de junio')).toBeInTheDocument()
    const [stored] = await db.specialDays.toArray()
    expect(stored).toMatchObject({ category: 'personal' })
    expect(stored).not.toHaveProperty('sinceYear')
  })

  it('validates the name and the date', async () => {
    const { user } = renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar fecha' }))

    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveAccessibleDescription(
      'Escribe un nombre.',
    )
    expect(screen.getByLabelText('Fecha')).toHaveAccessibleDescription('Elige una fecha.')
    expect(await db.specialDays.count()).toBe(0)
  })

  it('deletes a date and can undo it', async () => {
    const { user } = renderPage()
    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Aniversario')
    await user.type(screen.getByLabelText('Fecha'), '2019-03-02')
    await user.click(screen.getByRole('button', { name: 'Agregar fecha' }))
    await screen.findByText('Aniversario')

    await user.click(screen.getByRole('button', { name: 'Eliminar «Aniversario»' }))
    expect(await screen.findByText('Todavía no hay fechas de la familia.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(await screen.findByText('Aniversario')).toBeInTheDocument()
  })

  it('shows an error for a file that is not a backup', async () => {
    const { user } = renderPage()
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!

    await user.upload(
      fileInput,
      new File(['no soy json'], 'foto.json', { type: 'application/json' }),
    )

    expect(await screen.findByText('El archivo no es un respaldo válido.')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderPage()
    await screen.findByText(/este navegador no permite proteger los datos/i)

    expect(await axe(container)).toHaveNoViolations()
  })
})
