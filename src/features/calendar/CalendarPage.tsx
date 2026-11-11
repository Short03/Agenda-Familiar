import { todayISODate } from '../../shared/lib/date'
import { Page } from '../../shared/ui/Page'
import { FAMILY_SPECIAL_DAYS } from '../special-days/family'
import { MEXICAN_SPECIAL_DAYS } from '../special-days/mexico'
import { SpecialDayFilters } from '../special-days/SpecialDayFilters'
import { useSpecialDayPreferences } from '../special-days/useSpecialDayPreferences'
import { MonthCalendar } from './MonthCalendar'

const ALL_SPECIAL_DAYS = [...FAMILY_SPECIAL_DAYS, ...MEXICAN_SPECIAL_DAYS]

export function CalendarPage() {
  const { preferences, toggleCategory, hideDay, showDay } = useSpecialDayPreferences()

  return (
    <Page title="Calendario">
      <div className="space-y-4">
        <MonthCalendar
          specialDays={ALL_SPECIAL_DAYS}
          preferences={preferences}
          today={todayISODate()}
          onHideDay={hideDay}
        />
        <SpecialDayFilters
          specialDays={ALL_SPECIAL_DAYS}
          preferences={preferences}
          onToggleCategory={toggleCategory}
          onShowDay={showDay}
        />
      </div>
    </Page>
  )
}
