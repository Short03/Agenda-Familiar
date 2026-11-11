import { describe, expect, it } from 'vitest'
import { toISODate } from '../../shared/lib/date'
import {
  compareDone,
  createTask,
  getQuadrant,
  groupPendingByQuadrant,
  isOverdue,
  restoreTask,
  setTaskDone,
  softDeleteTask,
  type NewTaskInput,
  type Task,
} from './task-model'

const T0 = '2026-11-11T10:00:00.000Z'
const T1 = '2026-11-11T11:00:00.000Z'

const input: NewTaskInput = {
  title: 'Comprar pastel',
  notes: '',
  important: true,
  urgent: false,
  dueDate: null,
}

let counter = 0
function task(overrides: Partial<Task> = {}): Task {
  counter += 1
  return { ...createTask(input, `id-${counter}`, T0), ...overrides }
}

describe('getQuadrant', () => {
  it.each([
    [true, true, 'do'],
    [true, false, 'plan'],
    [false, true, 'quick'],
    [false, false, 'later'],
  ] as const)('important=%s urgent=%s → %s', (important, urgent, expected) => {
    expect(getQuadrant({ important, urgent })).toBe(expected)
  })
})

describe('state transitions', () => {
  it('creates a pending task with timestamps', () => {
    expect(createTask(input, 'abc', T0)).toEqual({
      id: 'abc',
      ...input,
      completedAt: null,
      createdAt: T0,
      updatedAt: T0,
      deletedAt: null,
    })
  })

  it('completes and reopens, touching updatedAt', () => {
    const done = setTaskDone(task(), true, T1)
    expect(done.completedAt).toBe(T1)
    expect(done.updatedAt).toBe(T1)

    const reopened = setTaskDone(done, false, T1)
    expect(reopened.completedAt).toBeNull()
  })

  it('soft deletes and restores without losing data', () => {
    const original = task({ title: 'No borrar de verdad' })
    const deleted = softDeleteTask(original, T1)
    expect(deleted.deletedAt).toBe(T1)
    expect(deleted.title).toBe('No borrar de verdad')

    expect(restoreTask(deleted, T1).deletedAt).toBeNull()
  })

  it('never mutates the original task', () => {
    const original = task()
    const frozen = Object.freeze({ ...original })
    expect(() => setTaskDone(frozen, true, T1)).not.toThrow()
    expect(frozen.completedAt).toBeNull()
  })
})

describe('isOverdue', () => {
  const today = toISODate(2026, 11, 11)

  it('is overdue only when pending and the due date is before today', () => {
    expect(isOverdue(task({ dueDate: toISODate(2026, 11, 10) }), today)).toBe(true)
    expect(isOverdue(task({ dueDate: today }), today)).toBe(false)
    expect(isOverdue(task({ dueDate: null }), today)).toBe(false)
    expect(isOverdue(task({ dueDate: toISODate(2026, 11, 1), completedAt: T1 }), today)).toBe(false)
  })
})

describe('groupPendingByQuadrant', () => {
  it('groups pending tasks and sorts by due date, no date last', () => {
    const noDate = task({ title: 'sin fecha', important: true, urgent: true })
    const later = task({
      title: 'después',
      important: true,
      urgent: true,
      dueDate: toISODate(2026, 12, 1),
    })
    const sooner = task({
      title: 'antes',
      important: true,
      urgent: true,
      dueDate: toISODate(2026, 11, 20),
    })
    const done = task({ important: true, urgent: true, completedAt: T1 })
    const deleted = task({ important: true, urgent: true, deletedAt: T1 })
    const planned = task({ title: 'planear', important: true, urgent: false })

    const groups = groupPendingByQuadrant([noDate, later, done, sooner, deleted, planned])

    expect(groups.do.map((t) => t.title)).toEqual(['antes', 'después', 'sin fecha'])
    expect(groups.plan.map((t) => t.title)).toEqual(['planear'])
    expect(groups.quick).toEqual([])
    expect(groups.later).toEqual([])
  })
})

describe('compareDone', () => {
  it('puts the most recently completed first', () => {
    const first = task({ title: 'primero', completedAt: T0 })
    const second = task({ title: 'segundo', completedAt: T1 })

    expect([first, second].toSorted(compareDone).map((t) => t.title)).toEqual([
      'segundo',
      'primero',
    ])
  })
})
