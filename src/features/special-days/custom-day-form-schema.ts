import { z } from 'zod'
import { getDateParts, parseISODate } from '../../shared/lib/date'
import type { NewCustomDayInput } from './custom-days'
import { CUSTOM_DAY_CATEGORIES } from './types'

export const NAME_MAX = 60

/**
 * The form asks for one date ("2002-10-09") and whether to count years.
 * The output is what the app stores: month, day and, optionally, the start year.
 */
export const customDayFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Escribe un nombre.')
      .max(NAME_MAX, `Máximo ${NAME_MAX} caracteres.`),
    category: z.enum(CUSTOM_DAY_CATEGORIES),
    date: z.string().refine((value) => parseISODate(value) !== null, 'Elige una fecha.'),
    countYears: z.boolean(),
  })
  .transform(({ name, category, date, countYears }): NewCustomDayInput => {
    const { year, month, day } = getDateParts(parseISODate(date)!)
    return { name, category, month, day, sinceYear: countYears ? year : null }
  })

export type CustomDayFormInput = z.input<typeof customDayFormSchema>
export type CustomDayFormOutput = z.output<typeof customDayFormSchema>

export const EMPTY_CUSTOM_DAY_FORM: CustomDayFormInput = {
  name: '',
  category: 'familia',
  date: '',
  countYears: true,
}
