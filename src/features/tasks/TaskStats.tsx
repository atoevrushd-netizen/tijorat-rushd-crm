import { type ReactNode } from 'react'
import { Activity, CheckCircle2, ListChecks, RotateCcw } from 'lucide-react'
import { useTasks } from './useTasks'
import { taskCounts } from './taskCounts'
import { RingProgress } from '@/components/ui/RingProgress'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'

type Tone = 'accent' | 'success' | 'warn' | 'info'

const CHIP: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warn: 'bg-warn-soft text-warn',
  info: 'bg-info-soft text-info',
}

/** KPI-плитка статуса: цветной значок-чип, крупное число, подпись. */
function StatTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: ReactNode
  tone: Tone
}) {
  return (
    <div className="rounded-[14px] bg-surface-2 p-4 transition-colors hover:bg-surface-3">
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-[11px]',
          CHIP[tone],
        )}
      >
        {icon}
      </span>
      <div className="mt-3 text-[26px] font-bold leading-none tracking-tight text-ink sm:text-[28px]">
        {value}
      </div>
      <div className="mt-1.5 truncate text-[12px] font-medium text-ink-2">{label}</div>
    </div>
  )
}

/**
 * Сводка задач лида: крупное кольцо выполнения + распределение статусов
 * полосой + плитки KPI во всю ширину (инфографика без «пустоты по бокам»).
 */
export function TaskStats({ userId }: { userId: string }) {
  const { t } = useT()
  const { data } = useTasks(userId)
  const c = taskCounts(data ?? [])
  const pct = c.total ? Math.round((c.accepted / c.total) * 100) : 0

  // Сегменты распределения (в сумме = total): принято / в процессе / правка / не начато.
  const segments = [
    { value: c.accepted, color: 'var(--success)', label: t('tasksui.statAccepted') },
    { value: c.inProgress, color: 'var(--info)', label: t('tasksui.statInProgress') },
    { value: c.needsRevision, color: 'var(--warn)', label: t('tasksui.statNeedsRevision') },
    {
      value: c.notStarted,
      color: 'var(--surface-3)',
      label: t('taskStatus.not_started', 'Не начато'),
    },
  ].filter((s) => s.value > 0)

  return (
    <section className="animate-rise rounded-[18px] border border-line bg-surface p-5 shadow-sh1 sm:p-6">
      {/* Кольцо + распределение — заполняют ширину */}
      <div className="flex items-center gap-5 sm:gap-8">
        <div className="shrink-0">
          <RingProgress
            value={pct}
            size={124}
            stroke={13}
            label={`${pct}%`}
            sublabel={t('tasksui.statCompleted')}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-medium text-ink-2">{t('tasksui.statTotal')}</div>
          <div className="text-[34px] font-extrabold leading-none tracking-tight text-ink">
            {c.total}
          </div>

          {/* Распределение статусов полосой */}
          <div className="mt-4 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-surface-2">
            {segments.map((s, i) => (
              <div
                key={i}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(s.value / c.total) * 100}%`,
                  background: s.color,
                }}
              />
            ))}
          </div>
          {/* Легенда распределения */}
          <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[11.5px] text-ink-2">
            {segments.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label} <b className="font-mono text-ink">{s.value}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Плитки KPI во всю ширину */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <StatTile
          label={t('tasksui.statTotal')}
          value={c.total}
          tone="accent"
          icon={<ListChecks className="h-[18px] w-[18px]" />}
        />
        <StatTile
          label={t('tasksui.statAccepted')}
          value={c.accepted}
          tone="success"
          icon={<CheckCircle2 className="h-[18px] w-[18px]" />}
        />
        <StatTile
          label={t('tasksui.statInProgress')}
          value={c.inProgress}
          tone="info"
          icon={<Activity className="h-[18px] w-[18px]" />}
        />
        <StatTile
          label={t('tasksui.statNeedsRevision')}
          value={c.needsRevision}
          tone="warn"
          icon={<RotateCcw className="h-[18px] w-[18px]" />}
        />
      </div>
    </section>
  )
}
