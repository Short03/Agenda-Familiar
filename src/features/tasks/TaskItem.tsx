import { CalendarDays, ClockAlert, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { toLocalDate, type ISODate } from '../../shared/lib/date'
import { isDone, isOverdue, type Task } from './task-model'

const dueFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const completedFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' })

interface TaskItemProps {
  task: Task
  today: ISODate
  onToggleDone: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskItem({ task, today, onToggleDone, onDelete }: TaskItemProps) {
  const checkboxId = useId()
  const done = isDone(task)
  const overdue = isOverdue(task, today)

  return (
    <li className="flex items-start gap-3 rounded-theme border-2 border-border bg-surface p-3">
      <input
        id={checkboxId}
        type="checkbox"
        checked={done}
        onChange={() => onToggleDone(task)}
        className="mt-0.5 size-6 shrink-0 cursor-pointer accent-accent"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={checkboxId}
          className={[
            'block cursor-pointer font-semibold break-words',
            done ? 'text-fg-muted line-through' : 'text-fg',
          ].join(' ')}
        >
          {task.title}
        </label>

        {task.notes && <p className="mt-0.5 text-sm break-words text-fg-muted">{task.notes}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {task.dueDate && !done && (
            <span
              className={[
                'inline-flex items-center gap-1',
                overdue ? 'font-bold text-cat-oficial' : 'text-fg-muted',
              ].join(' ')}
            >
              {overdue ? (
                <ClockAlert aria-hidden="true" className="size-4" />
              ) : (
                <CalendarDays aria-hidden="true" className="size-4" />
              )}
              {overdue ? 'Vencida: ' : 'Para el '}
              <time dateTime={task.dueDate}>{dueFormatter.format(toLocalDate(task.dueDate))}</time>
            </span>
          )}
          {done && task.completedAt && (
            <span className="text-fg-muted">
              Terminada el{' '}
              <time dateTime={task.completedAt}>
                {completedFormatter.format(new Date(task.completedAt))}
              </time>
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(task)}
        aria-label={`Eliminar «${task.title}»`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-theme text-fg-muted hover:bg-accent-soft hover:text-fg"
      >
        <Trash2 aria-hidden="true" className="size-5" />
      </button>
    </li>
  )
}
