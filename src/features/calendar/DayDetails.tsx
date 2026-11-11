import { EyeOff } from 'lucide-react'
import { toLocalDate, type ISODate } from '../../shared/lib/date'
import { CategoryMarker } from '../special-days/CategoryMarker'
import { yearsLabel } from '../special-days/occurrences'
import { CATEGORY_LABELS, type SpecialDayOccurrence } from '../special-days/types'

const longDateFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

interface DayDetailsProps {
  date: ISODate
  occurrences: readonly SpecialDayOccurrence[]
  onHideDay: (id: string) => void
}

export function DayDetails({ date, occurrences, onHideDay }: DayDetailsProps) {
  return (
    <section
      aria-labelledby="day-details-title"
      className="rounded-theme border-2 border-border bg-surface p-4"
    >
      <h3 id="day-details-title" className="mb-3 text-lg font-bold first-letter:uppercase">
        {longDateFormatter.format(toLocalDate(date))}
      </h3>

      {occurrences.length === 0 ? (
        <p className="text-fg-muted">Sin fechas especiales.</p>
      ) : (
        <ul className="space-y-2">
          {occurrences.map((occurrence) => {
            const { specialDay } = occurrence
            const isFamily = specialDay.category === 'familia'
            const extra = yearsLabel(occurrence)
            return (
              <li key={specialDay.id} className="flex items-center gap-3">
                <CategoryMarker category={specialDay.category} size="md" />
                <div className="min-w-0 flex-1">
                  <p className={isFamily ? 'font-bold text-accent' : 'font-semibold text-fg'}>
                    {specialDay.name}
                    {extra && <span className="ml-2">· {extra}</span>}
                  </p>
                  <p className="text-sm text-fg-muted">{CATEGORY_LABELS[specialDay.category]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onHideDay(specialDay.id)}
                  aria-label={`Ocultar ${specialDay.name}`}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-theme text-fg-muted hover:bg-accent-soft hover:text-fg"
                >
                  <EyeOff aria-hidden="true" className="size-5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
