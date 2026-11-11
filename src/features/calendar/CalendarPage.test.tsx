import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../test/axe'
import { CalendarPage } from './CalendarPage'

const details = () => screen.getByRole('region', { name: /16 de noviembre de 2026/i })

describe('CalendarPage', () => {
  beforeEach(() => {
    // Fake only Date, so user-event timers still work.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 16, 10, 0)) // Revolution Day 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hides and shows a whole category from the filters', async () => {
    const user = userEvent.setup()
    render(<CalendarPage />)
    expect(within(details()).getByText('Día de la Revolución')).toBeInTheDocument()

    await user.click(screen.getByText('Filtros del calendario'))
    const officialSwitch = screen.getByRole('switch', { name: 'Descanso oficial' })
    await user.click(officialSwitch)

    expect(officialSwitch).not.toBeChecked()
    expect(within(details()).queryByText('Día de la Revolución')).not.toBeInTheDocument()

    await user.click(officialSwitch)
    expect(within(details()).getByText('Día de la Revolución')).toBeInTheDocument()
  })

  it('hides a single day and restores it from the hidden list', async () => {
    const user = userEvent.setup()
    render(<CalendarPage />)

    await user.click(
      within(details()).getByRole('button', { name: 'Ocultar Día de la Revolución' }),
    )
    expect(within(details()).queryByText('Día de la Revolución')).not.toBeInTheDocument()

    await user.click(screen.getByText('Filtros del calendario'))
    await user.click(screen.getByRole('button', { name: 'Mostrar Día de la Revolución' }))

    expect(within(details()).getByText('Día de la Revolución')).toBeInTheDocument()
    expect(screen.getByText('No has ocultado ninguna fecha.')).toBeInTheDocument()
  })

  it('has no accessibility violations with the filters open', async () => {
    const user = userEvent.setup()
    const { container } = render(<CalendarPage />)
    await user.click(screen.getByText('Filtros del calendario'))

    expect(await axe(container)).toHaveNoViolations()
  })
})
