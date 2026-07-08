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

/** Бар-чарт распределения задач по статусам (iOS-стиль: градиент + рост в дорожке). */
export function ChartCard({ byStatus }: { byStatus: Record<TaskStatus, number> }) {
  const { t } = useT()
  const max = Math.max(1, ...ORDER.map((s) => byStatus[s]))
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-5">
        <div className="text-[16px] font-bold text-ink">{t('dash.tasksByStatus')}</div>
        <div className="text-[12.5px] text-ink-3">{t('dash.tasksByStatusSub')}</div>
      </div>
      <div className="flex h-[180px] items-stretch gap-1.5 sm:h-[210px] sm:gap-3">
        {ORDER.map((s) => {
          const h = Math.max(3, Math.round((byStatus[s] / max) * 100))
          const accent = s === 'accepted_by_user'
          return (
            <div key={s} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span
                className={cn(
                  'font-mono text-[11px] font-semibold tabular-nums',
                  accent ? 'text-accent' : 'text-ink-2',
                )}
              >
                {byStatus[s]}
              </span>
              {/* Дорожка-«плот»: бар растёт снизу и заполняет доступную высоту */}
              <div className="relative w-full max-w-[46px] flex-1 overflow-hidden rounded-[9px] bg-surface-2">
                <div
                  className="absolute inset-x-0 bottom-0 origin-bottom animate-bar-grow rounded-[9px] transition-all duration-500 ease-ios"
                  style={{
                    height: `${h}%`,
                    background: accent ? 'var(--accent-grad)' : 'var(--surface-3)',
                    boxShadow: accent ? 'var(--glow)' : undefined,
                  }}
                />
              </div>
              <span
                className={cn(
                  'w-full truncate text-center text-[10px] sm:text-[11px]',
                  accent ? 'font-semibold text-ink' : 'text-ink-3',
                )}
              >
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
    <div className="flex items-center gap-2.5 rounded-[10px] bg-surface-2 px-3 py-2 text-[13px]">
      <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: color }} />
      <span className={cn('min-w-0 truncate', muted ? 'text-ink-2' : 'font-medium text-ink')}>
        {label}
      </span>
      <b className="ml-auto font-mono tabular-nums text-ink">{value}</b>
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
      <div className="my-3 flex items-center justify-center">
        <RingProgress value={pct} size={140} stroke={16} label={`${pct}%`} sublabel={t('dash.done')} />
      </div>
      <div className="mt-auto flex flex-col gap-2">
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
