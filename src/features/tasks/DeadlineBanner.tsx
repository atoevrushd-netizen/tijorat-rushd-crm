import { type ReactNode } from 'react'
import { AlarmClock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { deadlineState, daysUntil } from '@/lib/deadline'
import type { Task } from '@/types'
import { useTasks } from './useTasks'

type Tone = 'danger' | 'warn' | 'accent'

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const cls =
    tone === 'danger'
      ? 'bg-danger-soft text-danger'
      : tone === 'warn'
        ? 'bg-warn-soft text-warn'
        : 'bg-accent-soft text-accent'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold',
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}

/**
 * Баннер напоминаний о дедлайнах: сколько задач просрочено / горит сегодня /
 * приближается. Использует тот же запрос задач, что и сводка (React Query дедупит).
 * Ничего не рисует, если гореть нечему.
 */
export function DeadlineBanner({ userId }: { userId: string }) {
  const { t } = useT()
  const { data } = useTasks(userId)
  if (!data) return null

  const overdue: Task[] = []
  const today: Task[] = []
  let soon = 0
  for (const task of data) {
    const state = deadlineState(task.deadline, task.status)
    if (!state || state === 'ok') continue
    if (state === 'overdue') overdue.push(task)
    else if (daysUntil(task.deadline) === 0) today.push(task)
    else soon++
  }

  if (overdue.length + today.length + soon === 0) return null

  // Что показать списком: сначала просроченные, потом сегодняшние (до 3 всего).
  const highlight = [...overdue, ...today].slice(0, 3)

  return (
    <section className="animate-rise rounded-[18px] border border-line bg-surface p-4 shadow-sh1 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-warn-soft text-warn">
          <AlarmClock size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold text-ink">{t('deadline.title')}</span>
            {overdue.length > 0 && (
              <Pill tone="danger">
                {t('deadline.overdue')}: {overdue.length}
              </Pill>
            )}
            {today.length > 0 && (
              <Pill tone="warn">
                {t('deadline.today')}: {today.length}
              </Pill>
            )}
            {soon > 0 && (
              <Pill tone="accent">
                {t('deadline.soon')}: {soon}
              </Pill>
            )}
          </div>

          {highlight.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {highlight.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2.5 rounded-[10px] bg-surface-2 px-3 py-2 text-[12.5px]"
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      overdue.includes(task) ? 'bg-danger' : 'bg-warn',
                    )}
                  />
                  <span className="truncate text-ink-2">{task.title}</span>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-3">
                    {task.deadline}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
