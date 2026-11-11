import { StrictMode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toISODate } from '../../shared/lib/date'
import { axe } from '../../test/axe'
import { createTask, type Task } from './task-model'
import { TasksPage } from './TasksPage'
import { TasksProvider } from './TasksProvider'

function renderPage(initialTasks: Task[] = []) {
  const user = userEvent.setup()
  const view = render(
    // StrictMode like main.tsx: it double-runs effects in development and exposes bugs
    <StrictMode>
      <TasksProvider initialTasks={initialTasks}>
        <TasksPage />
      </TasksProvider>
    </StrictMode>,
  )
  return { user, ...view }
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
    const { user } = renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(titleInput()).toHaveAttribute('aria-invalid', 'true')
    expect(titleInput()).toHaveAccessibleDescription('Escribe qué hay que hacer.')
    expect(titleInput()).toHaveFocus()
  })

  it('previews the Eisenhower quadrant while choosing the priority', async () => {
    const { user } = renderPage()
    const priority = screen.getByRole('group', { name: 'Prioridad' })
    expect(priority).toHaveAccessibleDescription('Va en: Cuando se pueda')

    await user.click(screen.getByRole('checkbox', { name: 'Importante' }))
    expect(priority).toHaveAccessibleDescription('Va en: Planear')

    await user.click(screen.getByRole('checkbox', { name: 'Urgente' }))
    expect(priority).toHaveAccessibleDescription('Va en: Hacer ya')
  })

  it('adds a task to its quadrant, announces it and resets the form', async () => {
    const { user } = renderPage()

    await user.type(titleInput(), 'Comprar pastel de cumpleaños')
    await user.click(screen.getByRole('checkbox', { name: 'Importante' }))
    await user.click(screen.getByRole('checkbox', { name: 'Urgente' }))
    await user.type(screen.getByLabelText(/fecha límite/i), '2026-11-13')
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    const task = within(quadrant('Hacer ya')).getByRole('checkbox', {
      name: 'Comprar pastel de cumpleaños',
    })
    expect(task).not.toBeChecked()
    expect(within(quadrant('Hacer ya')).getByText(/vie 13 de nov/i)).toBeInTheDocument()
    expect(pendingTab()).toHaveTextContent('(1)')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Tarea agregada: «Comprar pastel de cumpleaños».',
    )
    expect(titleInput()).toHaveValue('')
    // RHF setFocus moves focus on the next tick
    await waitFor(() => expect(titleInput()).toHaveFocus())
    // The reset form must be clean, not showing the "required" error
    expect(titleInput()).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Escribe qué hay que hacer.')).not.toBeInTheDocument()
  })

  it('completes a task, moves it to the done tab and can undo', async () => {
    const task = createTask(
      { title: 'Pagar la luz', notes: '', important: true, urgent: false, dueDate: null },
      'a',
      '2026-11-10T10:00:00.000Z',
    )
    const { user } = renderPage([task])

    await user.click(screen.getByRole('checkbox', { name: 'Pagar la luz' }))

    expect(screen.getByText('No hay pendientes. ¡A descansar!')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('«Pagar la luz» terminada.')
    expect(screen.getByRole('button', { name: 'Deshacer' })).toHaveFocus()

    await user.click(doneTab())
    expect(screen.getByRole('checkbox', { name: 'Pagar la luz' })).toBeChecked()
    expect(screen.getByText(/terminada el/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    await user.click(pendingTab())
    expect(
      within(quadrant('Planear')).getByRole('checkbox', { name: 'Pagar la luz' }),
    ).not.toBeChecked()
  })

  it('deletes a task and restores it with undo', async () => {
    const task = createTask(
      { title: 'Lavar el coche', notes: '', important: false, urgent: false, dueDate: null },
      'b',
      '2026-11-10T10:00:00.000Z',
    )
    const { user } = renderPage([task])

    await user.click(screen.getByRole('button', { name: 'Eliminar «Lavar el coche»' }))
    expect(screen.queryByRole('checkbox', { name: 'Lavar el coche' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Se eliminó «Lavar el coche».')

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(screen.getByRole('checkbox', { name: 'Lavar el coche' })).toBeInTheDocument()
  })

  it('marks overdue tasks', () => {
    const overdue = createTask(
      {
        title: 'Renovar licencia',
        notes: '',
        important: true,
        urgent: true,
        dueDate: toISODate(2026, 11, 9),
      },
      'c',
      '2026-11-01T10:00:00.000Z',
    )
    renderPage([overdue])

    expect(within(quadrant('Hacer ya')).getByText(/vencida/i)).toBeInTheDocument()
  })

  it('has no accessibility violations with tasks and errors on screen', async () => {
    const task = createTask(
      { title: 'Ir al súper', notes: 'Leche y pan', important: false, urgent: true, dueDate: null },
      'd',
      '2026-11-10T10:00:00.000Z',
    )
    const { user, container } = renderPage([task])
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(await axe(container)).toHaveNoViolations()
  })
})
