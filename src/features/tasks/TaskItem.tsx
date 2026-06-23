import { X } from 'lucide-react'
import type { Task } from '@/types'
import { formatDate } from '@/lib/utils'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskAdminControls } from './TaskAdminControls'
import { TaskOwnerControls } from './TaskOwnerControls'
import { useDeleteTaskLink } from './useTasks'

function typeLabel(type: string | null): string {
  if (type === 'reels') return 'Reels'
  if (type === 'creative') return 'Креатив'
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
  const delLink = useDeleteTaskLink()
  const canRespond = isOwner && task.status === 'sent_to_user'

  return (
    <div className="rounded-lg border border-line bg-surface-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-ink">{task.title}</div>
          <div className="text-xs text-ink-3">
            {typeLabel(task.task_type)}
            {task.deadline && ` · дедлайн ${formatDate(task.deadline)}`}
          </div>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.task_links && task.task_links.length > 0 && (
        <ul className="mt-2 space-y-1">
          {task.task_links.map((l) => (
            <li key={l.id} className="flex items-center gap-2 text-sm">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-info underline"
              >
                {l.label || l.url}
              </a>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Удалить ссылку?')) delLink.mutate(l.id)
                  }}
                  className="text-ink-3 transition-colors hover:text-danger"
                  aria-label="Удалить ссылку"
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
          <b className="text-ink">Комментарий админа:</b> {task.admin_comment}
        </p>
      )}
      {task.user_comment && (
        <p className="mt-1 text-sm text-ink-2">
          <b className="text-ink">Комментарий пользователя:</b> {task.user_comment}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-3">
        <span>создано {formatDate(task.created_at)}</span>
        {task.sent_at && <span>отправлено {formatDate(task.sent_at)}</span>}
        {task.accepted_at && <span>принято {formatDate(task.accepted_at)}</span>}
      </div>

      {isAdmin && <TaskAdminControls task={task} />}
      {canRespond && <TaskOwnerControls task={task} />}
    </div>
  )
}
