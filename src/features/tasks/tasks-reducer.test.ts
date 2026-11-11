import { describe, expect, it } from 'vitest'
import { createTask, type Task } from './task-model'
import { tasksReducer } from './tasks-reducer'

const T0 = '2026-11-11T10:00:00.000Z'
const T1 = '2026-11-11T11:00:00.000Z'

const base: Task = createTask(
  { title: 'Lavar ropa', notes: '', important: false, urgent: true, dueDate: null },
  'a',
  T0,
)

describe('tasksReducer', () => {
  it('adds a task without mutating the previous state', () => {
    const before: readonly Task[] = Object.freeze([])
    const after = tasksReducer(before, { type: 'added', task: base })

    expect(after).toEqual([base])
    expect(before).toEqual([])
  })

  it('changes only the targeted task', () => {
    const other = { ...base, id: 'b' }
    const after = tasksReducer([base, other], { type: 'doneChanged', id: 'a', done: true, now: T1 })

    expect(after[0]?.completedAt).toBe(T1)
    expect(after[1]).toBe(other)
  })

  it('soft deletes and restores', () => {
    const deleted = tasksReducer([base], { type: 'deleted', id: 'a', now: T1 })
    expect(deleted[0]?.deletedAt).toBe(T1)

    const restored = tasksReducer(deleted, { type: 'restored', id: 'a', now: T1 })
    expect(restored[0]?.deletedAt).toBeNull()
  })
})
