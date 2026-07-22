import { Link } from 'react-router-dom'
import { Clock3, ExternalLink, RotateCcw } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useT } from '@/i18n/useT'
import { AgendaCheckbox } from './AgendaCheckbox'
import { checkState, type LeadGroup } from './agendaUtils'
import type { AgendaTask } from './api'

/** Список дня: карточка на каждого лида, внутри — его задачи с чекбоксом. */
export function DayAgendaList({
  groups,
  pending,
  onApprove,
  onUndo,
  onReject,
}: {
  groups: LeadGroup[]
  pending: Set<string>
  onApprove: (task: AgendaTask) => void
  onUndo: (task: AgendaTask) => void
  onReject: (task: AgendaTask) => void
}) {
  const { t } = useT()
  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <div key={g.userId} className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1">
          <Link
            to={`/admin/users/${g.userId}`}
            className="flex items-center gap-3 border-b border-line px-4 py-3 transition-colors hover:bg-surface-2"
          >
            <Avatar name={g.name} src={g.photo} size={38} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-bold text-ink">{g.name || '—'}</div>
              <div className="text-[12px] text-ink-3">
                {t('agenda.tasksCount').replace('{n}', String(g.tasks.length))}
              </div>
            </div>
            <ExternalLink size={16} className="flex-none text-ink-3" />
          </Link>

          <div className="divide-y divide-line">
            {g.tasks.map((task) => (
              <Row
                key={task.id}
                task={task}
                busy={pending.has(task.id)}
                onApprove={() => onApprove(task)}
                onUndo={() => onUndo(task)}
                onReject={() => onReject(task)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Row({
  task,
  busy,
  onApprove,
  onUndo,
  onReject,
}: {
  task: AgendaTask
  busy: boolean
  onApprove: () => void
  onUndo: () => void
  onReject: () => void
}) {
  const { t } = useT()
  const submitted = checkState(task.status) === 'submitted'

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] text-ink">{task.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-3">
          {task.due_time && (
            <span className="flex items-center gap-1">
              <Clock3 size={11} /> {task.due_time.slice(0, 5)}
            </span>
          )}
          {task.status === 'needs_revision' && (
            <span className="font-semibold text-danger">{t('agenda.returned')}</span>
          )}
        </div>
      </div>

      {submitted && (
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          aria-label={t('agenda.reject')}
          title={t('agenda.reject')}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] text-ink-3 transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
        >
          <RotateCcw size={16} />
        </button>
      )}

      <AgendaCheckbox status={task.status} busy={busy} onApprove={onApprove} onUndo={onUndo} />
    </div>
  )
}
