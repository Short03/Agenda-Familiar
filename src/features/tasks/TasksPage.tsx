import { Tabs } from 'radix-ui'
import { useMemo } from 'react'
import { todayISODate } from '../../shared/lib/date'
import { FeedbackBanner } from '../../shared/ui/Feedback'
import { useFeedback } from '../../shared/ui/use-feedback'
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

const tabClass =
  'flex min-h-11 flex-1 items-center justify-center gap-2 border-b-4 border-transparent px-4 font-semibold text-fg-muted hover:text-fg data-[state=active]:border-accent data-[state=active]:text-accent'

export function TasksPage() {
  const { tasks, isLoading, addTask, setDone, deleteTask, restoreTask } = useTasks()
  const today = todayISODate()
  const { feedback, notify, run, clear } = useFeedback()

  const pendingByQuadrant = useMemo(() => groupPendingByQuadrant(tasks), [tasks])
  const doneTasks = useMemo(() => tasks.filter(isDone).toSorted(compareDone), [tasks])
  const pendingCount = tasks.length - doneTasks.length

  function handleToggleDone(task: Task) {
    const done = !isDone(task)
    void run(
      () => setDone(task.id, done),
      () =>
        notify(done ? `«${task.title}» terminada.` : `«${task.title}» volvió a pendientes.`, {
          undo: () => setDone(task.id, !done),
        }),
    )
  }

  function handleDelete(task: Task) {
    void run(
      () => deleteTask(task.id),
      () => notify(`Se eliminó «${task.title}».`, { undo: () => restoreTask(task.id) }),
    )
  }

  const renderItem = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      today={today}
      onToggleDone={handleToggleDone}
      onDelete={handleDelete}
    />
  )

  return (
    <Page title="Tareas">
      <div className="space-y-4">
        <TaskForm
          onSubmit={(values) =>
            run(
              () => addTask(values),
              () => notify(`Tarea agregada: «${values.title}».`),
            )
          }
        />

        <FeedbackBanner feedback={feedback} onDismiss={clear} />

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
            {isLoading ? (
              <p className="text-fg-muted">Cargando tareas…</p>
            ) : pendingCount === 0 ? (
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
                  <ul className="mt-2 space-y-2">{pendingByQuadrant[quadrant].map(renderItem)}</ul>
                </section>
              ))
            )}
          </Tabs.Content>

          <Tabs.Content value="done">
            {isLoading ? (
              <p className="text-fg-muted">Cargando tareas…</p>
            ) : doneTasks.length === 0 ? (
              <p className="text-fg-muted">Todavía no hay tareas terminadas.</p>
            ) : (
              <ul className="space-y-2">{doneTasks.map(renderItem)}</ul>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Page>
  )
}
