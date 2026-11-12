import { RefreshCw, WifiOff, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const ONE_HOUR = 60 * 60 * 1000

/**
 * Service worker lifecycle, made visible (ADR 0005):
 * - "offlineReady": the first install finished; the app now opens without internet.
 * - "needRefresh": a new version is downloaded and waiting. We do not reload on our own,
 *   because someone could be typing a task. The person chooses when.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // An installed app on iPhone can stay open for days: check for updates every hour.
      if (registration) setInterval(() => void registration.update(), ONE_HOUR)
    },
  })

  const close = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  return (
    // Always rendered: a live region must exist before its content changes.
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md empty:hidden"
    >
      {(needRefresh || offlineReady) && (
        <div className="flex items-center gap-3 rounded-theme border-2 border-accent bg-surface p-3 shadow-lg">
          {needRefresh ? (
            <RefreshCw aria-hidden="true" className="size-5 shrink-0 text-accent" />
          ) : (
            <WifiOff aria-hidden="true" className="size-5 shrink-0 text-accent" />
          )}
          <p className="flex-1 text-sm">
            {needRefresh
              ? 'Hay una versión nueva de la agenda.'
              : 'Lista para usarse sin internet.'}
          </p>
          {needRefresh && (
            <button
              type="button"
              onClick={() => void updateServiceWorker()}
              className="min-h-11 rounded-theme bg-accent px-3 font-bold text-accent-fg hover:opacity-90"
            >
              Actualizar
            </button>
          )}
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar aviso"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-theme text-fg-muted hover:bg-accent-soft"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}
