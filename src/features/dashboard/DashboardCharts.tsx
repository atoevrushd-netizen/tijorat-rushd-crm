import type { TaskStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { Card } from '@/components/ui/Card'
import { RingProgress } from '@/components/ui/RingProgress'

const ORDER: TaskStatus[] = [
  'not_started',
  'in_progress',
  'done',
  'sent_to_user',
  'accepted_by_user',
  'needs_revision',
]

/** Бар-чарт распределения задач по статусам (iOS-стиль: градиент + рост). */
export function ChartCard({ byStatus }: { byStatus: Record<TaskStatus, number> }) {
  const { t } = useT()
  const max = Math.max(1, ...ORDER.map((s) => byStatus[s]))
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-5">
        <div className="text-[16px] font-bold text-ink">{t('dash.tasksByStatus')}</div>
        <div className="text-[12.5px] text-ink-3">{t('dash.tasksByStatusSub')}</div>
      </div>
      <div className="flex h-[170px] items-end gap-2 sm:h-[200px] sm:gap-3">
        {ORDER.map((s) => {
          const h = Math.max(3, Math.round((byStatus[s] / max) * 100))
          const accent = s === 'accepted_by_user'
          return (
            <div
              key={s}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2.5"
            >
              <span className="text-[11px] font-semibold text-ink-2">
                {byStatus[s]}
              </span>
              <div
                className="w-full max-w-[46px] origin-bottom animate-bar-grow rounded-[8px] transition-all duration-500 ease-ios"
                style={{
                  height: `${h}%`,
                  background: accent
                    ? 'linear-gradient(180deg,var(--info),var(--accent))'
                    : 'linear-gradient(180deg,var(--surface-3),var(--surface-2))',
                  boxShadow: accent ? '0 0 22px rgba(10,132,255,.35)' : undefined,
                }}
              />
              <span className={cn('text-[11px]', accent ? 'text-ink' : 'text-ink-3')}>
                {t(`taskStatusShort.${s}`)}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Legend({
  color,
  label,
  value,
  muted,
}: {
  color: string
  label: string
  value: number
  muted?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2 text-[13px]', muted && 'text-ink-2')}>
      <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: color }} />
      {label}
      <b className={cn('ml-auto font-mono', muted ? 'text-ink' : '')}>{value}</b>
    </div>
  )
}

/** Donut выполнения задач (принято / всего). */
export function DonutCard({ accepted, total }: { accepted: number; total: number }) {
  const { t } = useT()
  const pct = total ? Math.round((accepted / total) * 100) : 0
  return (
    <Card className="flex flex-col p-4 sm:p-6">
      <div className="text-[16px] font-bold text-ink">{t('dash.completion')}</div>
      <div className="mb-3 text-[12.5px] text-ink-3">{t('dash.completionSub')}</div>
      <div className="my-2 flex items-center justify-center">
        <RingProgress value={pct} size={140} stroke={16} label={`${pct}%`} sublabel={t('dash.done')} />
      </div>
      <div className="mt-auto flex flex-col gap-2.5">
        <Legend color="var(--accent)" label={t('taskStatusShort.accepted_by_user')} value={accepted} />
        <Legend
          color="var(--surface-3)"
          label={t('dash.legendRest')}
          value={Math.max(0, total - accepted)}
          muted
        />
      </div>
    </Card>
  )
}
