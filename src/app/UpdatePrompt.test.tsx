import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../test/axe'
import { UpdatePrompt } from './UpdatePrompt'

// The real module registers a service worker; in tests we control its state directly.
const sw = vi.hoisted(() => ({
  needRefresh: false,
  offlineReady: false,
  setNeedRefresh: vi.fn<(value: boolean) => void>(),
  setOfflineReady: vi.fn<(value: boolean) => void>(),
  updateServiceWorker: vi.fn<() => Promise<void>>(),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [sw.needRefresh, sw.setNeedRefresh],
    offlineReady: [sw.offlineReady, sw.setOfflineReady],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}))

describe('UpdatePrompt', () => {
  beforeEach(() => {
    sw.needRefresh = false
    sw.offlineReady = false
    sw.updateServiceWorker.mockResolvedValue()
  })

  it('renders an empty live region when there is nothing to say', () => {
    render(<UpdatePrompt />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('tells when the app works offline and can be dismissed', async () => {
    sw.offlineReady = true
    const user = userEvent.setup()
    render(<UpdatePrompt />)

    expect(screen.getByRole('status')).toHaveTextContent('Lista para usarse sin internet.')
    expect(screen.queryByRole('button', { name: 'Actualizar' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }))
    expect(sw.setOfflineReady).toHaveBeenCalledWith(false)
  })

  it('waits for the person to accept a new version', async () => {
    sw.needRefresh = true
    const user = userEvent.setup()
    const { container } = render(<UpdatePrompt />)

    expect(screen.getByRole('status')).toHaveTextContent('Hay una versión nueva de la agenda.')
    expect(sw.updateServiceWorker).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(sw.updateServiceWorker).toHaveBeenCalledOnce()
    expect(await axe(container)).toHaveNoViolations()
  })
})
