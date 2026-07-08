import { ChevronRight, Users as UsersIcon } from 'lucide-react'
import type { Profile } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate } from '@/lib/utils'

/** Список пользователей: карточки на телефоне, таблица на планшете/десктопе. */
export function UsersTable({
  users,
  onRowClick,
}: {
  users: Profile[]
  onRowClick?: (user: Profile) => void
}) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border border-line bg-surface px-6 py-14 text-center shadow-sh1">
        <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-accent-soft text-accent">
          <UsersIcon className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-ink-2">Пользователи не найдены</p>
      </div>
    )
  }

  return (
    <>
      {/* Карточки — телефон (< lg) */}
      <ul className="space-y-2.5 lg:hidden">
        {users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onRowClick?.(user)}
              className="flex w-full items-center gap-3 rounded-[16px] border border-line bg-surface p-3 text-left shadow-sh1 transition-all duration-200 ease-ios hover:border-line-strong hover:bg-surface-2 active:scale-[.99]"
            >
              <Avatar name={user.full_name} src={user.photo_url} size={44} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-ink">
                  {user.full_name || '—'}
                </div>
                <div className="truncate font-mono text-xs text-ink-3">
                  {user.phone || '—'}
                </div>
              </div>
              <StatusBadge status={user.status} />
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" />
            </button>
          </li>
        ))}
      </ul>

      {/* Таблица — планшет/десктоп (lg+) */}
      <div className="hidden overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-2/60 font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">
              <tr>
                <th className="px-5 py-3 font-medium">Пользователь</th>
                <th className="px-5 py-3 font-medium">Телефон</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium">Регистрация</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onRowClick?.(user)}
                  className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-2"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} src={user.photo_url} size={38} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink">
                          {user.full_name || '—'}
                        </div>
                        {user.business_direction && (
                          <div className="truncate text-xs text-ink-3">
                            {user.business_direction}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-ink-2">
                    {user.phone || '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-ink-3">
                    {formatDate(user.registration_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
