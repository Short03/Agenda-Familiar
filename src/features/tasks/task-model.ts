import type { ISODate } from '../../shared/lib/date'

/**
 * A task. Sync-ready (ADR 0001): UUID id, updatedAt for last-write-wins,
 * and deletedAt for soft delete. Timestamps are ISO strings in UTC.
 *
 * There is no `status` field: "done" is derived from `completedAt`, so the two can never
 * disagree (a task "done" without a completion date, or the other way around).
 */
export interface Task {
  id: string
  title: string
  notes: string
  important: boolean
  urgent: boolean
  /** Calendar day without time (ADR 0001). */
  dueDate: ISODate | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface NewTaskInput {
  title: string
  notes: string
  important: boolean
  urgent: boolean
  dueDate: ISODate | null
}

/** Eisenhower matrix: important × urgent. */
export const QUADRANTS = ['do', 'plan', 'quick', 'later'] as const
export type Quadrant = (typeof QUADRANTS)[number]

export const QUADRANT_META: Record<Quadrant, { label: string; hint: string }> = {
  do: { label: 'Hacer ya', hint: 'Importante y urgente' },
  plan: { label: 'Planear', hint: 'Importante, no urgente' },
  quick: { label: 'Rápido o pedir ayuda', hint: 'Urgente, no importante' },
  later: { label: 'Cuando se pueda', hint: 'Ni urgente ni importante' },
}

export function getQuadrant({ important, urgent }: Pick<Task, 'important' | 'urgent'>): Quadrant {
  if (important) return urgent ? 'do' : 'plan'
  return urgent ? 'quick' : 'later'
}

export const isDone = (task: Task): boolean => task.completedAt !== null
export const isDeleted = (task: Task): boolean => task.deletedAt !== null
export const isOverdue = (task: Task, today: ISODate): boolean =>
  !isDone(task) && task.dueDate !== null && task.dueDate < today

// Pure "state transitions": they take the time and id from outside, so tests are exact
// and the same functions will write to IndexedDB in Phase 5.

export function createTask(input: NewTaskInput, id: string, now: string): Task {
  return {
    id,
    ...input,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
}

export function setTaskDone(task: Task, done: boolean, now: string): Task {
  return { ...task, completedAt: done ? now : null, updatedAt: now }
}

export function softDeleteTask(task: Task, now: string): Task {
  return { ...task, deletedAt: now, updatedAt: now }
}

export function restoreTask(task: Task, now: string): Task {
  return { ...task, deletedAt: null, updatedAt: now }
}

/** Pending tasks: earliest due date first (no date last), then oldest first. */
export function comparePending(a: Task, b: Task): number {
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1
    if (b.dueDate === null) return -1
    return a.dueDate.localeCompare(b.dueDate)
  }
  return a.createdAt.localeCompare(b.createdAt)
}

/** Done tasks: most recently completed first. */
export function compareDone(a: Task, b: Task): number {
  return (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
}

export function groupPendingByQuadrant(tasks: readonly Task[]): Record<Quadrant, Task[]> {
  const groups: Record<Quadrant, Task[]> = { do: [], plan: [], quick: [], later: [] }
  for (const task of tasks) {
    if (!isDone(task) && !isDeleted(task)) groups[getQuadrant(task)].push(task)
  }
  for (const quadrant of QUADRANTS) groups[quadrant].sort(comparePending)
  return groups
}
