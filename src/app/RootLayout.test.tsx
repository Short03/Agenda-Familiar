import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProviders } from './AppProviders'
import { axe } from '../test/axe'
import { routes } from './routes'

function renderApp(initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const view = render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { ...view, router }
}

describe('RootLayout', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'kawaii'
  })

  it('redirects / to the calendar', async () => {
    const { router } = renderApp('/')

    expect(await screen.findByRole('heading', { level: 1, name: 'Calendario' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/calendario')
  })

  it('marks the current section with aria-current', async () => {
    renderApp('/tareas')
    const nav = await screen.findByRole('navigation', { name: 'Secciones' })

    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('Tareas')
    expect(screen.getByRole('link', { name: 'Calendario' })).not.toHaveAttribute('aria-current')
  })

  it('moves focus to the new heading after navigating', async () => {
    const user = userEvent.setup()
    renderApp('/calendario')

    await user.click(await screen.findByRole('link', { name: 'Tareas' }))

    const heading = await screen.findByRole('heading', { level: 1, name: 'Tareas' })
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it('does not steal focus on the first load', async () => {
    renderApp('/calendario')
    await screen.findByRole('heading', { level: 1 })

    expect(document.body).toHaveFocus()
  })

  it('has a skip link as the first focusable element', async () => {
    const user = userEvent.setup()
    renderApp('/calendario')
    await screen.findByRole('heading', { level: 1 })

    await user.tab()

    const skipLink = screen.getByRole('link', { name: 'Saltar al contenido' })
    expect(skipLink).toHaveFocus()
    expect(skipLink).toHaveAttribute('href', '#main')
    expect(document.getElementById('main')).toBeInTheDocument()
  })

  it('links to the settings page and marks it as current', async () => {
    const user = userEvent.setup()
    renderApp('/calendario')

    await user.click(await screen.findByRole('link', { name: 'Ajustes' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Ajustes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajustes' })).toHaveAttribute('aria-current', 'page')
  })

  it('shows a not-found page for unknown routes', async () => {
    renderApp('/no-existe')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument()
  })

  it.each(['kawaii', 'aventura'])(
    'has no accessibility violations in the %s theme',
    async (theme) => {
      document.documentElement.dataset.theme = theme
      const { container } = renderApp('/calendario')
      await screen.findByRole('heading', { level: 1 })

      expect(await axe(container)).toHaveNoViolations()
    },
  )
})
