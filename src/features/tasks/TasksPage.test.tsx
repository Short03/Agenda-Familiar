import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../db/db'
import { toISODate } from '../../shared/lib/date'
import { axe } from '../../test/axe'
import { createTask, type NewTaskInput, type Task } from './task-model'
import { TasksPage } from './TasksPage'
import { TasksProvider } from './TasksProvider'

/** Seeds IndexedDB (fake-indexeddb in tests), then renders and waits for the first load. */
async function renderPage(seed: Task[] = []) {
  await db.tasks.bulkAdd(seed)
  const user = userEvent.setup()
  const view = render(
    // StrictMode like main.tsx: it double-runs effects in development and exposes bugs
    <StrictMode>
      <TasksProvider>
        <TasksPage />
      </TasksProvider>
    </StrictMode>,
  )
  await waitFor(() => expect(screen.queryByText('Cargando tareas…')).not.toBeInTheDocument())
  return { user, ...view }
}

let seq = 0
function seedTask(overrides: Partial<NewTaskInput> & { title: string }): Task {
  seq += 1
  return createTask(
    { notes: '', important: false, urgent: false, dueDate: null, ...overrides },
    `seed-${seq}`,
    '2026-11-10T10:00:00.000Z',
  )
}

const titleInput = () => screen.getByRole('textbox', { name: '¿Qué hay que hacer?' })
const pendingTab = () => screen.getByRole('tab', { name: /por hacer/i })
const doneTab = () => screen.getByRole('tab', { name: /terminadas/i })
const quadrant = (name: string) => screen.getByRole('region', { name: new RegExp(name, 'i') })

describe('TasksPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 11, 9, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a validation error and focuses the title when it is empty', async () => {
    const { user } = await renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(titleInput()).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput()).toHaveAccessibleDescription('Escribe qué hay que hacer.')
    expect(titleInput()).toHaveFocus()
  })

  it('previews the Eisenhower quadrant while choosing the priority', async () => {
    const { user } = await renderPage()
    const priority = screen.getByRole('group', { name: 'Prioridad' })
    expect(priority).toHaveAccessibleDescription('Va en: Cuando se pueda')

    await user.click(screen.getByRole('checkbox', { name: 'Importante' }))
    expect(priority).toHaveAccessibleDescription('Va en: Planear')

    await user.click(screen.getByRole('checkbox', { name: 'Urgente' }))
    expect(priority).toHaveAccessibleDescription('Va en: Hacer ya')
  })

  it('adds a task, saves it in IndexedDB and resets the form', async () => {
    const { user } = await renderPage()

    await user.type(titleInput(), 'Comprar pastel de cumpleaños')
    await user.click(screen.getByRole('checkbox', { name: 'Importante' }))
    await user.click(screen.getByRole('checkbox', { name: 'Urgente' }))
    await user.type(screen.getByLabelText(/fecha límite/i), '2026-11-13')
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    const doNow = await screen.findByRole('region', { name: /hacer ya/i })
    const task = within(doNow).getByRole('checkbox', {
      name: 'Comprar pastel de cumpleaños',
    })
    expect(task).not.toBeChecked()
    expect(within(quadrant('Hacer ya')).getByText(/vie 13 de nov/i)).toBeInTheDocument()
    expect(pendingTab()).toHaveTextContent('(1)')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Tarea agregada: «Comprar pastel de cumpleaños».',
    )

    // Persisted, not only in React state
    const stored = await db.tasks.toArray()
    expect(stored).toMatchObject([
      {
        title: 'Comprar pastel de cumpleaños',
        important: true,
        urgent: true,
        dueDate: '2026-11-13',
      },
    ])

    await waitFor(() => expect(titleInput()).toHaveFocus())
    expect(titleInput()).toHaveValue('')
    expect(titleInput()).not.toHaveAttribute('aria-invalid')
  })

  it('keeps what was typed when saving fails', async () => {
    const { user } = await renderPage()
    const addSpy = vi.spyOn(db.tasks, 'add').mockRejectedValueOnce(new Error('QuotaExceeded'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await user.type(titleInput(), 'No perder esto')
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(await screen.findByText('No se pudo guardar. Intenta de nuevo.')).toBeInTheDocument()
    expect(titleInput()).toHaveValue('No perder esto')
    expect(addSpy).toHaveBeenCalledOnce()
  })

  it('loads saved tasks after a reload', async () => {
    const { unmount } = await renderPage([seedTask({ title: 'Sigo aquí', important: true })])
    unmount()

    await renderPage()

    expect(
      within(quadrant('Planear')).getByRole('checkbox', { name: 'Sigo aquí' }),
    ).toBeInTheDocument()
  })

  it('completes a task, moves it to the done tab and can undo', async () => {
    const { user } = await renderPage([seedTask({ title: 'Pagar la luz', important: true })])

    await user.click(screen.getByRole('checkbox', { name: 'Pagar la luz' }))

    expect(await screen.findByText('No hay pendientes. ¡A descansar!')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('«Pagar la luz» terminada.')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Deshacer' })).toHaveFocus())

    await user.click(doneTab())
    expect(screen.getByRole('checkbox', { name: 'Pagar la luz' })).toBeChecked()
    expect(screen.getByText(/terminada el/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    await user.click(pendingTab())
    expect(
      await within(quadrant('Planear')).findByRole('checkbox', { name: 'Pagar la luz' }),
    ).not.toBeChecked()
  })

  it('soft deletes a task and restores it with undo', async () => {
    const { user } = await renderPage([seedTask({ title: 'Lavar el coche' })])

    await user.click(screen.getByRole('button', { name: 'Eliminar «Lavar el coche»' }))
    await waitFor(() =>
      expect(screen.queryByRole('checkbox', { name: 'Lavar el coche' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('status')).toHaveTextContent('Se eliminó «Lavar el coche».')
    // Still in the database, marked as deleted (so the deletion can sync later)
    expect((await db.tasks.toArray())[0]?.deletedAt).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(await screen.findByRole('checkbox', { name: 'Lavar el coche' })).toBeInTheDocument()
  })

  it('marks overdue tasks', async () => {
    await renderPage([
      seedTask({
        title: 'Renovar licencia',
        important: true,
        urgent: true,
        dueDate: toISODate(2026, 11, 9),
      }),
    ])

    expect(within(quadrant('Hacer ya')).getByText(/vencida/i)).toBeInTheDocument()
  })

  it('has no accessibility violations with tasks and errors on screen', async () => {
    const { user, container } = await renderPage([
      seedTask({ title: 'Ir al súper', notes: 'Leche y pan', urgent: true }),
    ])
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})
