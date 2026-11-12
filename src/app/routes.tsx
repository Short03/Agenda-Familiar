import { Navigate, type RouteObject } from 'react-router'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { TasksPage } from '../features/tasks/TasksPage'
import { NotFoundPage } from './NotFoundPage'
import { RootLayout } from './RootLayout'

/** Shared by the real browser router (main.tsx) and memory routers in tests. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/calendario" replace /> },
      { path: 'calendario', element: <CalendarPage /> },
      { path: 'tareas', element: <TasksPage /> },
      { path: 'ajustes', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
