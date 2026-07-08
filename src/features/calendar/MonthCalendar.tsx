import { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { useT } from '@/i18n/useT'
import { monthYear, weekdaysShort } from '@/lib/dateI18n'
import { deadlineState } from '@/lib/deadline'
import { buildMonthMatrix, formatDateShort, isWithinRange } from './calendarUtils'

type Props = {
  year: number
  month: number // 0..11
  selected: string
  today: string
  tasksByDate: Record<string, Task[]>
  subStart: string | null
  subEnd: string | null
  onSelect: (date: string) => void
  onPrev: () => void
  onNext: () => void
}

/** Сетка месяца: подсветка дней с задачами, периода подписки, сегодня и выбранного дня. */
export function MonthCalendar({
  year,
  month,
  selected,
  today,
  tasksByDate,
  subStart,
  subEnd,
  onSelect,
  onPrev,
  onNext,
}: Props) {
  const { t, lang } = useT()
  const weeks = buildMonthMatrix(year, month)
  const monthName = monthYear(new Date(year, month, 1), lang)

  return (
    <div className="min-w-0 rounded-[18px] border border-line bg-surface p-4 shadow-sh1">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[15px] font-bold capitalize text-ink">{monthName}</div>
        <div className="flex items-center gap-1.5">
          <NavBtn onClick={onPrev} label={t('cal.prevMonth')}>
            <ChevronLeft size={16} />
          </NavBtn>
          <NavBtn onClick={onNext} label={t('cal.nextMonth')}>
            <ChevronRight size={16} />
          </NavBtn>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {weekdaysShort(lang).map((w) => (
          <div
            key={w}
            className="py-1 text-center font-mono text-[10.5px] uppercase tracking-wider text-ink-3"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weeks.flat().map((c) => {
          const dayTasks = tasksByDate[c.date] ?? []
          const count = dayTasks.length
          // День «горит», если среди задач есть просроченные или сгорающие.
          const isHot = dayTasks.some((task) => {
            const dl = deadlineState(task.deadline, task.status)
            return dl === 'overdue' || dl === 'soon'
          })
          const inSub = isWithinRange(c.date, subStart, subEnd)
          const isSelected = c.date === selected
          const isToday = c.date === today
          return (
            <button
              key={c.date}
              type="button"
              onClick={() => onSelect(c.date)}
              className={cn(
                'relative flex h-10 items-center justify-center rounded-[10px] text-[13px] transition-colors',
                // Цвет текста и фон — взаимоисключающие ветки (cn не решает конфликты классов).
                isSelected
                  ? 'bg-accent-grad font-bold text-on-accent shadow-glow'
                  : c.inMonth
                    ? inSub
                      ? 'bg-accent-soft text-ink hover:bg-[rgba(46,124,246,.16)]'
                      : 'bg-surface-2 text-ink hover:bg-surface-3'
                    : 'bg-transparent text-ink-3 hover:bg-surface-2',
                isToday && !isSelected && 'border-[1.5px] border-accent',
              )}
            >
              <span>{c.day}</span>
              {count > 0 && (
                <span className="absolute bottom-[5px] flex gap-[3px]">
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-[4px] w-[4px] rounded-full',
                        isSelected ? 'bg-on-accent' : isHot ? 'bg-warn' : 'bg-accent',
                      )}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {subStart && subEnd && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-3">
          <span className="h-3 w-3 shrink-0 rounded-[4px] bg-accent-soft" />
          <span className="min-w-0">
            {t('cal.subscription')}: {formatDateShort(subStart)} — {formatDateShort(subEnd)}
          </span>
        </div>
      )}
    </div>
  )
}

function NavBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
    >
      {children}
    </button>
  )
}
