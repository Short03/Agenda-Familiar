import { useCallback, useMemo, useReducer, type ReactNode } from 'react'
import { createId } from '../../shared/lib/id'
import { createTask, isDeleted, type NewTaskInput, type Task } from './task-model'
import { TasksContext, type TasksContextValue } from './tasks-context'
import { tasksReducer } from './tasks-reducer'

interface TasksProviderProps {
  children: ReactNode
  initialTasks?: readonly Task[]
}

/**
 * In-memory store for now (tasks reset on reload). Phase 5 keeps this same context API
 * and reads/writes IndexedDB with Dexie, so no component has to change.
 * Impure things (new ids, the current time) happen here, at the edge; the reducer is pure.
 */
export function TasksProvider({ children, initialTasks = [] }: TasksProviderProps) {
  const [allTasks, dispatch] = useReducer(tasksReducer, initialTasks)

  const addTask = useCallback((input: NewTaskInput) => {
    const task = createTask(input, createId(), new Date().toISOString())
    dispatch({ type: 'added', task })
    return task
  }, [])

  const setDone = useCallback((id: string, done: boolean) => {
    dispatch({ type: 'doneChanged', id, done, now: new Date().toISOString() })
  }, [])

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'deleted', id, now: new Date().toISOString() })
  }, [])

  const restoreTask = useCallback((id: string) => {
    dispatch({ type: 'restored', id, now: new Date().toISOString() })
  }, [])

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks: allTasks.filter((task) => !isDeleted(task)),
      addTask,
      setDone,
      deleteTask,
      restoreTask,
    }),
    [allTasks, addTask, setDone, deleteTask, restoreTask],
  )

  return <TasksContext value={value}>{children}</TasksContext>
}
