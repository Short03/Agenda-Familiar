import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../db/db'
import { axe } from '../../test/axe'
import { createCustomDay } from '../special-days/custom-days'
import { TasksProvider } from '../tasks/TasksProvider'
import { CalendarPage } from './CalendarPage'

const details = () => screen.getByRole('region', { name: /16 de noviembre de 2026/i })

function renderPage() {
  const user = userEvent.setup()
  const view = render(
    <TasksProvider>
      <CalendarPage />
    </TasksProvider>,
  )
  return { user, ...view }
}

describe('CalendarPage', () => {
  beforeEach(() => {
    // Fake only Date, so user-event and Dexie timers still work.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 16, 10, 0)) // Revolution Day 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hides a whole category and remembers it after a reload', async () => {
    const { user, unmount } = renderPage()
    expect(within(details()).getByText('Día de la Revolución')).toBeInTheDocument()

    await user.click(screen.getByText('Filtros del calendario'))
    await user.click(screen.getByRole('switch', { name: 'Descanso oficial' }))

    await waitFor(() =>
      expect(within(details()).queryByText('Día de la Revolución')).not.toBeInTheDocument(),
    )

    unmount()
    renderPage()
    await waitFor(() => expect(screen.getByText('Sin fechas especiales.')).toBeInTheDocument())
  })

  it('hides a single day and restores it from the hidden list', async () => {
    const { user } = renderPage()

    await user.click(
      within(details()).getByRole('button', { name: 'Ocultar Día de la Revolución' }),
    )
    await waitFor(() =>
      expect(within(details()).queryByText('Día de la Revolución')).not.toBeInTheDocument(),
    )

    await user.click(screen.getByText('Filtros del calendario'))
    await user.click(screen.getByRole('button', { name: 'Mostrar Día de la Revolución' }))

    expect(await within(details()).findByText('Día de la Revolución')).toBeInTheDocument()
    expect(screen.getByText('No has ocultado ninguna fecha.')).toBeInTheDocument()
  })

  it('shows family days entered in the app, with the age', async () => {
    await db.specialDays.add(
      createCustomDay(
        { name: 'Cumpleaños de prueba', category: 'familia', month: 11, day: 16, sinceYear: 1996 },
        'fam-1',
        '2026-11-01T00:00:00.000Z',
      ),
    )
    renderPage()

    expect(await within(details()).findByText('Cumpleaños de prueba')).toBeInTheDocument()
    expect(within(details()).getByText(/cumple 30/i)).toBeInTheDocument()
  })

  it('adds a task to the selected day and saves it with that due date', async () => {
    const { user } = renderPage()

    await user.type(
      screen.getByRole('textbox', { name: 'Nueva tarea para este día' }),
      'Desfile con la niña',
    )
    await user.click(screen.getByRole('button', { name: 'Agregar tarea a este día' }))

    expect(
      await within(details()).findByRole('checkbox', { name: /Desfile con la niña/ }),
    ).toBeInTheDocument()
    expect(await db.tasks.toArray()).toMatchObject([
      { title: 'Desfile con la niña', dueDate: '2026-11-16' },
    ])
  })

  it('has no accessibility violations with the filters open', async () => {
    const { user, container } = renderPage()
    await user.click(screen.getByText('Filtros del calendario'))

    expect(await axe(container)).toHaveNoViolations()
  })
})
