import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext } from './theme-context'
import {
  DEFAULT_THEME,
  isTheme,
  nextTheme,
  THEME_META,
  THEME_STORAGE_KEY,
  type Theme,
} from './themes'

/** The inline script in index.html already applied the saved theme, so the DOM is the source of truth. */
function readInitialTheme(): Theme {
  const fromDom = document.documentElement.dataset.theme
  return isTheme(fromDom) ? fromDom : DEFAULT_THEME
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_META[theme].browserColor)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be unavailable (private mode). The theme still works for this session.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  // Side effects live in the event handler, not in a useEffect: the change happens
  // because the user clicked, not because React rendered.
  const toggleTheme = useCallback(() => {
    const next = nextTheme(theme)
    applyTheme(next)
    setTheme(next)
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
