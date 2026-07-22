import { type ReactNode } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { dayParts } from '@/lib/dateI18n'

/**
 * Шапка «Повестки дня» (океановый градиент): круглые кнопки ‹ › листают дни,
 * клик по центру (дата) открывает быстрый выбор даты.
 */
export function AgendaHeader({
  day,
  onPrev,
  onNext,
  onOpenPicker,
}: {
  day: string
  onPrev: () => void
  onNext: () => void
  onOpenPicker: () => void
}) {
  const { t, lang } = useT()
  // Дата крупно, день недели — подписью (порядок слов в локали не важен).
  const { date, weekday } = dayParts(day, lang)

  return (
    <div className="flex items-center gap-2 rounded-[20px] bg-accent-grad p-2.5 text-on-accent shadow-glow sm:gap-3 sm:p-3">
      <Circle onClick={onPrev} label={t('agenda.prevDay')}>
        <ChevronLeft size={22} />
      </Circle>

      <button
        type="button"
        onClick={onOpenPicker}
        aria-label={t('agenda.jumpTitle')}
        className="flex min-w-0 flex-1 flex-col items-center rounded-[14px] px-2 py-1 transition-all duration-150 ease-ios hover:bg-white/10 active:scale-[.99]"
      >
        <span className="flex items-center gap-1.5 text-[19px] font-extrabold capitalize leading-tight sm:text-[22px]">
          <span className="truncate">{date}</span>
          <CalendarDays size={16} className="flex-none opacity-80" />
        </span>
        {weekday && <span className="text-[12px] font-medium capitalize text-white/80">{weekday}</span>}
      </button>

      <Circle onClick={onNext} label={t('agenda.nextDay')}>
        <ChevronRight size={22} />
      </Circle>
    </div>
  )
}

function Circle({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/15 text-on-accent transition-all duration-150 ease-ios hover:bg-white/25 active:scale-90"
    >
      {children}
    </button>
  )
}
