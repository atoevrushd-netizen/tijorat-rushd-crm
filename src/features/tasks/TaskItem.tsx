import { X } from 'lucide-react'
import type { Task } from '@/types'
import { cn, formatDate } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { deadlineState } from '@/lib/deadline'
import { taskTitle } from '@/lib/taskI18n'
import { useT } from '@/i18n/useT'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskAdminControls } from './TaskAdminControls'
import { TaskOwnerControls } from './TaskOwnerControls'
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
  const canRespond = isOwner && task.status === 'sent_to_user'
  const dl = deadlineState(task.deadline, task.status)

  return (
    <div className="rounded-[12px] border border-line bg-surface-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words font-medium text-ink">{taskTitle(task, lang)}</div>
          <div className="text-xs text-ink-3">
            {typeLabel(task.task_type, t)}
            {task.deadline && (
              <span
                className={cn(
                  dl === 'overdue' && 'text-danger',
                  dl === 'soon' && 'text-warn',
                )}
              >
                {` · ${t('tasksui.deadline')} ${formatDate(task.deadline)}`}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <TaskStatusBadge status={task.status} />
        </div>
      </div>

      {task.task_links && task.task_links.length > 0 && (
        <ul className="mt-2 space-y-1">
          {task.task_links.map((l) => (
            <li key={l.id} className="flex min-w-0 items-center gap-2 text-sm">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 truncate text-accent underline"
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
                  className="text-ink-3 transition-colors hover:text-danger"
                  aria-label={t('tasksui.deleteLink')}
                >
                  <X size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {task.admin_comment && (
        <p className="mt-2 text-sm text-ink-2">
          <b className="text-ink">{t('tasksui.adminComment')}</b> {task.admin_comment}
        </p>
      )}
      {task.user_comment && (
        <p className="mt-1 text-sm text-ink-2">
          <b className="text-ink">{t('tasksui.userComment')}</b> {task.user_comment}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-3">
        <span>{t('tasksui.created')} {formatDate(task.created_at)}</span>
        {task.sent_at && <span>{t('tasksui.sent')} {formatDate(task.sent_at)}</span>}
        {task.accepted_at && <span>{t('tasksui.accepted')} {formatDate(task.accepted_at)}</span>}
      </div>

      {isAdmin && <TaskAdminControls task={task} />}
      {canRespond && <TaskOwnerControls task={task} />}
    </div>
  )
}
