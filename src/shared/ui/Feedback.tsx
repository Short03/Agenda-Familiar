import { Undo2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Feedback } from './use-feedback'

interface FeedbackBannerProps {
  feedback: Feedback | null
  onDismiss: () => void
}

export function FeedbackBanner({ feedback, onDismiss }: FeedbackBannerProps) {
  const undoButtonRef = useRef<HTMLButtonElement>(null)

  // When an item leaves a list (done, deleted), its controls disappear and keyboard
  // focus would fall back to <body>. Moving focus to "Deshacer" keeps people in place.
  useEffect(() => {
    if (feedback?.undo) undoButtonRef.current?.focus()
  }, [feedback])

  return (
    // Always in the DOM: live regions must exist before their content changes.
    <div role="status" aria-live="polite" className="empty:hidden">
      {feedback && (
        <div
          key={feedback.key}
          className={[
            'flex items-center gap-3 rounded-theme border-2 px-4 py-2',
            feedback.tone === 'error'
              ? 'border-cat-oficial bg-surface font-semibold text-cat-oficial'
              : 'border-accent bg-accent-soft',
          ].join(' ')}
        >
          <p className="flex-1 break-words">{feedback.message}</p>
          {feedback.undo && (
            <button
              ref={undoButtonRef}
              type="button"
              onClick={async () => {
                await feedback.undo?.()
                onDismiss()
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-theme px-3 font-bold text-accent hover:bg-surface"
            >
              <Undo2 aria-hidden="true" className="size-5" />
              Deshacer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
