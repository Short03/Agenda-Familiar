import { getDateParts, todayISODate } from '../../shared/lib/date'
import { Page } from '../../shared/ui/Page'
import { FAMILY_SPECIAL_DAYS } from '../special-days/family'
import { MEXICAN_SPECIAL_DAYS } from '../special-days/mexico'
import { SpecialDaysList } from '../special-days/SpecialDaysList'

const ALL_SPECIAL_DAYS = [...FAMILY_SPECIAL_DAYS, ...MEXICAN_SPECIAL_DAYS]

export function CalendarPage() {
  const { year, month } = getDateParts(todayISODate())

  return (
    <Page title="Calendario">
      <SpecialDaysList days={ALL_SPECIAL_DAYS} initialYear={year} initialMonth={month} />
    </Page>
  )
}
