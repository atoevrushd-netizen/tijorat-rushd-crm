import { Check } from 'lucide-react'
import { monthYear } from '@/lib/dateI18n'
import { useT } from '@/i18n/useT'
import { ProgressRing } from './ProgressRing'
import type { MonthSummary } from './monthly'

/** Крупная карточка выбранного месяца: кольцо задач + дневная «загрузка» месяца. */
export function MonthHero({ month }: { month: MonthSummary }) {
  const { t, lang } = useT()
  const [y, m] = month.key.split('-').map(Number)
  const name = monthYear(new Date(y, m - 1, 1), lang)
  const complete = month.total > 0 && month.done === month.total

  return (
    <div className="rounded-[22px] border border-line bg-surface-2 p-5 shadow-sh1 sm:p-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
        <ProgressRing size={140} stroke={12} value={month.total ? month.done / month.total : 0} tone={complete ? 'success' : 'accent'}>
          <span className="text-[30px] font-extrabold text-ink">
            {month.done}
            <span className="text-[17px] text-ink-3">/{month.total}</span>
          </span>
          <span className="mt-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">{t('cal.tasksWord')}</span>
        </ProgressRing>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="text-[12px] font-bold uppercase tracking-wide text-accent">
            {t('cal.monthShort')} {month.index}
          </div>
          <h3 className="mt-0.5 text-[22px] font-extrabold first-letter:uppercase text-ink">{name}</h3>

          {month.state === 'future' ? (
            <p className="mt-2 text-[13px] text-ink-3">{t('cal.monthFuture')}</p>
          ) : (
            <div className="mx-auto mt-3 max-w-[340px] sm:mx-0">
              <div className="mb-1 flex items-center justify-between text-[12px] font-medium text-ink-2">
                <span>
                  {month.state === 'current'
                    ? month.daysLeft === 0
                      ? t('cal.lastDay')
                      : t('cal.daysLeft').replace('{n}', String(month.daysLeft))
                    : t('cal.monthPast')}
                </span>
                <span className="text-ink-3">{Math.round(month.timeProgress * 100)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-accent-grad transition-all duration-500" style={{ width: `${Math.round(month.timeProgress * 100)}%` }} />
              </div>
            </div>
          )}

          {complete && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[12.5px] font-semibold text-success">
              <Check size={14} strokeWidth={3} /> {t('cal.monthDone')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
