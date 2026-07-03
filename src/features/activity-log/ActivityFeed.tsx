import { formatDateTime } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { useActivity } from './useActivity'
import { activityText } from './activityText'

/** Лента истории действий по пользователю. */
export function ActivityFeed({ userId }: { userId: string }) {
  const { t } = useT()
  const { data, isLoading } = useActivity(userId)

  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <h2 className="text-base font-bold text-ink">{t('activity.title')}</h2>

      {isLoading && <p className="mt-2 text-sm text-ink-3">{t('misc.loading')}</p>}
      {data && data.length === 0 && (
        <p className="mt-2 text-sm text-ink-3">{t('activity.empty')}</p>
      )}
      {data && data.length > 0 && (
        <ul className="mt-3 space-y-2">
          {data.map((event) => (
            <li
              key={event.id}
              className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0"
            >
              <div className="text-sm text-ink">
                {activityText(event, t)}
                <div className="text-xs text-ink-3">
                  {event.actor?.full_name || '—'}
                </div>
              </div>
              <span className="shrink-0 font-mono text-xs text-ink-3">
                {formatDateTime(event.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
