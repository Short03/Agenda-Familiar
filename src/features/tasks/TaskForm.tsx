import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { getQuadrant, QUADRANT_META } from './task-model'
import {
  EMPTY_TASK_FORM,
  NOTES_MAX,
  TITLE_MAX,
  taskFormSchema,
  type TaskFormInput,
  type TaskFormOutput,
} from './task-form-schema'

interface TaskFormProps {
  onSubmit: (values: TaskFormOutput) => void
}

const inputClass =
  'w-full rounded-theme border-2 border-border bg-bg px-3 py-2 text-fg placeholder:text-fg-muted aria-invalid:border-cat-oficial'
const errorClass = 'mt-1 text-sm font-semibold text-cat-oficial'

export function TaskForm({ onSubmit }: TaskFormProps) {
  const id = useId()
  const ids = {
    title: `${id}-title`,
    titleError: `${id}-title-error`,
    notes: `${id}-notes`,
    notesError: `${id}-notes-error`,
    dueDate: `${id}-due`,
    dueDateError: `${id}-due-error`,
    quadrant: `${id}-quadrant`,
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitSuccessful },
  } = useForm<TaskFormInput, unknown, TaskFormOutput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: EMPTY_TASK_FORM,
  })

  // RHF recommends resetting after a successful submit in an effect, once the form
  // state has settled, instead of inside the submit handler.
  const titleRef = useRef<HTMLInputElement | null>(null)
  const { ref: registerTitleRef, ...titleField } = register('title')

  useEffect(() => {
    if (!isSubmitSuccessful) return
    reset()
    titleRef.current?.focus() // ready for the next task
  }, [isSubmitSuccessful, reset])

  // Live preview of the Eisenhower quadrant, so the two checkboxes make sense.
  const [important = false, urgent = false] = useWatch({ control, name: ['important', 'urgent'] })
  const quadrant = QUADRANT_META[getQuadrant({ important, urgent })]

  const submit = handleSubmit(onSubmit)

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby={`${id}-heading`}
      className="space-y-4 rounded-theme border-2 border-border bg-surface p-4"
    >
      <h2 id={`${id}-heading`} className="text-lg font-bold">
        Nueva tarea
      </h2>

      <div>
        <label htmlFor={ids.title} className="mb-1 block font-semibold">
          ¿Qué hay que hacer?
        </label>
        <input
          id={ids.title}
          type="text"
          autoComplete="off"
          maxLength={TITLE_MAX + 20}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? ids.titleError : undefined}
          className={inputClass}
          {...titleField}
          ref={(element) => {
            registerTitleRef(element) // RHF still needs the element (validation, focus on error)
            titleRef.current = element
          }}
        />
        {errors.title && (
          <p id={ids.titleError} className={errorClass}>
            {errors.title.message}
          </p>
        )}
      </div>

      <fieldset aria-describedby={ids.quadrant}>
        <legend className="mb-1 font-semibold">Prioridad</legend>
        <div className="flex flex-wrap gap-x-6">
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-5 accent-accent" {...register('important')} />
            Importante
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-5 accent-accent" {...register('urgent')} />
            Urgente
          </label>
        </div>
        <p id={ids.quadrant} className="text-sm text-fg-muted">
          Va en: <strong className="text-fg">{quadrant.label}</strong>
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.dueDate} className="mb-1 block font-semibold">
            Fecha límite <span className="font-normal text-fg-muted">(opcional)</span>
          </label>
          <input
            id={ids.dueDate}
            type="date"
            aria-invalid={errors.dueDate ? true : undefined}
            aria-describedby={errors.dueDate ? ids.dueDateError : undefined}
            className={inputClass}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p id={ids.dueDateError} className={errorClass}>
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={ids.notes} className="mb-1 block font-semibold">
            Notas <span className="font-normal text-fg-muted">(opcional)</span>
          </label>
          <textarea
            id={ids.notes}
            rows={2}
            maxLength={NOTES_MAX + 50}
            aria-invalid={errors.notes ? true : undefined}
            aria-describedby={errors.notes ? ids.notesError : undefined}
            className={inputClass}
            {...register('notes')}
          />
          {errors.notes && (
            <p id={ids.notesError} className={errorClass}>
              {errors.notes.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex min-h-11 items-center gap-2 rounded-theme bg-accent px-4 font-bold text-accent-fg hover:opacity-90"
      >
        <Plus aria-hidden="true" className="size-5" />
        Agregar tarea
      </button>
    </form>
  )
}
