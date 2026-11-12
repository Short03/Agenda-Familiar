import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { toISODate, type ISODate } from '../../shared/lib/date'
import { createTask, type Task } from '../tasks/task-model'
import { axe } from '../../test/axe'
import { MEXICAN_SPECIAL_DAYS } from '../special-days/mexico'
import { DEFAULT_PREFERENCES, type SpecialDayPreferences } from '../special-days/types'
import { MonthCalendar } from './MonthCalendar'

const TODAY = toISODate(2026, 11, 11) // Wednesday

function renderCalendar(
  preferences: SpecialDayPreferences = DEFAULT_PREFERENCES,
  tasks: readonly Task[] = [],
) {
  const onHideDay = vi.fn<(id: string) => void>()
  const onToggleTask = vi.fn<(task: Task) => void>()
  const onAddTask = vi
    .fn<(date: ISODate, title: string) => Promise<boolean>>()
    .mockResolvedValue(true)
  const user = userEvent.setup()
  const view = render(
    <MonthCalendar
      specialDays={MEXICAN_SPECIAL_DAYS}
      preferences={preferences}
      tasks={tasks}
      today={TODAY}
      onHideDay={onHideDay}
      onToggleTask={onToggleTask}
      onAddTask={onAddTask}
    />,
  )
  return { user, onHideDay, onToggleTask, onAddTask, container: view.container }
}

const monthHeading = () => screen.getByRole('heading', { level: 2 })
const dayButton = (date: string) =>
  screen.getByRole('grid').querySelector<HTMLButtonElement>(`[data-date="${date}"]`)

describe('MonthCalendar', () => {
  it('shows the current month, Monday first, with today marked', () => {
    renderCalendar()

    expect(monthHeading()).toHaveTextContent('noviembre de 2026')
    const headers = within(screen.getByRole('grid')).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([
      'lun',
      'mar',
      'mié',
      'jue',
      'vie',
      'sáb',
      'dom',
    ])
    expect(dayButton('2026-11-11')).toHaveAttribute('aria-current', 'date')
  })

  it('keeps only the selected day in the tab order (roving tabindex)', () => {
    renderCalendar()

    const tabbable = screen.getByRole('grid').querySelectorAll('button[tabindex="0"]')
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toHaveAttribute('data-date', '2026-11-11')
  })

  it('includes special days in the accessible name of the day', () => {
    renderCalendar()

    expect(dayButton('2026-11-16')).toHaveAccessibleName(
      expect.stringContaining('Día de la Revolución'),
    )
  })

  it('moves with the arrow keys and focus follows', async () => {
    const { user } = renderCalendar()
    dayButton('2026-11-11')?.focus()

    await user.keyboard('{ArrowRight}')
    expect(dayButton('2026-11-12')).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(dayButton('2026-11-19')).toHaveFocus()

    await user.keyboard('{ArrowLeft}{ArrowUp}')
    expect(dayButton('2026-11-11')).toHaveFocus()
  })

  it('jumps to the start and end of the week with Home and End', async () => {
    const { user } = renderCalendar()
    dayButton('2026-11-11')?.focus()

    await user.keyboard('{Home}')
    expect(dayButton('2026-11-09')).toHaveFocus()

    await user.keyboard('{End}')
    expect(dayButton('2026-11-15')).toHaveFocus()
  })

  it('changes month with PageDown and when arrows leave the month', async () => {
    const { user } = renderCalendar()
    dayButton('2026-11-11')?.focus()

    await user.keyboard('{PageDown}')
    expect(monthHeading()).toHaveTextContent('diciembre de 2026')
    expect(dayButton('2026-12-11')).toHaveFocus()

    await user.keyboard('{PageUp}{PageUp}')
    expect(monthHeading()).toHaveTextContent('octubre de 2026')

    // Oct 31 + 1 day crosses into November
    await user.click(dayButton('2026-10-31')!)
    await user.keyboard('{ArrowRight}')
    expect(monthHeading()).toHaveTextContent('noviembre de 2026')
    expect(dayButton('2026-11-01')).toHaveFocus()
  })

  it('navigates with the buttons and returns to today', async () => {
    const { user } = renderCalendar()

    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }))
    expect(monthHeading()).toHaveTextContent('enero de 2027')

    await user.click(screen.getByRole('button', { name: 'Hoy' }))
    expect(monthHeading()).toHaveTextContent('noviembre de 2026')
  })

  it('shows the details of the selected day and lets you hide a special day', async () => {
    const { user, onHideDay } = renderCalendar()

    await user.click(dayButton('2026-11-16')!)

    const details = screen.getByRole('region', { name: /lunes, 16 de noviembre de 2026/i })
    expect(within(details).getByText('Día de la Revolución')).toBeInTheDocument()
    expect(within(details).getByText('Descanso oficial')).toBeInTheDocument()

    await user.click(within(details).getByRole('button', { name: 'Ocultar Día de la Revolución' }))
    expect(onHideDay).toHaveBeenCalledWith('mx-revolution-day')
  })

  it('shows an empty state for a day without special days', async () => {
    const { user } = renderCalendar()

    await user.click(dayButton('2026-11-10')!)

    expect(screen.getByText('Sin fechas especiales.')).toBeInTheDocument()
  })

  it('respects hidden categories', () => {
    renderCalendar({ hiddenCategories: ['oficial'], hiddenDayIds: [] })

    expect(dayButton('2026-11-16')).not.toHaveAccessibleName(expect.stringContaining('Revolución'))
  })

  it('has no accessibility violations', async () => {
    const { container } = renderCalendar()

    expect(await axe(container)).toHaveNoViolations()
  })
  describe('tasks', () => {
    const bakeCake = createTask(
      {
        title: 'Hornear pastel',
        notes: '',
        important: true,
        urgent: true,
        dueDate: toISODate(2026, 11, 20),
      },
      't1',
      '2026-11-11T10:00:00.000Z',
    )
    const buyCandles = createTask(
      {
        title: 'Comprar velas',
        notes: '',
        important: false,
        urgent: false,
        dueDate: toISODate(2026, 11, 20),
      },
      't2',
      '2026-11-11T10:00:00.000Z',
    )

    it('announces pending tasks in the day name and lists them in the details', async () => {
      const { user } = renderCalendar(DEFAULT_PREFERENCES, [bakeCake, buyCandles])

      expect(dayButton('2026-11-20')).toHaveAccessibleName(
        expect.stringContaining('2 tareas pendientes'),
      )

      await user.click(dayButton('2026-11-20')!)
      const details = screen.getByRole('region', { name: /20 de noviembre/i })
      expect(within(details).getByRole('checkbox', { name: /Hornear pastel/ })).not.toBeChecked()
      expect(within(details).getByText('Hacer ya')).toBeInTheDocument()
    })

    it('toggles a task from the day details', async () => {
      const { user, onToggleTask } = renderCalendar(DEFAULT_PREFERENCES, [bakeCake])
      await user.click(dayButton('2026-11-20')!)

      await user.click(screen.getByRole('checkbox', { name: /Hornear pastel/ }))

      expect(onToggleTask).toHaveBeenCalledWith(bakeCake)
    })

    it('adds a task for the selected day', async () => {
      const { user, onAddTask } = renderCalendar()
      await user.click(dayButton('2026-11-20')!)

      await user.type(
        screen.getByRole('textbox', { name: 'Nueva tarea para este día' }),
        '  Inflar globos ',
      )
      await user.click(screen.getByRole('button', { name: 'Agregar tarea a este día' }))

      expect(onAddTask).toHaveBeenCalledWith('2026-11-20', 'Inflar globos')
      expect(screen.getByRole('textbox', { name: 'Nueva tarea para este día' })).toHaveValue('')
    })

    it('does not add an empty task', async () => {
      const { user, onAddTask } = renderCalendar()

      await user.click(screen.getByRole('button', { name: 'Agregar tarea a este día' }))

      expect(onAddTask).not.toHaveBeenCalled()
      expect(
        screen.getByRole('textbox', { name: 'Nueva tarea para este día' }),
      ).toHaveAccessibleDescription('Escribe qué hay que hacer.')
    })
  })
})
