import { Heart, Sword } from 'lucide-react'
import { useTheme } from './theme-context'
import { nextTheme, THEME_META, type Theme } from './themes'

const ICONS: Record<Theme, typeof Heart> = {
  kawaii: Heart,
  aventura: Sword,
}

/**
 * Shows the theme you will switch TO. The accessible name describes the action
 * ("Cambiar a tema Aventura") and contains the visible text (WCAG 2.5.3 Label in Name).
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const target = nextTheme(theme)
  const Icon = ICONS[target]
  const label = THEME_META[target].label

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${label}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-theme border-2 border-border bg-surface px-3 text-sm font-semibold text-fg hover:bg-accent-soft"
    >
      <Icon aria-hidden="true" className="size-5 text-accent" />
      <span>{label}</span>
    </button>
  )
}
