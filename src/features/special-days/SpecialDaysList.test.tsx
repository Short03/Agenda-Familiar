import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from '../../test/axe'
import { MEXICAN_SPECIAL_DAYS } from './mexico'
import { SpecialDaysList } from './SpecialDaysList'
import type { SpecialDay } from './types'

const fictionalBirthday: SpecialDay = {
  id: 'family-test',
  name: 'Cumpleaños de prueba',
  category: 'familia',
  rule: { kind: 'fixed', month: 12, day: 3 },
  sinceYear: 1996,
}

const DAYS = [fictionalBirthday, ...MEXICAN_SPECIAL_DAYS]

describe('SpecialDaysList', () => {
  it('lists the special days of the initial month', () => {
    render(<SpecialDaysList days={DAYS} initialYear={2026} initialMonth={11} />)

    expect(screen.getByRole('heading', { name: /noviembre de 2026/i })).toBeInTheDocument()
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Día de Todos los Santos'),
      expect.stringContaining('Día de Muertos'),
      expect.stringContaining('Día de la Revolución'),
    ])
    expect(screen.getByText('Día de la Revolución').closest('li')).toContainElement(
      screen.getByText(/lunes 16/i),
    )
  })

  it('shows the age for family birthdays', async () => {
    const user = userEvent.setup()
    render(<SpecialDaysList days={DAYS} initialYear={2026} initialMonth={11} />)

    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }))

    expect(screen.getByRole('heading', { name: /diciembre de 2026/i })).toBeInTheDocument()
    expect(screen.getByText('Cumpleaños de prueba').closest('li')).toHaveTextContent('Cumple 30')
  })

  it('crosses into the previous year', async () => {
    const user = userEvent.setup()
    render(<SpecialDaysList days={DAYS} initialYear={2027} initialMonth={1} />)

    await user.click(screen.getByRole('button', { name: 'Mes anterior' }))

    expect(screen.getByRole('heading', { name: /diciembre de 2026/i })).toBeInTheDocument()
  })

  it('shows an empty state', () => {
    render(<SpecialDaysList days={[]} initialYear={2026} initialMonth={7} />)

    expect(screen.getByText('No hay fechas especiales este mes.')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SpecialDaysList days={DAYS} initialYear={2026} initialMonth={11} />,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
