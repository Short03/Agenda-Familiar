import { restoreTask, setTaskDone, softDeleteTask, type Task } from './task-model'

/** Actions are past-tense events. They carry id and time, so the reducer stays pure. */
export type TaskAction =
  | { type: 'added'; task: Task }
  | { type: 'doneChanged'; id: string; done: boolean; now: string }
  | { type: 'deleted'; id: string; now: string }
  | { type: 'restored'; id: string; now: string }

function updateById(tasks: readonly Task[], id: string, update: (task: Task) => Task): Task[] {
  return tasks.map((task) => (task.id === id ? update(task) : task))
}

export function tasksReducer(tasks: readonly Task[], action: TaskAction): readonly Task[] {
  switch (action.type) {
    case 'added':
      return [...tasks, action.task]
    case 'doneChanged':
      return updateById(tasks, action.id, (t) => setTaskDone(t, action.done, action.now))
    case 'deleted':
      return updateById(tasks, action.id, (t) => softDeleteTask(t, action.now))
    case 'restored':
      return updateById(tasks, action.id, (t) => restoreTask(t, action.now))
    default: {
      const unhandled: never = action
      throw new Error(`Unhandled action: ${JSON.stringify(unhandled)}`)
    }
  }
}
