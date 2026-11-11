import type { SpecialDay } from './types'

/**
 * Temporary bridge until Phase 5, when family days are entered in the app and stored
 * in IndexedDB. Real birthdays live in `family.local.ts`, which git ignores, so they never
 * reach the repository. Copy `family.example.ts` to `family.local.ts` to add yours.
 *
 * Note: a local file IS bundled by `pnpm build` on this machine. CI builds do not have it,
 * so a deployed site never contains it.
 */
const localModules = import.meta.glob<readonly SpecialDay[]>('./family.local.ts', {
  eager: true,
  import: 'FAMILY_SPECIAL_DAYS',
})

export const FAMILY_SPECIAL_DAYS: readonly SpecialDay[] = Object.values(localModules)[0] ?? []
