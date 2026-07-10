import { CalendarClock, ExternalLink, X } from 'lucide-react'
import type { Task } from '@/types'
import { cn, formatDate } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { deadlineState } from '@/lib/deadline'
import { taskTitle } from '@/lib/taskI18n'
import { useT } from '@/i18n/useT'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskAdminControls } from './TaskAdminControls'
import { TaskReviewControls } from './TaskReviewControls'
import { TaskOwnerControls } from './TaskOwnerControls'
import { TaskOwnerCheckbox } from './TaskOwnerCheckbox'
import { useDeleteTaskLink } from './useTasks'

function typeLabel(type: string | null, t: (key: string, fallback?: string) => string): string {
  if (type === 'reels') return t('taskType.reels')
  if (type === 'creative') return t('taskType.creative')
  return type ?? '—'
}

export function TaskItem({
  task,
  isAdmin,
  isOwner,
}: {
  task: Task
  isAdmin: boolean
  isOwner: boolean
}) {
  const { t, lang } = useT()
  const delLink = useDeleteTaskLink()
  // Резидент (владелец, не админ) видит галочку/старые кнопки; админ — проверку.
  const asResident = isOwner && !isAdmin
  const canRespond = asResident && task.status === 'sent_to_user'
  const dl = deadlineState(task.deadline, task.status)

  return (
    <div className="rounded-[14px] border border-line bg-surface-2 p-4 transition-colors sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-[15px] font-semibold leading-snug text-ink">
            {taskTitle(task, lang)}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full bg-surface-3 px-2 py-0.5 font-medium text-ink-2">
              {typeLabel(task.task_type, t)}
            </span>
            {task.deadline && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                  dl === 'overdue'
                    ? 'bg-danger-soft text-danger'
                    : dl === 'soon'
                      ? 'bg-warn-soft text-warn'
                      : 'bg-surface-3 text-ink-2',
                )}
              >
                <CalendarClock size={12} />
                {`${t('tasksui.deadline')} ${formatDate(task.deadline)}`}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <TaskStatusBadge status={task.status} />
        </div>
      </div>

      {task.task_links && task.task_links.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {task.task_links.map((l) => (
            <li
              key={l.id}
              className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[12.5px]"
            >
              <ExternalLink size={12} className="shrink-0 text-accent" />
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 truncate text-accent hover:underline"
              >
                {l.label || l.url}
              </a>
              {isAdmin && (
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      await confirm({
                        message: t('tasksui.confirmDeleteLink'),
                        danger: true,
                        confirmLabel: t('misc.delete'),
                      })
                    )
                      delLink.mutate(l.id, {
                        onSuccess: () => toast.success(t('common.deleted')),
                      })
                  }}
                  className="shrink-0 text-ink-3 transition-colors hover:text-danger"
                  aria-label={t('tasksui.deleteLink')}
                >
                  <X size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {(task.admin_comment || task.user_comment) && (
        <div className="mt-3 space-y-2">
          {task.admin_comment && (
            <div className="rounded-[10px] bg-surface px-3 py-2.5 text-sm text-ink-2">
              <span className="mb-0.5 block text-[12px] font-semibold text-ink">
                {t('tasksui.adminComment')}
              </span>
              {task.admin_comment}
            </div>
          )}
          {task.user_comment && (
            <div className="rounded-[10px] bg-surface px-3 py-2.5 text-sm text-ink-2">
              <span className="mb-0.5 block text-[12px] font-semibold text-ink">
                {t('tasksui.userComment')}
              </span>
              {task.user_comment}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-ink-3">
        <span>{t('tasksui.created')} {formatDate(task.created_at)}</span>
        {task.sent_at && <span>{t('tasksui.sent')} {formatDate(task.sent_at)}</span>}
        {task.accepted_at && <span>{t('tasksui.accepted')} {formatDate(task.accepted_at)}</span>}
      </div>

      {isAdmin && task.status === 'submitted' && <TaskReviewControls task={task} />}
      {isAdmin && <TaskAdminControls task={task} />}
      {canRespond && <TaskOwnerControls task={task} />}
      {asResident && task.status !== 'sent_to_user' && <TaskOwnerCheckbox task={task} />}
    </div>
  )
}
