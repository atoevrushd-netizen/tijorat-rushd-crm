import { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'
import { buildMonthMatrix, formatDateShort, isWithinRange } from './calendarUtils'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

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
  const weeks = buildMonthMatrix(year, month)
  const monthName = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1))

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[15px] font-bold capitalize text-ink">{monthName}</div>
        <div className="flex items-center gap-1">
          <NavBtn onClick={onPrev} label="Предыдущий месяц">
            <ChevronLeft size={16} />
          </NavBtn>
          <NavBtn onClick={onNext} label="Следующий месяц">
            <ChevronRight size={16} />
          </NavBtn>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="py-1 text-center font-mono text-[10.5px] uppercase tracking-wider text-ink-3"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((c) => {
          const count = tasksByDate[c.date]?.length ?? 0
          const inSub = isWithinRange(c.date, subStart, subEnd)
          const isSelected = c.date === selected
          const isToday = c.date === today
          return (
            <button
              key={c.date}
              type="button"
              onClick={() => onSelect(c.date)}
              className={cn(
                'relative flex h-10 items-center justify-center rounded-lg text-[13px] transition-colors sm:h-9',
                c.inMonth ? 'text-ink' : 'text-ink-3 opacity-40',
                isSelected
                  ? 'bg-accent font-bold text-on-accent shadow-[0_2px_10px_rgba(59,130,246,.4)]'
                  : inSub
                    ? 'bg-accent-soft hover:bg-surface-2'
                    : 'hover:bg-surface-2',
                isToday && !isSelected && 'ring-1 ring-inset ring-accent',
              )}
            >
              <span>{c.day}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                    isSelected ? 'bg-on-accent' : 'bg-accent',
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {subStart && subEnd && (
        <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink-3">
          <span className="h-3 w-3 rounded bg-accent-soft" />
          Период подписки: {formatDateShort(subStart)} — {formatDateShort(subEnd)}
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
      className="flex h-8 w-8 items-center justify-center rounded-md border border-line-strong text-ink-2 transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  )
}
