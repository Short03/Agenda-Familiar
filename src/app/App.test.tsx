import { render, screen } from '@testing-library/react'
import { axe } from '../test/axe'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /agenda familiar/i })).toBeInTheDocument()
  })

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<App />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
