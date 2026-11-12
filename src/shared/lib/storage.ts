/**
 * Persistent storage asks the browser not to evict our IndexedDB data when space runs low
 * (ADR 0001). Safari also gives installed Home Screen apps their own, safer storage.
 */
export type StorageStatus = 'persisted' | 'best-effort' | 'unsupported'

export async function getStorageStatus(): Promise<StorageStatus> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persisted) return 'unsupported'
  return (await navigator.storage.persisted()) ? 'persisted' : 'best-effort'
}

export async function requestPersistentStorage(): Promise<StorageStatus> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return 'unsupported'
  try {
    return (await navigator.storage.persist()) ? 'persisted' : 'best-effort'
  } catch {
    return 'best-effort'
  }
}

/** True when opened from the Home Screen (installed), not inside a Safari tab. */
export function isInstalledApp(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia?.('(display-mode: standalone)').matches === true
}
