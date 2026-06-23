import type { TaskStatus } from '@/types'
import { cn } from '@/lib/utils'
import { RingProgress } from '@/components/ui/RingProgress'

const ORDER: TaskStatus[] = [
  'not_started',
  'in_progress',
  'done',
  'sent_to_user',
  'accepted_by_user',
  'needs_revision',
]
const SHORT: Record<TaskStatus, string> = {
  not_started: 'Не нач.',
  in_progress: 'В раб.',
  done: 'Готово',
  sent_to_user: 'Отпр.',
  accepted_by_user: 'Принято',
  needs_revision: 'Правка',
}

/** Бар-чарт распределения задач по статусам (по стилю макета). */
export function ChartCard({ byStatus }: { byStatus: Record<TaskStatus, number> }) {
  const max = Math.max(1, ...ORDER.map((s) => byStatus[s]))
  return (
    <div className="rounded-lg border border-line bg-surface p-4 sm:p-6">
      <div className="mb-5">
        <div className="text-[15px] font-bold text-ink">Задачи по статусам</div>
        <div className="text-[12.5px] text-ink-3">распределение всех задач</div>
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
              <span className="font-mono text-[11px] text-ink-2">{byStatus[s]}</span>
              <div
                className="w-full max-w-[44px] rounded-t-[7px]"
                style={{
                  height: `${h}%`,
                  background: accent
                    ? 'linear-gradient(180deg,var(--accent),var(--accent-700))'
                    : 'var(--surface-3)',
                  boxShadow: accent ? '0 0 22px rgba(59,130,246,.3)' : undefined,
                }}
              />
              <span className={cn('text-[11px]', accent ? 'text-ink' : 'text-ink-3')}>
                {SHORT[s]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
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
  const pct = total ? Math.round((accepted / total) * 100) : 0
  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface p-4 sm:p-6">
      <div className="text-[15px] font-bold text-ink">Выполнение задач</div>
      <div className="mb-3 text-[12.5px] text-ink-3">принято от всех задач</div>
      <div className="my-2 flex items-center justify-center">
        <RingProgress value={pct} size={140} stroke={16} label={`${pct}%`} sublabel="выполнено" />
      </div>
      <div className="mt-auto flex flex-col gap-2.5">
        <Legend color="var(--accent)" label="Принято" value={accepted} />
        <Legend
          color="var(--surface-3)"
          label="Остальные"
          value={Math.max(0, total - accepted)}
          muted
        />
      </div>
    </div>
  )
}
