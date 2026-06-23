import { Link } from 'react-router-dom'
import type { Profile } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TaskStatusBadge } from '@/features/tasks/TaskStatusBadge'
import { formatDate } from '@/lib/utils'
import type { RecentTask } from './api'

/** Новые пользователи: ряд-flex на телефоне, таблица-grid на sm+. */
export function RecentUsersCard({
  users,
  onOpen,
}: {
  users: Profile[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-[22px] sm:py-[18px]">
        <div className="text-[15px] font-bold text-ink">Новые пользователи</div>
        <Link
          to="/admin/users"
          className="text-[12.5px] text-ink-2 transition-colors hover:text-accent"
        >
          Все →
        </Link>
      </div>
      {/* Шапка колонок — только на sm+ */}
      <div className="hidden border-b border-line px-[22px] py-[11px] font-mono text-[10.5px] uppercase tracking-[.06em] text-ink-3 sm:grid sm:grid-cols-[2fr_1fr_1fr]">
        <div>Пользователь</div>
        <div>Статус</div>
        <div>Регистрация</div>
      </div>
      {users.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-3">Пока нет пользователей</p>
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
  return (
    <div className="rounded-lg border border-line bg-surface p-4 sm:p-[22px]">
      <div className="mb-4 text-[15px] font-bold text-ink">Последние задачи</div>
      {tasks.length === 0 && (
        <p className="py-4 text-sm text-ink-3">Пока нет задач</p>
      )}
      <div className="flex flex-col gap-3">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-medium text-ink">
                {t.title}
              </div>
              {t.userName && (
                <div className="truncate text-[11.5px] text-ink-3">{t.userName}</div>
              )}
            </div>
            <TaskStatusBadge status={t.status} />
          </div>
        ))}
      </div>
    </div>
  )
}
