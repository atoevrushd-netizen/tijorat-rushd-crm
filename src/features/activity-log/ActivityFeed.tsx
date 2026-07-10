import { type ReactNode } from 'react'
import { Activity, FilePlus2, RefreshCw } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import type { ActivityEvent } from '@/types'
import { useActivity } from './useActivity'
import { activityText } from './activityText'

/** Иконка + цвет чипа события по его типу/действию. */
function eventVisual(event: ActivityEvent): { icon: ReactNode; chip: string } {
  if (event.entity_type === 'task' && event.action === 'created') {
    return { icon: <FilePlus2 size={15} />, chip: 'bg-success-soft text-success' }
  }
  if (event.entity_type === 'task' && event.action === 'status_changed') {
    return { icon: <RefreshCw size={15} />, chip: 'bg-info-soft text-info' }
  }
  return { icon: <Activity size={15} />, chip: 'bg-accent-soft text-accent' }
}

/** Лента истории действий по пользователю.
 *  bare — без внешней карточки/заголовка (для вложения в «шторку»). */
export function ActivityFeed({ userId, bare = false }: { userId: string; bare?: boolean }) {
  const { t, lang } = useT()
  const { data, isLoading } = useActivity(userId)

  const body = (
    <>
      {isLoading && <p className="mt-4 text-sm text-ink-3">{t('misc.loading')}</p>}
      {data && data.length === 0 && (
        <p className="mt-4 rounded-[12px] bg-surface-2 py-8 text-center text-sm text-ink-3">
          {t('activity.empty')}
        </p>
      )}
      {data && data.length > 0 && (
        <ul className="mt-3 space-y-0.5">
          {data.map((event) => {
            const v = eventVisual(event)
            return (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-[12px] px-2 py-2.5 transition-colors hover:bg-surface-2"
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]',
                    v.chip,
                  )}
                >
                  {v.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink">{activityText(event, t, lang)}</div>
                  <div className="mt-0.5 text-xs text-ink-3">
                    {event.actor?.full_name || '—'}
                  </div>
                </div>
                <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-ink-3">
                  {formatDateTime(event.created_at)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )

  if (bare) return body

  return (
    <section className="rounded-[18px] border border-line bg-surface p-5 shadow-sh1 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-soft text-accent">
          <Activity size={16} />
        </span>
        <h2 className="text-[15px] font-bold text-ink">{t('activity.title')}</h2>
      </div>
      {body}
    </section>
  )
}
