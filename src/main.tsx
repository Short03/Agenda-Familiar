import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AppProviders } from './app/AppProviders'
import { routes } from './app/routes'
import { UpdatePrompt } from './app/UpdatePrompt'
import { requestPersistentStorage } from './shared/lib/storage'
import './index.css'

// Ask the browser to keep our IndexedDB data (ADR 0001). No UI depends on the answer here.
void requestPersistentStorage()

const router = createBrowserRouter(routes)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
      {/* Outside the router on purpose: it only talks to the service worker. */}
      <UpdatePrompt />
    </AppProviders>
  </StrictMode>,
)
