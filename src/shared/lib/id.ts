/**
 * Random UUID v4 for records that must sync between phones without collisions (ADR 0001).
 *
 * `crypto.randomUUID()` only exists in secure contexts (https or localhost). When you open
 * the dev server from an iPhone through the LAN (http://192.168.x.x) it is undefined, so we
 * fall back to `crypto.getRandomValues`, which works everywhere.
 */
export function createId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40 // version 4
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80 // RFC 4122 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
