import { useTasks } from './useTasks'
import { taskCounts } from './taskCounts'
import { RingProgress } from '@/components/ui/RingProgress'
import { useT } from '@/i18n/useT'

function Stat({
  label,
  value,
  tone = 'ink',
}: {
  label: string
  value: number
  tone?: 'ink' | 'accent' | 'success' | 'warn'
}) {
  const color =
    tone === 'accent'
      ? 'text-accent'
      : tone === 'success'
        ? 'text-success'
        : tone === 'warn'
          ? 'text-warn'
          : 'text-ink'
  return (
    <div className="rounded-[14px] bg-surface-2 p-3 text-center">
      <div className={`text-[22px] font-bold tracking-tight ${color}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-2">{label}</div>
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
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <RingProgress value={pct} size={112} stroke={12} label={`${pct}%`} sublabel={t('tasksui.statCompleted')} />
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t('tasksui.statTotal')} value={c.total} />
          <Stat label={t('tasksui.statAccepted')} value={c.accepted} tone="success" />
          <Stat label={t('tasksui.statInProgress')} value={c.inProgress} tone="accent" />
          <Stat label={t('tasksui.statNeedsRevision')} value={c.needsRevision} tone="warn" />
        </div>
      </div>
    </section>
  )
}
