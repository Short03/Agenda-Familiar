import { Navigate, type RouteObject } from 'react-router'
import { NotFoundPage } from './NotFoundPage'
import { RootLayout } from './RootLayout'

/**
 * Shared by the real browser router (main.tsx) and memory routers in tests.
 *
 * Each page is a lazy route: its code (and heavy libraries only it uses, like Zod and
 * React Hook Form in Settings) downloads when you first open it, not at startup.
 * The service worker precaches every chunk, so lazy pages still open offline.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/calendario" replace /> },
      {
        path: 'calendario',
        lazy: async () => ({
          Component: (await import('../features/calendar/CalendarPage')).CalendarPage,
        }),
      },
      {
        path: 'tareas',
        lazy: async () => ({
          Component: (await import('../features/tasks/TasksPage')).TasksPage,
        }),
      },
      {
        path: 'ajustes',
        lazy: async () => ({
          Component: (await import('../features/settings/SettingsPage')).SettingsPage,
        }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
