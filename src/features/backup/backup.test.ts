import { describe, expect, it } from 'vitest'
import { db } from '../../db/db'
import { createCustomDay } from '../special-days/custom-days'
import { createTask, softDeleteTask } from '../tasks/task-model'
import { createBackup, importBackup, recordsToWrite } from './backup'

const T0 = '2026-11-10T10:00:00.000Z'
const T1 = '2026-11-11T10:00:00.000Z'
const T2 = '2026-11-12T10:00:00.000Z'

const task = (id: string, title: string, at = T0) =>
  createTask({ title, notes: '', important: false, urgent: false, dueDate: null }, id, at)

const key = (r: { id: string }) => r.id

describe('recordsToWrite (last-write-wins)', () => {
  it('writes records that are new or newer, and skips older or equal ones', () => {
    const local = [task('a', 'local A', T1), task('b', 'local B', T1), task('c', 'local C', T1)]
    const incoming = [
      task('a', 'older A', T0), // older → skip
      task('b', 'newer B', T2), // newer → write
      task('c', 'same C', T1), // same time → keep ours
      task('d', 'new D', T0), // new → write
    ]

    expect(recordsToWrite(local, incoming, key).map((r) => r.title)).toEqual(['newer B', 'new D'])
  })
})

describe('backup round trip', () => {
  it('exports everything (including soft-deleted) and restores it into an empty database', async () => {
    const deleted = softDeleteTask(task('gone', 'Borrada'), T1)
    await db.tasks.bulkAdd([task('keep', 'Conservar'), deleted])
    await db.specialDays.add(
      createCustomDay(
        { name: 'Aniversario', category: 'personal', month: 2, day: 29, sinceYear: null },
        'd1',
        T0,
      ),
    )

    const backup = await createBackup(new Date(T2))
    const text = JSON.stringify(backup)
    await Promise.all(db.tables.map((table) => table.clear()))

    const result = await importBackup(text)

    expect(result).toEqual({ ok: true, written: { tasks: 2, specialDays: 1, settings: 0 } })
    expect(await db.tasks.get('gone')).toMatchObject({ deletedAt: T1 })
    const day = await db.specialDays.get('d1')
    expect(day).toMatchObject({ name: 'Aniversario', rule: { month: 2, day: 29 } })
    expect(day).not.toHaveProperty('sinceYear')
  })

  it('does not overwrite newer local changes', async () => {
    await db.tasks.add(task('a', 'Editada en el celular', T2))
    const backup = await createBackup()
    backup.tasks = [task('a', 'Versión vieja del respaldo', T0)]

    const result = await importBackup(JSON.stringify(backup))

    expect(result).toEqual({ ok: true, written: { tasks: 0, specialDays: 0, settings: 0 } })
    expect((await db.tasks.get('a'))?.title).toBe('Editada en el celular')
  })
})

describe('importBackup with bad files', () => {
  it.each([
    ['not JSON', 'hola', 'El archivo no es un respaldo válido.'],
    [
      'another app',
      JSON.stringify({ app: 'otra-app' }),
      'El archivo no es un respaldo de Agenda familiar o está dañado.',
    ],
    [
      'an invalid date inside',
      JSON.stringify({
        app: 'agenda-familiar',
        version: 1,
        exportedAt: T0,
        tasks: [{ ...task('x', 'x'), dueDate: '2026-02-30' }],
        specialDays: [],
        settings: [],
      }),
      'El archivo no es un respaldo de Agenda familiar o está dañado.',
    ],
  ])('rejects %s without touching the database', async (_, text, error) => {
    await db.tasks.add(task('safe', 'No me toques'))

    expect(await importBackup(text)).toEqual({ ok: false, error })
    expect(await db.tasks.count()).toBe(1)
  })
})
