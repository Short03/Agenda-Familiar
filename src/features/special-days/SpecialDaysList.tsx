import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { toLocalDate } from '../../shared/lib/date'
import { getSpecialDaysInMonth } from './occurrences'
import {
  CATEGORY_LABELS,
  DEFAULT_PREFERENCES,
  type SpecialDay,
  type SpecialDayOccurrence,
  type SpecialDayPreferences,
} from './types'

const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric' })

function yearsLabel({ specialDay, years }: SpecialDayOccurrence): string | null {
  if (years === undefined || specialDay.category !== 'familia') return null
  return years === 0 ? 'Nacimiento' : `Cumple ${years}`
}

interface SpecialDaysListProps {
  days: readonly SpecialDay[]
  initialYear: number
  /** 1-12 */
  initialMonth: number
  preferences?: SpecialDayPreferences
}

/**
 * Temporary view of the rules engine (Phase 2). Phase 3 replaces it with the month grid.
 */
export function SpecialDaysList({
  days,
  initialYear,
  initialMonth,
  preferences = DEFAULT_PREFERENCES,
}: SpecialDaysListProps) {
  // One number for year + month avoids keeping two pieces of state in sync.
  const [monthIndex, setMonthIndex] = useState(initialYear * 12 + (initialMonth - 1))
  const year = Math.floor(monthIndex / 12)
  const month = (monthIndex % 12) + 1

  const occurrences = getSpecialDaysInMonth(days, year, month, preferences)
  const title = monthFormatter.format(new Date(year, month - 1, 1))

  return (
    <section aria-labelledby="special-days-title">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonthIndex((i) => i - 1)}
          aria-label="Mes anterior"
          className="inline-flex size-11 items-center justify-center rounded-theme border-2 border-border bg-surface text-fg hover:bg-accent-soft"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <h2
          id="special-days-title"
          aria-live="polite"
          className="text-xl font-bold text-fg first-letter:uppercase"
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setMonthIndex((i) => i + 1)}
          aria-label="Mes siguiente"
          className="inline-flex size-11 items-center justify-center rounded-theme border-2 border-border bg-surface text-fg hover:bg-accent-soft"
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>

      {occurrences.length === 0 ? (
        <p className="text-fg-muted">No hay fechas especiales este mes.</p>
      ) : (
        <ul className="space-y-2">
          {occurrences.map((occurrence) => {
            const { date, specialDay } = occurrence
            const isFamily = specialDay.category === 'familia'
            const extra = yearsLabel(occurrence)
            return (
              <li
                key={`${specialDay.id}-${date}`}
                className={[
                  'flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-theme border-2 bg-surface px-4 py-3',
                  isFamily ? 'border-accent' : 'border-border',
                ].join(' ')}
              >
                <time dateTime={date} className="w-28 shrink-0 font-semibold text-fg-muted">
                  {dayFormatter.format(toLocalDate(date))}
                </time>
                <span className={isFamily ? 'font-bold text-accent' : 'text-fg'}>
                  {specialDay.name}
                  {extra && <span className="ml-2 font-semibold">· {extra}</span>}
                </span>
                <span className="ml-auto rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-fg">
                  {CATEGORY_LABELS[specialDay.category]}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
