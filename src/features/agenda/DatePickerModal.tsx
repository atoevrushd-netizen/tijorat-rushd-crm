import { useEffect, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useT } from '@/i18n/useT'
import { ymd } from '@/features/calendar/calendarUtils'
import { MonthCalendar } from '@/features/calendar/MonthCalendar'

function parse(day: string): { y: number; m: number } {
  const [y, m] = day.split('-').map(Number)
  return { y, m: m - 1 }
}

/** Быстрый переход к дате: сетка месяца (день/месяц) + шаг по годам + «Сегодня». */
export function DatePickerModal({
  open,
  value,
  onClose,
  onSelect,
}: {
  open: boolean
  value: string
  onClose: () => void
  onSelect: (day: string) => void
}) {
  const { t } = useT()
  const today = ymd(new Date())
  const [view, setView] = useState(() => parse(value))

  // При открытии показываем месяц выбранной даты.
  useEffect(() => {
    if (open) setView(parse(value))
  }, [open, value])

  function prevMonth() {
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))
  }
  function nextMonth() {
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))
  }
  function pick(day: string) {
    onSelect(day)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('agenda.jumpTitle')}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => pick(today)}
          className="rounded-[11px] bg-accent-soft px-3 py-2 text-[13px] font-semibold text-accent transition-colors hover:bg-accent-soft-2"
        >
          {t('agenda.today')}
        </button>
        <div className="flex items-center gap-1 rounded-[12px] bg-surface-2 p-1">
          <YearBtn onClick={() => setView((v) => ({ ...v, y: v.y - 1 }))} label={t('agenda.prevYear')}>
            <ChevronLeft size={16} />
          </YearBtn>
          <span className="min-w-[52px] text-center text-[14px] font-bold text-ink">{view.y}</span>
          <YearBtn onClick={() => setView((v) => ({ ...v, y: v.y + 1 }))} label={t('agenda.nextYear')}>
            <ChevronRight size={16} />
          </YearBtn>
        </div>
      </div>

      <MonthCalendar
        year={view.y}
        month={view.m}
        selected={value}
        today={today}
        tasksByDate={{}}
        subStart={null}
        subEnd={null}
        onSelect={pick}
        onPrev={prevMonth}
        onNext={nextMonth}
      />
    </Modal>
  )
}

function YearBtn({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-ink-2 transition-colors hover:bg-surface hover:text-ink hover:shadow-card"
    >
      {children}
    </button>
  )
}
