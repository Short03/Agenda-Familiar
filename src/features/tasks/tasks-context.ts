import { createContext, useContext } from 'react'
import type { NewTaskInput, Task } from './task-model'

export interface TasksContextValue {
  /** Tasks that are not deleted. Empty while loading. */
  tasks: readonly Task[]
  isLoading: boolean
  addTask: (input: NewTaskInput) => Promise<Task>
  setDone: (id: string, done: boolean) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  restoreTask: (id: string) => Promise<void>
}

export const TasksContext = createContext<TasksContextValue | null>(null)

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext)
  if (!value) throw new Error('useTasks must be used inside <TasksProvider>')
  return value
}
