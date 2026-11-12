import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, type ReactNode } from 'react'
import type { Task } from './task-model'
import { TasksContext, type TasksContextValue } from './tasks-context'
import { taskRepository } from './task-repository'

const NO_TASKS: readonly Task[] = []

/**
 * Tasks from IndexedDB. `useLiveQuery` re-runs the query whenever the table changes,
 * from this tab or another one, so every screen stays in sync without manual refreshes.
 * Components only see this context, never Dexie: when sync with a backend arrives,
 * only this provider (and the repository) change.
 */
export function TasksProvider({ children }: { children: ReactNode }) {
  const tasks = useLiveQuery(taskRepository.listActive, [])

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks: tasks ?? NO_TASKS,
      isLoading: tasks === undefined,
      addTask: taskRepository.add,
      setDone: taskRepository.setDone,
      deleteTask: taskRepository.remove,
      restoreTask: taskRepository.restore,
    }),
    [tasks],
  )

  return <TasksContext value={value}>{children}</TasksContext>
}
