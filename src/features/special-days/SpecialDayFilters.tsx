import { Eye, SlidersHorizontal } from 'lucide-react'
import { CategoryMarker } from './CategoryMarker'
import {
  CATEGORY_LABELS,
  SPECIAL_DAY_CATEGORIES,
  type SpecialDay,
  type SpecialDayCategory,
  type SpecialDayPreferences,
} from './types'

interface SpecialDayFiltersProps {
  specialDays: readonly SpecialDay[]
  preferences: SpecialDayPreferences
  onToggleCategory: (category: SpecialDayCategory) => void
  onShowDay: (id: string) => void
}

/**
 * Native <details> gives an accessible disclosure (keyboard, screen readers) with no JS.
 * Checkboxes use role="switch" because they turn something on/off immediately.
 */
export function SpecialDayFilters({
  specialDays,
  preferences,
  onToggleCategory,
  onShowDay,
}: SpecialDayFiltersProps) {
  const hiddenDays = specialDays.filter((day) => preferences.hiddenDayIds.includes(day.id))

  return (
    <details className="group rounded-theme border-2 border-border bg-surface">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-2 font-semibold">
        <SlidersHorizontal aria-hidden="true" className="size-5 text-accent" />
        Filtros del calendario
      </summary>

      <div className="space-y-5 border-t-2 border-border px-4 py-4">
        <fieldset>
          <legend className="mb-2 font-bold">Mostrar en el calendario</legend>
          <ul className="space-y-1">
            {SPECIAL_DAY_CATEGORIES.map((category) => (
              <li key={category}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={!preferences.hiddenCategories.includes(category)}
                    aria-checked={!preferences.hiddenCategories.includes(category)}
                    onChange={() => onToggleCategory(category)}
                    className="size-5 accent-accent"
                  />
                  <CategoryMarker category={category} size="md" />
                  {CATEGORY_LABELS[category]}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <section aria-labelledby="hidden-days-title">
          <h3 id="hidden-days-title" className="mb-2 font-bold">
            Fechas ocultas
          </h3>
          {hiddenDays.length === 0 ? (
            <p className="text-fg-muted">No has ocultado ninguna fecha.</p>
          ) : (
            <ul className="space-y-1">
              {hiddenDays.map((day) => (
                <li key={day.id} className="flex items-center gap-3">
                  <CategoryMarker category={day.category} size="md" />
                  <span className="flex-1">{day.name}</span>
                  <button
                    type="button"
                    onClick={() => onShowDay(day.id)}
                    aria-label={`Mostrar ${day.name}`}
                    className="inline-flex size-11 items-center justify-center rounded-theme text-fg-muted hover:bg-accent-soft hover:text-fg"
                  >
                    <Eye aria-hidden="true" className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </details>
  )
}
