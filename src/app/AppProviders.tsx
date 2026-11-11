import type { ReactNode } from 'react'
import { TasksProvider } from '../features/tasks/TasksProvider'
import { ThemeProvider } from '../features/theme/ThemeProvider'

/** Every app-wide provider in one place, shared by main.tsx and tests. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TasksProvider>{children}</TasksProvider>
    </ThemeProvider>
  )
}
