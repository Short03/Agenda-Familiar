import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dataset.theme = 'kawaii'
  })

  it('switches the whole document to the next theme and saves it', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: 'Cambiar a tema Aventura' }))

    expect(document.documentElement.dataset.theme).toBe('aventura')
    expect(localStorage.getItem('theme')).toBe('aventura')
    expect(screen.getByRole('button', { name: 'Cambiar a tema Kawaii' })).toBeInTheDocument()
  })

  it('goes back to the first theme on the second click', async () => {
    const user = userEvent.setup()
    renderToggle()
    const button = screen.getByRole('button')

    await user.click(button)
    await user.click(button)

    expect(document.documentElement.dataset.theme).toBe('kawaii')
  })

  it('starts from the theme already applied by the inline script', () => {
    document.documentElement.dataset.theme = 'aventura'
    renderToggle()

    expect(screen.getByRole('button', { name: 'Cambiar a tema Kawaii' })).toBeInTheDocument()
  })

  it('falls back to the default theme when the DOM has an unknown value', () => {
    document.documentElement.dataset.theme = 'zelda'
    renderToggle()

    expect(screen.getByRole('button', { name: 'Cambiar a tema Aventura' })).toBeInTheDocument()
  })
})
