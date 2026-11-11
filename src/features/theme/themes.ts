export const THEMES = ['kawaii', 'aventura'] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'kawaii'
export const THEME_STORAGE_KEY = 'theme'

interface ThemeMeta {
  /** Name shown to people (Spanish UI). */
  label: string
  /** Browser UI color (iPhone status bar). Must match --t-bg in index.css. */
  browserColor: string
}

export const THEME_META: Record<Theme, ThemeMeta> = {
  kawaii: { label: 'Kawaii', browserColor: '#fff5f8' },
  aventura: { label: 'Aventura', browserColor: '#0f2418' },
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

/** The theme that comes after `theme`, wrapping around. Works for any number of themes. */
export function nextTheme(theme: Theme): Theme {
  const index = THEMES.indexOf(theme)
  return THEMES[(index + 1) % THEMES.length] ?? DEFAULT_THEME
}
