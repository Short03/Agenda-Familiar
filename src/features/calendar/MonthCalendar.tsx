import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  addDays,
  addMonths,
  getDateParts,
  mondayBasedWeekday,
  toLocalDate,
  type ISODate,
} from '../../shared/lib/date'
import { CategoryMarker } from '../special-days/CategoryMarker'
import { getSpecialDaysInRange, groupByDate } from '../special-days/occurrences'
import type { SpecialDay, SpecialDayPreferences } from '../special-days/types'
import { DayDetails } from './DayDetails'
import { buildMonthGrid, getMonthGridRange } from './month-grid'

const monthTitleFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })
const cellLabelFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const weekdayShort = new Intl.DateTimeFormat('es-MX', { weekday: 'short' })
const weekdayLong = new Intl.DateTimeFormat('es-MX', { weekday: 'long' })

/** Jan 1st 2024 was a Monday: format 7 consecutive days to get Monday-first headers. */
const WEEKDAY_HEADERS = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(2024, 0, 1 + i)
  return { short: weekdayShort.format(date), long: weekdayLong.format(date) }
})

const MAX_MARKERS = 3

/** Keyboard model of the WAI-ARIA APG date grid. */
const KEY_MOVES: Record<string, (date: ISODate) => ISODate> = {
  ArrowLeft: (d) => addDays(d, -1),
  ArrowRight: (d) => addDays(d, 1),
  ArrowUp: (d) => addDays(d, -7),
  ArrowDown: (d) => addDays(d, 7),
  Home: (d) => addDays(d, -mondayBasedWeekday(d)),
  End: (d) => addDays(d, 6 - mondayBasedWeekday(d)),
  PageUp: (d) => addMonths(d, -1),
  PageDown: (d) => addMonths(d, 1),
}

interface MonthCalendarProps {
  specialDays: readonly SpecialDay[]
  preferences: SpecialDayPreferences
  today: ISODate
  onHideDay: (id: string) => void
}

export function MonthCalendar({ specialDays, preferences, today, onHideDay }: MonthCalendarProps) {
  // Single source of truth: the visible month is derived from the selected day.
  const [selected, setSelected] = useState<ISODate>(today)
  const { year, month } = getDateParts(selected)

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month])
  const occurrencesByDate = useMemo(() => {
    const { start, end } = getMonthGridRange(year, month)
    return groupByDate(getSpecialDaysInRange(specialDays, start, end, preferences))
  }, [specialDays, preferences, year, month])

  // Roving tabindex: only the selected day is in the Tab order. After a keyboard move,
  // focus follows the selection (but not after clicking "next month").
  const gridRef = useRef<HTMLTableElement>(null)
  const shouldFocusSelected = useRef(false)

  useEffect(() => {
    if (!shouldFocusSelected.current) return
    shouldFocusSelected.current = false
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${selected}"]`)?.focus()
  }, [selected])

  function handleGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const move = KEY_MOVES[event.key]
    if (!move) return
    event.preventDefault()
    shouldFocusSelected.current = true
    setSelected(move(selected))
  }

  const title = monthTitleFormatter.format(new Date(year, month - 1, 1))
  const selectedOccurrences = occurrencesByDate.get(selected) ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="rounded-theme border-2 border-border bg-surface p-2 sm:p-4">
        <div className="mb-2 flex items-center gap-2">
          <h2
            id="month-title"
            aria-live="polite"
            className="flex-1 pl-2 text-lg font-bold first-letter:uppercase sm:text-xl"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={() => setSelected(today)}
            className="min-h-11 rounded-theme px-3 font-semibold text-accent hover:bg-accent-soft"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setSelected(addMonths(selected, -1))}
            aria-label="Mes anterior"
            className="inline-flex size-11 items-center justify-center rounded-theme text-fg hover:bg-accent-soft"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setSelected(addMonths(selected, 1))}
            aria-label="Mes siguiente"
            className="inline-flex size-11 items-center justify-center rounded-theme text-fg hover:bg-accent-soft"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>

        {/*
          role="grid" on a <table> is the WAI-ARIA APG date grid pattern: it tells screen
          readers that arrow keys move between days. Allowed in .oxlintrc.json.
        */}
        <table
          ref={gridRef}
          role="grid"
          aria-labelledby="month-title"
          onKeyDown={handleGridKeyDown}
          className="w-full table-fixed border-separate border-spacing-0.5"
        >
          <thead>
            <tr>
              {WEEKDAY_HEADERS.map(({ short, long }) => (
                <th
                  key={long}
                  scope="col"
                  abbr={long}
                  className="py-1 text-xs font-semibold text-fg-muted uppercase"
                >
                  {short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]}>
                {week.map((date) => {
                  const parts = getDateParts(date)
                  const isOutside = parts.month !== month
                  const isToday = date === today
                  const isSelected = date === selected
                  const occurrences = occurrencesByDate.get(date) ?? []
                  const names = occurrences.map((o) => o.specialDay.name)
                  const label = [
                    cellLabelFormatter.format(toLocalDate(date)),
                    isToday ? 'hoy' : null,
                    ...names,
                  ]
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <td key={date} aria-selected={isSelected} className="p-0">
                      <button
                        type="button"
                        data-date={date}
                        tabIndex={isSelected ? 0 : -1}
                        aria-label={label}
                        aria-current={isToday ? 'date' : undefined}
                        onClick={() => setSelected(date)}
                        className={[
                          'flex min-h-14 w-full flex-col items-center gap-1 rounded-theme border-2 pt-1 pb-1.5 sm:min-h-20',
                          isSelected
                            ? 'border-accent bg-accent-soft'
                            : 'border-transparent hover:bg-accent-soft',
                          isOutside ? 'text-fg-muted' : 'text-fg',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'inline-flex size-7 items-center justify-center rounded-full text-sm',
                            isToday ? 'bg-accent font-bold text-accent-fg' : 'font-semibold',
                          ].join(' ')}
                        >
                          {parts.day}
                        </span>
                        <span aria-hidden="true" className="flex h-3.5 items-center gap-0.5">
                          {occurrences.slice(0, MAX_MARKERS).map((o) => (
                            <CategoryMarker
                              key={o.specialDay.id}
                              category={o.specialDay.category}
                            />
                          ))}
                          {occurrences.length > MAX_MARKERS && (
                            <span className="text-[0.625rem] leading-none font-bold">+</span>
                          )}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DayDetails date={selected} occurrences={selectedOccurrences} onHideDay={onHideDay} />
    </div>
  )
}
