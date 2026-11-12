import { Download, Upload } from 'lucide-react'
import { useId, useRef, type ChangeEvent } from 'react'
import { todayISODate } from '../../shared/lib/date'
import { FeedbackBanner } from '../../shared/ui/Feedback'
import { useFeedback } from '../../shared/ui/use-feedback'
import { createBackup, importBackup, saveBackupFile } from './backup'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // a family agenda will never be close to 10 MB

export function BackupSection() {
  const id = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { feedback, notify, clear } = useFeedback()

  async function handleExport() {
    try {
      await saveBackupFile(await createBackup(), todayISODate())
      notify('Respaldo listo.')
    } catch (error) {
      console.error(error)
      notify('No se pudo crear el respaldo.', { tone: 'error' })
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow choosing the same file again
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      notify('El archivo es demasiado grande para ser un respaldo.', { tone: 'error' })
      return
    }

    const result = await importBackup(await file.text())
    if (!result.ok) {
      notify(result.error, { tone: 'error' })
      return
    }
    const { tasks, specialDays } = result.written
    notify(
      tasks + specialDays === 0
        ? 'Todo estaba al día: no había cambios nuevos.'
        : `Respaldo cargado: ${tasks} tareas y ${specialDays} fechas actualizadas.`,
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-fg-muted">
        Guarda una copia de tus tareas y fechas. Al cargar un respaldo se combinan los datos: se
        conserva siempre la versión más reciente de cada cosa.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleExport()}
          className="inline-flex min-h-11 items-center gap-2 rounded-theme bg-accent px-4 font-bold text-accent-fg hover:opacity-90"
        >
          <Download aria-hidden="true" className="size-5" />
          Guardar respaldo
        </button>

        <input
          ref={fileInputRef}
          id={`${id}-file`}
          type="file"
          accept="application/json,.json"
          onChange={(event) => void handleImport(event)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex min-h-11 items-center gap-2 rounded-theme border-2 border-accent px-4 font-semibold text-accent hover:bg-accent-soft"
        >
          <Upload aria-hidden="true" className="size-5" />
          Cargar respaldo
        </button>
      </div>
      <FeedbackBanner feedback={feedback} onDismiss={clear} />
    </div>
  )
}
