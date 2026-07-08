import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Profile, TaskStatus } from '@/types'
import { useT } from '@/i18n/useT'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TaskStatusBadge } from '@/features/tasks/TaskStatusBadge'
import { cn, formatDate } from '@/lib/utils'
import { taskTitle } from '@/lib/taskI18n'
import type { RecentTask } from './api'

/** Цветная точка статуса — те же тоны, что и у TaskStatusBadge (декоративный акцент). */
const STATUS_DOT: Record<TaskStatus, string> = {
  not_started: 'bg-ink-3',
  in_progress: 'bg-info',
  done: 'bg-success',
  sent_to_user: 'bg-warn',
  accepted_by_user: 'bg-accent',
  needs_revision: 'bg-danger',
}

/** Ссылка «все →» в шапке карточки. */
function AllLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-accent"
    >
      {label}
      <ChevronRight size={14} className="-mr-0.5" />
    </Link>
  )
}

/** Новые пользователи: ряд-flex на телефоне, таблица-grid на sm+. */
export function RecentUsersCard({
  users,
  onOpen,
}: {
  users: Profile[]
  onOpen: (id: string) => void
}) {
  const { t } = useT()
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-[22px] sm:py-[18px]">
        <div className="text-[15px] font-bold text-ink">{t('dash.recentUsers')}</div>
        <AllLink to="/admin/users" label={t('dash.all')} />
      </div>
      {/* Шапка колонок — только на sm+ */}
      <div className="hidden border-b border-line px-[22px] py-[11px] font-mono text-[10.5px] uppercase tracking-[.06em] text-ink-3 sm:grid sm:grid-cols-[2fr_1fr_1fr]">
        <div>{t('dash.colUser')}</div>
        <div>{t('dash.colStatus')}</div>
        <div>{t('dash.colRegistration')}</div>
      </div>
      {users.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-3">{t('dash.emptyUsers')}</p>
      )}
      {users.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => onOpen(u.id)}
          className="group flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-2 sm:grid sm:grid-cols-[2fr_1fr_1fr] sm:gap-0 sm:px-[22px] sm:py-3.5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none">
            <Avatar
              name={u.full_name}
              src={u.photo_url}
              size={30}
              className="shrink-0 ring-1 ring-line"
            />
            <span className="truncate text-[13.5px] font-semibold text-ink">
              {u.full_name || '—'}
            </span>
          </div>
          <div className="shrink-0">
            <StatusBadge status={u.status} />
          </div>
          <div className="hidden items-center gap-1.5 font-mono text-[13px] text-ink-2 sm:flex">
            {formatDate(u.registration_date)}
            <ChevronRight
              size={15}
              className="text-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
        </button>
      ))}
    </Card>
  )
}

/** Список недавних задач: цветная точка статуса, ровный ритм, hairline-разделители. */
export function RecentTasksCard({ tasks }: { tasks: RecentTask[] }) {
  const { t, lang } = useT()
  return (
    <Card className="overflow-hidden p-4 sm:p-[22px]">
      <div className="mb-2 text-[15px] font-bold text-ink">{t('dash.recentTasks')}</div>
      {tasks.length === 0 ? (
        <p className="py-4 text-sm text-ink-3">{t('dash.emptyTasks')}</p>
      ) : (
        <div className="flex flex-col">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex min-w-0 items-start gap-3 border-b border-line py-3 last:border-0 last:pb-0 first:pt-1"
            >
              <span
                className={cn(
                  'mt-[7px] h-2 w-2 shrink-0 rounded-full',
                  STATUS_DOT[task.status],
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 break-words text-[13.5px] font-medium text-ink">
                  {taskTitle(task, lang)}
                </div>
                {task.userName && (
                  <div className="truncate text-[11.5px] text-ink-3">{task.userName}</div>
                )}
              </div>
              <div className="shrink-0">
                <TaskStatusBadge status={task.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
