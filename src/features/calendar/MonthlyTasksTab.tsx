import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { taskTitle } from '@/lib/taskI18n'
import { monthYear } from '@/lib/dateI18n'
import { useT } from '@/i18n/useT'
import { useAuth } from '@/features/auth/useAuth'
import { canManage } from '@/features/auth/roles'
import { useTasks, useSetTaskStatus } from '@/features/tasks/useTasks'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Task } from '@/types'
import { TASK_CATEGORIES, categoryIndex, groupByMonth, isTaskDone, monthStart, shiftMonth } from './monthly'

/**
 * Вкладка «Календарь» (помесячный вид, 0048): переключатель месяцев + задачи месяца
 * по категориям. Чекбоксы ставит ТОЛЬКО админ (бинарно: сделано/не сделано);
 * резидент видит статус, но не может кликать.
 */
export function MonthlyTasksTab({ userId, tabId }: { userId: string; tabId: string }) {
  const { role } = useAuth()
  const isAdmin = canManage(role)
  const { data: tasks, isLoading } = useTasks(userId, tabId)
  const [month, setMonth] = useState(() => monthStart(new Date()))

  const byMonth = useMemo(() => groupByMonth(tasks ?? []), [tasks])
  const monthTasks = byMonth[month] ?? []

  if (isLoading) return <Skeleton className="h-[420px] w-full" />

  return (
    <div className="space-y-4">
      <MonthHeader month={month} tasks={monthTasks} onShift={(d) => setMonth((m) => shiftMonth(m, d))} />
      {monthTasks.length === 0 ? (
        <EmptyMonth isAdmin={isAdmin} />
      ) : (
        <CategoryList tasks={monthTasks} isAdmin={isAdmin} />
      )}
    </div>
  )
}

/** Шапка месяца (океановый градиент) + прогресс выполнения. */
function MonthHeader({ month, tasks, onShift }: { month: string; tasks: Task[]; onShift: (d: number) => void }) {
  const { t, lang } = useT()
  const [y, m] = month.split('-').map(Number)
  const label = monthYear(new Date(y, m - 1, 1), lang)
  const done = tasks.filter(isTaskDone).length
  const total = tasks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="rounded-[20px] bg-accent-grad p-3 text-on-accent shadow-glow sm:p-4">
      <div className="flex items-center gap-2">
        <Circle onClick={() => onShift(-1)} label={t('cal.prevMonth')}>
          <ChevronLeft size={20} />
        </Circle>
        <div className="min-w-0 flex-1 text-center text-[18px] font-extrabold capitalize leading-tight sm:text-[20px]">
          {label}
        </div>
        <Circle onClick={() => onShift(1)} label={t('cal.nextMonth')}>
          <ChevronRight size={20} />
        </Circle>
      </div>
      {total > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[12px] font-semibold text-white/90">
            <span>{t('cal.monthProgress')}</span>
            <span>{done} / {total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

/** Задачи месяца, сгруппированные по категориям (в порядке программы). */
function CategoryList({ tasks, isAdmin }: { tasks: Task[]; isAdmin: boolean }) {
  const { t, lang } = useT()
  // Группируем по индексу категории (неизвестные типы — в общий «Прочее» в конце).
  const groups = useMemo(() => {
    const map = new Map<number, Task[]>()
    for (const task of tasks) {
      const idx = categoryIndex(task)
      const arr = map.get(idx) ?? []
      arr.push(task)
      map.set(idx, arr)
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [tasks])

  return (
    <div className="space-y-3">
      {groups.map(([idx, items]) => {
        const cat = TASK_CATEGORIES[idx]
        const Icon = cat?.icon
        const name = cat ? (lang === 'tg' ? cat.tg : cat.ru) : t('cal.otherCategory')
        const done = items.filter(isTaskDone).length
        return (
          <section key={idx} className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-sh1">
            <header className="flex items-center gap-2.5 border-b border-line bg-surface-2 px-4 py-2.5">
              {Icon && (
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-accent-soft text-accent">
                  <Icon size={17} />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">{name}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[11.5px] font-semibold', done === items.length ? 'bg-success-soft text-success' : 'bg-surface-3 text-ink-2')}>
                {done}/{items.length}
              </span>
            </header>
            <ul className="divide-y divide-line">
              {items.map((task) => (
                <TaskRow key={task.id} task={task} isAdmin={isAdmin} label={taskTitle(task, lang)} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

/** Строка задачи: название + чекбокс (админ) / индикатор статуса (резидент). */
function TaskRow({ task, isAdmin, label }: { task: Task; isAdmin: boolean; label: string }) {
  const { t } = useT()
  const setStatus = useSetTaskStatus()
  const done = isTaskDone(task)

  function toggle() {
    setStatus.mutate(
      { id: task.id, status: done ? 'not_started' : 'done' },
      { onSuccess: () => toast.success(t('common.saved')) },
    )
  }

  const box = 'flex h-7 w-7 flex-none items-center justify-center rounded-[8px] border-2 transition-all duration-150 ease-ios'
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className={cn('min-w-0 flex-1 break-words text-[13.5px]', done ? 'text-ink-3 line-through' : 'text-ink')}>
        {label}
      </span>
      {isAdmin ? (
        <button
          type="button"
          onClick={toggle}
          disabled={setStatus.isPending}
          aria-label={done ? t('cal.unmarkDone') : t('cal.markDone')}
          title={done ? t('cal.unmarkDone') : t('cal.markDone')}
          className={cn(box, done ? 'border-success bg-success text-white active:scale-90' : 'border-line-strong text-transparent hover:border-accent hover:text-accent active:scale-90')}
        >
          <Check size={15} strokeWidth={3} />
        </button>
      ) : (
        <span
          aria-label={done ? t('cal.doneLabel') : t('cal.notDoneLabel')}
          title={done ? t('cal.doneLabel') : t('cal.notDoneLabel')}
          className={cn(box, done ? 'border-success bg-success text-white' : 'border-line-strong text-transparent')}
        >
          <Check size={15} strokeWidth={3} />
        </span>
      )}
    </li>
  )
}

function EmptyMonth({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useT()
  return (
    <div className="rounded-[16px] border border-line bg-surface py-12 text-center">
      <p className="text-[14px] font-semibold text-ink">{t('cal.monthEmpty')}</p>
      {isAdmin && <p className="mt-1 text-[12.5px] text-ink-3">{t('cal.monthEmptyAdmin')}</p>}
    </div>
  )
}

function Circle({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/15 text-on-accent transition-all duration-150 ease-ios hover:bg-white/25 active:scale-90"
    >
      {children}
    </button>
  )
}
