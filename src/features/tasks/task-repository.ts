import { db, nowISO } from '../../db/db'
import { createId } from '../../shared/lib/id'
import {
  createTask,
  restoreTask,
  setTaskDone,
  softDeleteTask,
  type NewTaskInput,
  type Task,
} from './task-model'

/** Read-modify-write inside a transaction, so two quick taps cannot overwrite each other. */
async function updateTask(id: string, update: (task: Task) => Task): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    const task = await db.tasks.get(id)
    if (task) await db.tasks.put(update(task))
  })
}

export const taskRepository = {
  async add(input: NewTaskInput): Promise<Task> {
    const task = createTask(input, createId(), nowISO())
    await db.tasks.add(task)
    return task
  },
  setDone: (id: string, done: boolean) => updateTask(id, (t) => setTaskDone(t, done, nowISO())),
  remove: (id: string) => updateTask(id, (t) => softDeleteTask(t, nowISO())),
  restore: (id: string) => updateTask(id, (t) => restoreTask(t, nowISO())),
  /** Not deleted. Soft-deleted tasks stay in the table so the deletion can sync later. */
  listActive: () => db.tasks.filter((task) => task.deletedAt === null).toArray(),
}
