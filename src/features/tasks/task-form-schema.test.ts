import { describe, expect, it } from 'vitest'
import { EMPTY_TASK_FORM, taskFormSchema } from './task-form-schema'

describe('taskFormSchema', () => {
  it('trims text and converts an empty date to null', () => {
    const result = taskFormSchema.parse({ ...EMPTY_TASK_FORM, title: '  Pagar la luz  ' })

    expect(result).toEqual({
      title: 'Pagar la luz',
      notes: '',
      important: false,
      urgent: false,
      dueDate: null,
    })
  })

  it('keeps a valid date', () => {
    const result = taskFormSchema.parse({ ...EMPTY_TASK_FORM, title: 'x', dueDate: '2026-11-20' })

    expect(result.dueDate).toBe('2026-11-20')
  })

  it.each([
    [{ title: '   ' }, 'Escribe qué hay que hacer.'],
    [{ title: 'a'.repeat(121) }, 'Máximo 120 caracteres.'],
    [{ title: 'x', notes: 'a'.repeat(501) }, 'Máximo 500 caracteres.'],
    [{ title: 'x', dueDate: '2026-02-30' }, 'Escribe una fecha válida.'],
  ])('rejects %j', (values, message) => {
    const result = taskFormSchema.safeParse({ ...EMPTY_TASK_FORM, ...values })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(message)
  })
})
