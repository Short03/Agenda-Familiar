import { Undo2 } from 'lucide-react'
import { Tabs } from 'radix-ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { todayISODate } from '../../shared/lib/date'
import { Page } from '../../shared/ui/Page'
import {
  compareDone,
  groupPendingByQuadrant,
  isDone,
  QUADRANT_META,
  QUADRANTS,
  type Task,
} from './task-model'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'
import { useTasks } from './tasks-context'

/** Last thing that happened, announced in a live region, optionally with "undo". */
interface Feedback {
  /** Changes on every action so the same text is announced again. */
  key: number
  message: string
  undo?: () => void
}

const tabClass =
  'flex min-h-11 flex-1 items-center justify-center gap-2 border-b-4 border-transparent px-4 font-semibold text-fg-muted hover:text-fg data-[state=active]:border-accent data-[state=active]:text-accent'

export function TasksPage() {
  const { tasks, addTask, setDone, deleteTask, restoreTask } = useTasks()
  const today = todayISODate()
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const undoButtonRef = useRef<HTMLButtonElement>(null)

  const pendingByQuadrant = useMemo(() => groupPendingByQuadrant(tasks), [tasks])
  const doneTasks = useMemo(() => tasks.filter(isDone).toSorted(compareDone), [tasks])
  const pendingCount = tasks.length - doneTasks.length

  // When a task leaves the list (done or deleted), its controls disappear and keyboard
  // focus would fall back to <body>. Moving focus to "Deshacer" keeps people in place.
  useEffect(() => {
    if (feedback?.undo) undoButtonRef.current?.focus()
  }, [feedback])

  const notify = (message: string, undo?: () => void) =>
    setFeedback((previous) => ({
      key: (previous?.key ?? 0) + 1,
      message,
      ...(undo ? { undo } : {}),
    }))

  function handleToggleDone(task: Task) {
    const done = !isDone(task)
    setDone(task.id, done)
    notify(done ? `«${task.title}» terminada.` : `«${task.title}» volvió a pendientes.`, () =>
      setDone(task.id, !done),
    )
  }

  function handleDelete(task: Task) {
    deleteTask(task.id)
    notify(`Se eliminó «${task.title}».`, () => restoreTask(task.id))
  }

  return (
    <Page title="Tareas">
      <div className="space-y-4">
        <TaskForm
          onSubmit={(values) => {
            const task = addTask(values)
            notify(`Tarea agregada: «${task.title}».`)
          }}
        />

        {/* Always in the DOM: live regions must exist before their content changes. */}
        <div role="status" aria-live="polite" className="empty:hidden">
          {feedback && (
            <div
              key={feedback.key}
              className="flex items-center gap-3 rounded-theme border-2 border-accent bg-accent-soft px-4 py-2"
            >
              <p className="flex-1 break-words">{feedback.message}</p>
              {feedback.undo && (
                <button
                  ref={undoButtonRef}
                  type="button"
                  onClick={() => {
                    feedback.undo?.()
                    setFeedback(null)
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-theme px-3 font-bold text-accent hover:bg-surface"
                >
                  <Undo2 aria-hidden="true" className="size-5" />
                  Deshacer
                </button>
              )}
            </div>
          )}
        </div>

        <Tabs.Root defaultValue="pending">
          <Tabs.List aria-label="Ver tareas" className="mb-3 flex border-b-2 border-border">
            <Tabs.Trigger value="pending" className={tabClass}>
              Por hacer <span className="text-sm">({pendingCount})</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="done" className={tabClass}>
              Terminadas <span className="text-sm">({doneTasks.length})</span>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="pending" className="space-y-5">
            {pendingCount === 0 ? (
              <p className="text-fg-muted">No hay pendientes. ¡A descansar!</p>
            ) : (
              QUADRANTS.filter((q) => pendingByQuadrant[q].length > 0).map((quadrant) => (
                <section key={quadrant} aria-labelledby={`quadrant-${quadrant}`}>
                  <h3 id={`quadrant-${quadrant}`} className="font-bold">
                    {QUADRANT_META[quadrant].label}{' '}
                    <span className="text-sm font-normal text-fg-muted">
                      · {QUADRANT_META[quadrant].hint}
                    </span>
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {pendingByQuadrant[quadrant].map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        today={today}
                        onToggleDone={handleToggleDone}
                        onDelete={handleDelete}
                      />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </Tabs.Content>

          <Tabs.Content value="done">
            {doneTasks.length === 0 ? (
              <p className="text-fg-muted">Todavía no hay tareas terminadas.</p>
            ) : (
              <ul className="space-y-2">
                {doneTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    today={today}
                    onToggleDone={handleToggleDone}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Page>
  )
}
