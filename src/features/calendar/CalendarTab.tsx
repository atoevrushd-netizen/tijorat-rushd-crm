import { useMemo, useState } from 'react'
import type { Task } from '@/types'
import { useAuth } from '@/features/auth/useAuth'
import { useUser } from '@/features/users/useUser'
import { useTasks } from '@/features/tasks/useTasks'
import { Skeleton } from '@/components/ui/Skeleton'
import { MonthCalendar } from './MonthCalendar'
import { DayTasksPanel } from './DayTasksPanel'
import { CreateCalendarTaskModal } from './CreateCalendarTaskModal'
import { groupTasksByDate, ymd } from './calendarUtils'

/** Задачи дня по времени; без времени — в конец. */
function sortByTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) =>
    (a.due_time ?? '99:99').localeCompare(b.due_time ?? '99:99'),
  )
}

/**
 * Вкладка «Календарь»: сверху сетка месяца, снизу — задачи выбранного дня.
 * Админ создаёт задачи на день; лид только просматривает. Подсвечивается
 * период подписки (subscription_start..end профиля).
 */
export function CalendarTab({ userId, tabId }: { userId: string; tabId: string }) {
  const { role, profile } = useAuth()
  const isAdmin = role === 'admin'
  const isOwner = profile?.id === userId

  // Период подписки берём из профиля: у владельца он уже есть в useAuth,
  // иначе подгружаем (в карточке админа запрос дедуплицируется react-query).
  const { data: fetched } = useUser(isOwner ? undefined : userId)
  const subProfile = isOwner ? profile : fetched

  // Только задачи вкладки «Календарь» — создание/показ/удаление согласованы.
  const { data: tasks, isLoading } = useTasks(userId, tabId)

  const today = ymd(new Date())
  const [selected, setSelected] = useState(today)
  const [view, setView] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [createOpen, setCreateOpen] = useState(false)

  const byDate = useMemo(() => groupTasksByDate(tasks ?? []), [tasks])
  const dayTasks = useMemo(() => sortByTime(byDate[selected] ?? []), [byDate, selected])

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  if (isLoading) return <Skeleton className="h-[460px] w-full" />

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        <MonthCalendar
          year={view.year}
          month={view.month}
          selected={selected}
          today={today}
          tasksByDate={byDate}
          subStart={subProfile?.subscription_start ?? null}
          subEnd={subProfile?.subscription_end ?? null}
          onSelect={setSelected}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
        />

        <DayTasksPanel
          date={selected}
          tasks={dayTasks}
          isAdmin={isAdmin}
          onAdd={() => setCreateOpen(true)}
        />
      </div>

      {isAdmin && (
        <CreateCalendarTaskModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          userId={userId}
          tabId={tabId}
          date={selected}
        />
      )}
    </div>
  )
}
