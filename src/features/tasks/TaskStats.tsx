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
    <div className="rounded-[12px] bg-surface-2 p-3.5">
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-[11px]',
          CHIP[tone],
        )}
      >
        {icon}
      </span>
      <div className="mt-2.5 text-[24px] font-bold leading-none tracking-tight text-ink sm:text-[26px]">
        {value}
      </div>
      <div className="mt-1 truncate text-[11.5px] font-medium text-ink-2">{label}</div>
    </div>
  )
}

/** Дашборд-сводка задач пользователя: кольцо выполнения + KPI по статусам. */
export function TaskStats({ userId }: { userId: string }) {
  const { t } = useT()
  const { data } = useTasks(userId)
  const c = taskCounts(data ?? [])
  const pct = c.total ? Math.round((c.accepted / c.total) * 100) : 0

  return (
    <section className="animate-rise rounded-[18px] border border-line bg-surface p-5 shadow-sh1 sm:p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <RingProgress
          value={pct}
          size={116}
          stroke={12}
          label={`${pct}%`}
          sublabel={t('tasksui.statCompleted')}
        />
        <div className="grid w-full flex-1 grid-cols-2 gap-2.5 sm:gap-3">
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
      </div>
    </section>
  )
}
