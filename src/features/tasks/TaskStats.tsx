import { useTasks } from './useTasks'
import { taskCounts } from './taskCounts'
import { RingProgress } from '@/components/ui/RingProgress'

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-3 text-center">
      <div className="font-mono text-xl font-bold text-ink">{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-2">{label}</div>
    </div>
  )
}

/** Дашборд-сводка задач пользователя: donut выполнения + KPI по статусам. */
export function TaskStats({ userId }: { userId: string }) {
  const { data } = useTasks(userId)
  const c = taskCounts(data ?? [])
  const pct = c.total ? Math.round((c.accepted / c.total) * 100) : 0

  return (
    <section className="animate-rise rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <RingProgress value={pct} size={104} stroke={11} label={`${pct}%`} sublabel="выполнено" />
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Всего задач" value={c.total} />
          <Stat label="Принято" value={c.accepted} />
          <Stat label="В процессе" value={c.inProgress} />
          <Stat label="На правку" value={c.needsRevision} />
        </div>
      </div>
    </section>
  )
}
