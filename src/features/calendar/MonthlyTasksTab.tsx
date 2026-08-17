import { useEffect, useMemo, useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { taskTitle } from '@/lib/taskI18n'
import { useT } from '@/i18n/useT'
import { useAuth } from '@/features/auth/useAuth'
import { canManage } from '@/features/auth/roles'
import { useDeleteTask, useSetTaskStatus, useTasks } from '@/features/tasks/useTasks'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Task } from '@/types'
import { MonthsRail } from './MonthsRail'
import { MonthHero } from './MonthHero'
import {
  TASK_CATEGORIES,
  buildMonthSummaries,
  categoryIndex,
  compareTasks,
  isTaskDone,
} from './monthly'

/**
 * Вкладка «Календарь» → путь по месяцам (0048). Без сетки дней: сверху рельс месяцев
 * (кольца прогресса), крупная карточка выбранного месяца с дневной «загрузкой», ниже —
 * задачи месяца по категориям. Чекбоксы ставит ТОЛЬКО админ; резидент видит статус.
 */
export function MonthlyTasksTab({ userId, tabId }: { userId: string; tabId: string }) {
  const { role } = useAuth()
  const isAdmin = canManage(role)
  const { data: tasks, isLoading } = useTasks(userId, tabId)

  // Следим за сменой календарного дня — иначе прогресс месяца/«осталось дней» замерзают,
  // если вкладку не закрывать через полночь/смену месяца.
  const [todayKey, setTodayKey] = useState(() => new Date().toDateString())
  useEffect(() => {
    const id = setInterval(() => {
      const k = new Date().toDateString()
      setTodayKey((prev) => (prev === k ? prev : k))
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const months = useMemo(
    () => buildMonthSummaries(tasks ?? [], new Date()),
    // todayKey намеренно в зависимостях: заставляет пересчитать new Date() при смене дня.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, todayKey],
  )
  const defaultKey = useMemo(() => {
    if (months.length === 0) return null
    const current = months.find((m) => m.state === 'current')
    if (current) return current.key
    // Нет текущего месяца (подписка в будущем или пропуск) — открываем ближайший к сегодня.
    const lastPast = [...months].reverse().find((m) => m.state === 'past')
    const firstFuture = months.find((m) => m.state === 'future')
    return (lastPast ?? firstFuture ?? months[months.length - 1]).key
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
    // Внутри категории — строго №1, №2, №3… (см. compareTasks: без этого пачка
    // задач с одинаковым created_at приходила из БД в случайном порядке).
    for (const arr of map.values()) arr.sort(compareTasks)
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
          <section key={idx} className="overflow-hidden rounded-[16px] border border-line bg-surface-2 shadow-sh1">
            <header className="flex items-center gap-2.5 border-b border-line bg-surface-3 px-4 py-2.5">
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
  const del = useDeleteTask()
  const done = isTaskDone(task)
  // Ручная задача (назначена админом через инструмент) — её можно удалить; авто-набор нет.
  const manual = !!task.created_by

  const box = 'flex h-7 w-7 flex-none items-center justify-center rounded-[8px] border-2 transition-all duration-150 ease-ios'
  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className={cn('min-w-0 flex-1 break-words text-[13.5px]', done ? 'text-ink-3 line-through' : 'text-ink')}>
        {label}
        {manual && (
          <span className="ml-2 rounded-full bg-accent-soft px-1.5 py-px align-middle text-[10px] font-semibold text-accent">
            {t('cal.manualBadge')}
          </span>
        )}
      </span>
      {isAdmin && manual && (
        <button
          type="button"
          disabled={del.isPending}
          aria-label={t('cal.deleteTask')}
          title={t('cal.deleteTask')}
          onClick={async () => {
            if (await confirm({ message: t('cal.deleteTaskConfirm'), danger: true, confirmLabel: t('cal.deleteTask') }))
              del.mutate(task.id, { onSuccess: () => toast.success(t('common.deleted')) })
          }}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-[8px] text-ink-3 transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 size={14} />
        </button>
      )}
      {isAdmin ? (
        <button
          type="button"
          // Без тоста: сама галочка — достаточная обратная связь (иначе экран заливало «Сохранено»).
          onClick={() => setStatus.mutate({ id: task.id, status: done ? 'not_started' : 'done' })}
          disabled={setStatus.isPending}
          aria-label={done ? t('cal.unmarkDone') : t('cal.markDone')}
          title={done ? t('cal.unmarkDone') : t('cal.markDone')}
          className={cn(box, done ? 'border-success bg-success text-white active:scale-90' : 'border-line-strong text-transparent hover:border-accent hover:text-accent active:scale-90')}
        >
          <Check size={15} strokeWidth={3} />
        </button>
      ) : (
        // Резидент — только просмотр: КРУГ (не квадрат-чекбокс), чтобы не читался как кликабельный.
        <span
          aria-label={done ? t('cal.doneLabel') : t('cal.notDoneLabel')}
          title={done ? t('cal.doneLabel') : t('cal.notDoneLabel')}
          className={cn(
            'flex h-7 w-7 flex-none items-center justify-center rounded-full',
            done ? 'bg-success-soft text-success' : 'text-ink-3',
          )}
        >
          {done ? <Check size={15} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-ink-3/50" />}
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
