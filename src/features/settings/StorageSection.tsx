import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getStorageStatus,
  isInstalledApp,
  requestPersistentStorage,
  type StorageStatus,
} from '../../shared/lib/storage'

const MESSAGES: Record<StorageStatus, string> = {
  persisted: 'Tus datos están protegidos: el navegador no los borrará para liberar espacio.',
  'best-effort':
    'El navegador podría borrar los datos si se queda sin espacio. Haz respaldos de vez en cuando.',
  unsupported: 'Este navegador no permite proteger los datos. Haz respaldos de vez en cuando.',
}

export function StorageSection() {
  const [status, setStatus] = useState<StorageStatus | null>(null)
  const installed = isInstalledApp()

  useEffect(() => {
    let active = true
    void getStorageStatus().then((value) => {
      if (active) setStatus(value)
    })
    return () => {
      active = false
    }
  }, [])

  if (status === null) return <p className="text-fg-muted">Revisando el almacenamiento…</p>

  const Icon = status === 'persisted' ? ShieldCheck : ShieldAlert

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2">
        <Icon
          aria-hidden="true"
          className={`mt-0.5 size-5 shrink-0 ${status === 'persisted' ? 'text-cat-civica' : 'text-cat-tradicion'}`}
        />
        <span>{MESSAGES[status]}</span>
      </p>

      {status === 'best-effort' && (
        <button
          type="button"
          onClick={() => void requestPersistentStorage().then(setStatus)}
          className="min-h-11 rounded-theme border-2 border-accent px-4 font-semibold text-accent hover:bg-accent-soft"
        >
          Pedir protección de datos
        </button>
      )}

      {!installed && (
        <p className="text-sm text-fg-muted">
          En iPhone: abre esta página en Safari, toca <strong>Compartir</strong> y luego{' '}
          <strong>Agregar a inicio</strong>. Instalada, la app guarda los datos de forma más segura.
        </p>
      )}
    </div>
  )
}
