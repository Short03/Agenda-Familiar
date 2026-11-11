import { Cake } from 'lucide-react'
import type { SpecialDayCategory } from './types'

/** Full class names (not built with template strings) so Tailwind can find them. */
const CATEGORY_BG: Record<SpecialDayCategory, string> = {
  oficial: 'bg-cat-oficial',
  civica: 'bg-cat-civica',
  tradicion: 'bg-cat-tradicion',
  familia: 'bg-cat-familia',
  personal: 'bg-cat-personal',
}

interface CategoryMarkerProps {
  category: SpecialDayCategory
  size?: 'sm' | 'md'
}

/**
 * Decorative marker. Color is never the only signal: the category name is always
 * available as text (details list, cell label), so this stays aria-hidden.
 */
export function CategoryMarker({ category, size = 'sm' }: CategoryMarkerProps) {
  if (category === 'familia') {
    return (
      <Cake
        aria-hidden="true"
        className={`${size === 'sm' ? 'size-3.5' : 'size-4'} shrink-0 text-cat-familia`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`${size === 'sm' ? 'size-2' : 'size-3'} inline-block shrink-0 rounded-full ${CATEGORY_BG[category]}`}
    />
  )
}
