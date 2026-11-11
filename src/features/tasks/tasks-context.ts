import { createContext, useContext } from 'react'
import type { NewTaskInput, Task } from './task-model'

export interface TasksContextValue {
  /** Tasks that are not deleted. */
  tasks: readonly Task[]
  addTask: (input: NewTaskInput) => Task
  setDone: (id: string, done: boolean) => void
  deleteTask: (id: string) => void
  restoreTask: (id: string) => void
}

export const TasksContext = createContext<TasksContextValue | null>(null)

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext)
  if (!value) throw new Error('useTasks must be used inside <TasksProvider>')
  return value
}
