import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { taskTitle } from '@/lib/taskI18n'
import { useT } from '@/i18n/useT'
import { useAuth } from '@/features/auth/useAuth'
import { canManage } from '@/features/auth/roles'
import { useTasks, useSetTaskStatus } from '@/features/tasks/useTasks'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Task } from '@/types'
import { MonthsRail } from './MonthsRail'
import { MonthHero } from './MonthHero'
import { TASK_CATEGORIES, buildMonthSummaries, categoryIndex, isTaskDone } from './monthly'

/**
 * Вкладка «Календарь» → путь по месяцам (0048). Без сетки дней: сверху рельс месяцев
 * (кольца прогресса), крупная карточка выбранного месяца с дневной «загрузкой», ниже —
 * задачи месяца по категориям. Чекбоксы ставит ТОЛЬКО админ; резидент видит статус.
 */
export function MonthlyTasksTab({ userId, tabId }: { userId: string; tabId: string }) {
  const { role } = useAuth()
  const isAdmin = canManage(role)
  const { data: tasks, isLoading } = useTasks(userId, tabId)

  const months = useMemo(() => buildMonthSummaries(tasks ?? [], new Date()), [tasks])
  const defaultKey = useMemo(() => {
    if (months.length === 0) return null
    return (months.find((m) => m.state === 'current') ?? months[months.length - 1]).key
  }, [months])
  const [picked, setPicked] = useState<string | null>(null)
  const activeKey = (picked && months.some((m) => m.key === picked) ? picked : defaultKey) ?? ''
  const selected = months.find((m) => m.key === activeKey) ?? null

  if (isLoading) return <Skeleton className="h-[460px] w-full" />
  if (months.length === 0) return <EmptyMonth isAdmin={isAdmin} />

  return (
    <div className="space-y-4">
      <MonthsRail months={months} selectedKey={activeKey} onSelect={setPicked} />
      {selected && <MonthHero month={selected} />}
      {selected && <CategoryList tasks={selected.tasks} isAdmin={isAdmin} />}
    </div>
  )
}

/** Задачи месяца, сгруппированные по категориям (в порядке программы). */
function CategoryList({ tasks, isAdmin }: { tasks: Task[]; isAdmin: boolean }) {
  const { t, lang } = useT()
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

/** Строка задачи: название + чекбокс (админ) / индикатор (резидент — только просмотр). */
function TaskRow({ task, isAdmin, label }: { task: Task; isAdmin: boolean; label: string }) {
  const { t } = useT()
  const setStatus = useSetTaskStatus()
  const done = isTaskDone(task)

  const box = 'flex h-7 w-7 flex-none items-center justify-center rounded-[8px] border-2 transition-all duration-150 ease-ios'
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className={cn('min-w-0 flex-1 break-words text-[13.5px]', done ? 'text-ink-3 line-through' : 'text-ink')}>
        {label}
      </span>
      {isAdmin ? (
        <button
          type="button"
          onClick={() =>
            setStatus.mutate(
              { id: task.id, status: done ? 'not_started' : 'done' },
              { onSuccess: () => toast.success(t('common.saved')) },
            )
          }
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
