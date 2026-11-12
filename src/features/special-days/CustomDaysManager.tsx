import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FeedbackBanner } from '../../shared/ui/Feedback'
import { useFeedback } from '../../shared/ui/use-feedback'
import { CategoryMarker } from './CategoryMarker'
import {
  customDayFormSchema,
  EMPTY_CUSTOM_DAY_FORM,
  NAME_MAX,
  type CustomDayFormInput,
  type CustomDayFormOutput,
} from './custom-day-form-schema'
import { customDayRepository, useCustomSpecialDays } from './custom-days'
import { CATEGORY_LABELS, CUSTOM_DAY_CATEGORIES, type CustomSpecialDay } from './types'

const dayMonthFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' })

function describeDay(day: CustomSpecialDay): string {
  // Year 2000 is a leap year, so Feb 29 formats correctly.
  const date = dayMonthFormatter.format(new Date(2000, day.rule.month - 1, day.rule.day, 12))
  return day.sinceYear === undefined ? date : `${date} · desde ${day.sinceYear}`
}

const inputClass =
  'w-full rounded-theme border-2 border-border bg-bg px-3 py-2 text-fg aria-invalid:border-cat-oficial'
const errorClass = 'mt-1 text-sm font-semibold text-cat-oficial'

/** Birthdays and personal dates, entered in the app instead of in the code. */
export function CustomDaysManager() {
  const id = useId()
  const days = useCustomSpecialDays()
  const { feedback, notify, run, clear } = useFeedback()
  const [savedCount, setSavedCount] = useState(0)
  const nameRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomDayFormInput, unknown, CustomDayFormOutput>({
    resolver: zodResolver(customDayFormSchema),
    defaultValues: EMPTY_CUSTOM_DAY_FORM,
  })
  const { ref: registerNameRef, ...nameField } = register('name')

  useEffect(() => {
    if (savedCount === 0) return
    reset()
    nameRef.current?.focus()
  }, [savedCount, reset])

  const submit = handleSubmit(async (values) => {
    const saved = await run(
      () => customDayRepository.add(values),
      () => notify(`Se agregó «${values.name}».`),
    )
    if (saved) setSavedCount((count) => count + 1)
  })

  function handleDelete(day: CustomSpecialDay) {
    void run(
      () => customDayRepository.remove(day.id),
      () =>
        notify(`Se eliminó «${day.name}».`, { undo: () => customDayRepository.restore(day.id) }),
    )
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={submit}
        noValidate
        aria-label="Agregar fecha"
        className="space-y-4 rounded-theme border-2 border-border bg-surface p-4"
      >
        <div>
          <label htmlFor={`${id}-name`} className="mb-1 block font-semibold">
            Nombre
          </label>
          <input
            id={`${id}-name`}
            type="text"
            placeholder="Cumpleaños de…"
            autoComplete="off"
            maxLength={NAME_MAX + 20}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className={inputClass}
            {...nameField}
            ref={(element) => {
              registerNameRef(element)
              nameRef.current = element
            }}
          />
          {errors.name && (
            <p id={`${id}-name-error`} className={errorClass}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-date`} className="mb-1 block font-semibold">
              Fecha
            </label>
            <input
              id={`${id}-date`}
              type="date"
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={errors.date ? `${id}-date-error` : `${id}-date-hint`}
              className={inputClass}
              {...register('date')}
            />
            {errors.date ? (
              <p id={`${id}-date-error`} className={errorClass}>
                {errors.date.message}
              </p>
            ) : (
              <p id={`${id}-date-hint`} className="mt-1 text-sm text-fg-muted">
                Para un cumpleaños, la fecha de nacimiento.
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-1 font-semibold">Tipo</legend>
            <div className="flex flex-wrap gap-x-6">
              {CUSTOM_DAY_CATEGORIES.map((category) => (
                <label key={category} className="flex min-h-11 cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value={category}
                    className="size-5 accent-accent"
                    {...register('category')}
                  />
                  {CATEGORY_LABELS[category]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-2">
          <input type="checkbox" className="size-5 accent-accent" {...register('countYears')} />
          Contar los años (muestra «Cumple 30»)
        </label>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center gap-2 rounded-theme bg-accent px-4 font-bold text-accent-fg hover:opacity-90"
        >
          <Plus aria-hidden="true" className="size-5" />
          Agregar fecha
        </button>
      </form>

      <FeedbackBanner feedback={feedback} onDismiss={clear} />

      {days.length === 0 ? (
        <p className="text-fg-muted">Todavía no hay fechas de la familia.</p>
      ) : (
        <ul aria-label="Fechas guardadas" className="space-y-2">
          {days.map((day) => (
            <li
              key={day.id}
              className="flex items-center gap-3 rounded-theme border-2 border-border bg-surface p-3"
            >
              <CategoryMarker category={day.category} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold break-words">{day.name}</p>
                <p className="text-sm text-fg-muted">{describeDay(day)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(day)}
                aria-label={`Eliminar «${day.name}»`}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-theme text-fg-muted hover:bg-accent-soft hover:text-fg"
              >
                <Trash2 aria-hidden="true" className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
