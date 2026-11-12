import { useMemo } from 'react'
import { todayISODate, type ISODate } from '../../shared/lib/date'
import { FeedbackBanner } from '../../shared/ui/Feedback'
import { useFeedback } from '../../shared/ui/use-feedback'
import { Page } from '../../shared/ui/Page'
import { useCustomSpecialDays } from '../special-days/custom-days'
import { MEXICAN_SPECIAL_DAYS } from '../special-days/mexico'
import { SpecialDayFilters } from '../special-days/SpecialDayFilters'
import { useSpecialDayPreferences } from '../special-days/useSpecialDayPreferences'
import { isDone, type Task } from '../tasks/task-model'
import { useTasks } from '../tasks/tasks-context'
import { MonthCalendar } from './MonthCalendar'

export function CalendarPage() {
  const { preferences, toggleCategory, hideDay, showDay } = useSpecialDayPreferences()
  const customDays = useCustomSpecialDays()
  const { tasks, addTask, setDone } = useTasks()
  const { feedback, notify, run, clear } = useFeedback()

  const allSpecialDays = useMemo(() => [...customDays, ...MEXICAN_SPECIAL_DAYS], [customDays])

  function handleToggleTask(task: Task) {
    const done = !isDone(task)
    void run(
      () => setDone(task.id, done),
      () => notify(done ? `«${task.title}» terminada.` : `«${task.title}» volvió a pendientes.`),
    )
  }

  function handleAddTask(date: ISODate, title: string) {
    return run(
      () => addTask({ title, notes: '', important: false, urgent: false, dueDate: date }),
      () => notify(`Tarea agregada: «${title}».`),
    )
  }

  return (
    <Page title="Calendario">
      <div className="space-y-4">
        <FeedbackBanner feedback={feedback} onDismiss={clear} />
        <MonthCalendar
          specialDays={allSpecialDays}
          preferences={preferences}
          tasks={tasks}
          today={todayISODate()}
          onHideDay={(id) => void hideDay(id)}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
        />
        <SpecialDayFilters
          specialDays={allSpecialDays}
          preferences={preferences}
          onToggleCategory={(category) => void toggleCategory(category)}
          onShowDay={(id) => void showDay(id)}
        />
      </div>
    </Page>
  )
}
