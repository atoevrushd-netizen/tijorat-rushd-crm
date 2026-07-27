import { Fragment, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { ProgressRing } from './ProgressRing'
import type { MonthSummary } from './monthly'

/** «Путь по месяцам»: узлы-кольца по месяцам программы, соединённые линией. */
export function MonthsRail({
  months,
  selectedKey,
  onSelect,
}: {
  months: MonthSummary[]
  selectedKey: string
  onSelect: (key: string) => void
}) {
  const { t } = useT()
  const activeRef = useRef<HTMLButtonElement | null>(null)
  // Прокручиваем выбранный месяц в зону видимости рельса (в т.ч. при авто-выборе).
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [selectedKey])

  // py-2 + px-1 — чтобы кольцо и подсветка выбранного не обрезались краями прокрутки.
  return (
    <div className="overflow-x-auto px-1 py-2">
      <div className="flex min-w-min items-start gap-0">
        {months.map((mo, i) => {
          const complete = mo.total > 0 && mo.done === mo.total
          const selected = mo.key === selectedKey
          return (
            <Fragment key={mo.key}>
              {i > 0 && <span className="mt-[27px] h-[3px] w-5 flex-none rounded-full bg-line sm:w-8" />}
              <button
                type="button"
                ref={selected ? activeRef : undefined}
                onClick={() => onSelect(mo.key)}
                className="flex flex-none flex-col items-center gap-1.5 px-0.5"
              >
                <span className={cn('rounded-full p-0.5 transition-all', selected ? 'ring-2 ring-accent' : 'ring-0')}>
                  <ProgressRing size={54} stroke={5} value={mo.total ? mo.done / mo.total : 0} tone={complete ? 'success' : 'accent'}>
                    <span className={cn('text-[15px] font-extrabold', selected ? 'text-accent' : 'text-ink')}>{mo.index}</span>
                  </ProgressRing>
                </span>
                <span className={cn('text-[11px] font-semibold', selected ? 'text-accent' : mo.state === 'current' ? 'text-ink' : 'text-ink-3')}>
                  {t('cal.monthShort')} {mo.index}
                </span>
              </button>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
