import { EyeOff, Plus } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { toLocalDate, type ISODate } from '../../shared/lib/date'
import { CategoryMarker } from '../special-days/CategoryMarker'
import { yearsLabel } from '../special-days/occurrences'
import { CATEGORY_LABELS, type SpecialDayOccurrence } from '../special-days/types'
import { getQuadrant, isDone, QUADRANT_META, type Task } from '../tasks/task-model'
import { TITLE_MAX } from '../tasks/task-form-schema'

const longDateFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

interface DayDetailsProps {
  date: ISODate
  occurrences: readonly SpecialDayOccurrence[]
  tasks: readonly Task[]
  onHideDay: (id: string) => void
  onToggleTask: (task: Task) => void
  onAddTask: (date: ISODate, title: string) => Promise<boolean>
}

export function DayDetails({
  date,
  occurrences,
  tasks,
  onHideDay,
  onToggleTask,
  onAddTask,
}: DayDetailsProps) {
  const id = useId()
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sortedTasks = tasks.toSorted((a, b) => Number(isDone(a)) - Number(isDone(b)))

  async function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Escribe qué hay que hacer.')
      return
    }
    if (trimmed.length > TITLE_MAX) {
      setError(`Máximo ${TITLE_MAX} caracteres.`)
      return
    }
    setError(null)
    if (await onAddTask(date, trimmed)) setTitle('')
  }

  return (
    <section
      aria-labelledby="day-details-title"
      className="space-y-4 rounded-theme border-2 border-border bg-surface p-4"
    >
      <h3 id="day-details-title" className="text-lg font-bold first-letter:uppercase">
        {longDateFormatter.format(toLocalDate(date))}
      </h3>

      {occurrences.length === 0 ? (
        <p className="text-fg-muted">Sin fechas especiales.</p>
      ) : (
        <ul className="space-y-2" aria-label="Fechas especiales">
          {occurrences.map((occurrence) => {
            const { specialDay } = occurrence
            const isFamily = specialDay.category === 'familia'
            const extra = yearsLabel(occurrence)
            return (
              <li key={specialDay.id} className="flex items-center gap-3">
                <CategoryMarker category={specialDay.category} size="md" />
                <div className="min-w-0 flex-1">
                  <p className={isFamily ? 'font-bold text-accent' : 'font-semibold text-fg'}>
                    {specialDay.name}
                    {extra && <span className="ml-2">· {extra}</span>}
                  </p>
                  <p className="text-sm text-fg-muted">{CATEGORY_LABELS[specialDay.category]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onHideDay(specialDay.id)}
                  aria-label={`Ocultar ${specialDay.name}`}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-theme text-fg-muted hover:bg-accent-soft hover:text-fg"
                >
                  <EyeOff aria-hidden="true" className="size-5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="border-t-2 border-border pt-3">
        <h4 id={`${id}-tasks`} className="mb-2 font-bold">
          Tareas
        </h4>
        {sortedTasks.length === 0 ? (
          <p className="mb-3 text-fg-muted">Sin tareas para este día.</p>
        ) : (
          <ul aria-labelledby={`${id}-tasks`} className="mb-3 space-y-1">
            {sortedTasks.map((task) => {
              const done = isDone(task)
              return (
                <li key={task.id}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => onToggleTask(task)}
                      className="size-5 shrink-0 accent-accent"
                    />
                    <span
                      className={[
                        'flex-1 break-words',
                        done ? 'text-fg-muted line-through' : 'font-semibold',
                      ].join(' ')}
                    >
                      {task.title}
                    </span>
                    <span className="shrink-0 text-xs text-fg-muted">
                      {QUADRANT_META[getQuadrant(task)].label}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        <form onSubmit={handleQuickAdd} noValidate className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor={`${id}-quick`} className="sr-only">
              Nueva tarea para este día
            </label>
            <input
              id={`${id}-quick`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nueva tarea para este día"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-quick-error` : undefined}
              className="w-full rounded-theme border-2 border-border bg-bg px-3 py-2 text-fg placeholder:text-fg-muted aria-invalid:border-cat-oficial"
            />
            {error && (
              <p id={`${id}-quick-error`} className="mt-1 text-sm font-semibold text-cat-oficial">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            aria-label="Agregar tarea a este día"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-theme bg-accent text-accent-fg hover:opacity-90"
          >
            <Plus aria-hidden="true" className="size-5" />
          </button>
        </form>
      </div>
    </section>
  )
}
