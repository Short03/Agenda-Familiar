import { useCallback, useState } from 'react'

/** Last thing that happened, announced in a live region, optionally with "undo". */
export interface Feedback {
  /** Changes on every action, so repeating the same text is announced again. */
  key: number
  message: string
  tone: 'info' | 'error'
  undo?: () => void | Promise<void>
}

/**
 * Feedback for actions that write to the database.
 * `run` awaits the write and reports a friendly error if it fails (storage full, private mode).
 */
export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const notify = useCallback(
    (message: string, options: { undo?: Feedback['undo']; tone?: Feedback['tone'] } = {}) =>
      setFeedback((previous) => ({
        key: (previous?.key ?? 0) + 1,
        message,
        tone: options.tone ?? 'info',
        ...(options.undo ? { undo: options.undo } : {}),
      })),
    [],
  )

  /** Returns whether the action worked, so callers can keep the form filled on failure. */
  const run = useCallback(
    async (action: () => Promise<unknown>, onSuccess: () => void): Promise<boolean> => {
      try {
        await action()
        onSuccess()
        return true
      } catch (error) {
        console.error(error)
        notify('No se pudo guardar. Intenta de nuevo.', { tone: 'error' })
        return false
      }
    },
    [notify],
  )

  return { feedback, notify, run, clear: () => setFeedback(null) }
}
