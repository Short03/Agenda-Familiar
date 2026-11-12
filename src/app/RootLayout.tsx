import { CalendarDays, ListChecks, Settings } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { ThemeToggle } from '../features/theme/ThemeToggle'
import { SkipLink } from '../shared/ui/SkipLink'

const MAIN_ID = 'main'

const SECTIONS = [
  { to: '/calendario', label: 'Calendario', Icon: CalendarDays },
  { to: '/tareas', label: 'Tareas', Icon: ListChecks },
] as const

/**
 * In a SPA the browser does not move focus on navigation, so screen reader users
 * would not notice the page changed. After every navigation (not the first load)
 * we move focus to the new page's <h1>.
 */
function useFocusHeadingOnNavigation() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  // Comparing paths (instead of an "isFirstRender" flag) also survives StrictMode,
  // which runs effects twice on mount in development.
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    mainRef.current?.querySelector('h1')?.focus()
  }, [pathname])

  return mainRef
}

export function RootLayout() {
  const mainRef = useFocusHeadingOnNavigation()

  return (
    <div className="min-h-dvh pb-[env(safe-area-inset-bottom)]">
      <SkipLink targetId={MAIN_ID} />

      <header className="border-b-2 border-border bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <ThemeToggle />
          <p className="min-w-0 flex-1 truncate font-display text-lg font-bold text-accent">
            Agenda familiar
          </p>
          <NavLink
            to="/ajustes"
            aria-label="Ajustes"
            className={({ isActive }) =>
              [
                'inline-flex size-11 shrink-0 items-center justify-center rounded-theme hover:bg-accent-soft',
                isActive ? 'bg-accent-soft text-accent' : 'text-fg-muted',
              ].join(' ')
            }
          >
            <Settings aria-hidden="true" className="size-6" />
          </NavLink>
        </div>

        <nav aria-label="Secciones" className="mx-auto max-w-5xl px-4">
          <ul className="flex gap-1">
            {SECTIONS.map(({ to, label, Icon }) => (
              <li key={to} className="flex-1 sm:flex-none">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    [
                      'flex min-h-11 items-center justify-center gap-2 border-b-4 px-4 font-semibold',
                      isActive
                        ? 'border-accent text-accent'
                        : 'border-transparent text-fg-muted hover:text-fg',
                    ].join(' ')
                  }
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main
        id={MAIN_ID}
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto max-w-5xl px-4 py-6 focus:outline-none"
      >
        <Outlet />
      </main>
    </div>
  )
}
