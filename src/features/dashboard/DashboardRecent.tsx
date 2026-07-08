import { Link } from 'react-router-dom'
import type { Profile } from '@/types'
import { useT } from '@/i18n/useT'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TaskStatusBadge } from '@/features/tasks/TaskStatusBadge'
import { formatDate } from '@/lib/utils'
import { taskTitle } from '@/lib/taskI18n'
import type { RecentTask } from './api'

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
    <div className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1">
      <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-[22px] sm:py-[18px]">
        <div className="text-[15px] font-bold text-ink">{t('dash.recentUsers')}</div>
        <Link
          to="/admin/users"
          className="text-[12.5px] text-ink-2 transition-colors hover:text-accent"
        >
          {t('dash.all')}
        </Link>
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
          className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-2 sm:grid sm:grid-cols-[2fr_1fr_1fr] sm:gap-0 sm:px-[22px] sm:py-3.5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none">
            <Avatar name={u.full_name} src={u.photo_url} size={30} />
            <span className="truncate text-[13.5px] font-semibold text-ink">
              {u.full_name || '—'}
            </span>
          </div>
          <div className="shrink-0">
            <StatusBadge status={u.status} />
          </div>
          <div className="hidden font-mono text-[13px] text-ink-2 sm:block">
            {formatDate(u.registration_date)}
          </div>
        </button>
      ))}
    </div>
  )
}

/** Список недавних задач. */
export function RecentTasksCard({ tasks }: { tasks: RecentTask[] }) {
  const { t, lang } = useT()
  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-surface p-4 shadow-sh1 sm:p-[22px]">
      <div className="mb-4 text-[15px] font-bold text-ink">{t('dash.recentTasks')}</div>
      {tasks.length === 0 && (
        <p className="py-4 text-sm text-ink-3">{t('dash.emptyTasks')}</p>
      )}
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex min-w-0 items-start gap-3">
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
    </div>
  )
}
