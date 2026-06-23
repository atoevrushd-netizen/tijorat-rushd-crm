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
      <p className="py-10 text-center text-sm text-ink-3">
        Пользователи не найдены
      </p>
    )
  }

  return (
    <>
      {/* Карточки — телефон (< md) */}
      <ul className="space-y-2 lg:hidden">
        {users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onRowClick?.(user)}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:bg-surface-2 active:bg-surface-2"
            >
              <Avatar name={user.full_name} src={user.photo_url} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-ink">
                  {user.full_name || '—'}
                </div>
                <div className="truncate font-mono text-xs text-ink-3">
                  {user.phone || '—'}
                </div>
              </div>
              <StatusBadge status={user.status} />
            </button>
          </li>
        ))}
      </ul>

      {/* Таблица — планшет/десктоп (md+) */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] uppercase tracking-wide text-ink-3">
            <tr>
              <th className="px-4 py-3 font-mono font-medium">Пользователь</th>
              <th className="px-4 py-3 font-mono font-medium">Телефон</th>
              <th className="px-4 py-3 font-mono font-medium">Статус</th>
              <th className="px-4 py-3 font-mono font-medium">Регистрация</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                onClick={() => onRowClick?.(user)}
                className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} src={user.photo_url} size={36} />
                    <div>
                      <div className="font-medium text-ink">
                        {user.full_name || '—'}
                      </div>
                      {user.business_direction && (
                        <div className="text-xs text-ink-3">
                          {user.business_direction}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-ink-2">
                  {user.phone || '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 font-mono text-ink-2">
                  {formatDate(user.registration_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
