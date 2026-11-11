import { z } from 'zod'
import { parseISODate } from '../../shared/lib/date'

export const TITLE_MAX = 120
export const NOTES_MAX = 500

/**
 * Validates what the person typed AND converts it to the domain shape:
 * the form works with strings ('' for "no date"), the app works with ISODate | null.
 */
export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Escribe qué hay que hacer.')
    .max(TITLE_MAX, `Máximo ${TITLE_MAX} caracteres.`),
  notes: z.string().trim().max(NOTES_MAX, `Máximo ${NOTES_MAX} caracteres.`),
  important: z.boolean(),
  urgent: z.boolean(),
  dueDate: z.string().transform((value, ctx) => {
    if (value === '') return null
    const date = parseISODate(value)
    if (!date) {
      ctx.addIssue({ code: 'custom', message: 'Escribe una fecha válida.' })
      return z.NEVER
    }
    return date
  }),
})

/** What the inputs hold. */
export type TaskFormInput = z.input<typeof taskFormSchema>
/** What we get after validation (assignable to NewTaskInput). */
export type TaskFormOutput = z.output<typeof taskFormSchema>

export const EMPTY_TASK_FORM: TaskFormInput = {
  title: '',
  notes: '',
  important: false,
  urgent: false,
  dueDate: '',
}
