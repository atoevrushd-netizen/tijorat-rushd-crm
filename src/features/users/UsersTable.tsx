import { BadgeCheck, ChevronRight, Users as UsersIcon } from 'lucide-react'
import type { Profile } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cn, formatDate } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { PlanBadge } from './PlanBadge'

/** Мягкая зелёная «дымка» оплатившего поверх поверхности строки/карточки. */
const PAID_WASH =
  'linear-gradient(0deg, var(--success-soft), var(--success-soft)), var(--surface)'

/** Список пользователей: карточки на телефоне, таблица на планшете/десктопе. */
export function UsersTable({
  users,
  onRowClick,
}: {
  users: Profile[]
  onRowClick?: (user: Profile) => void
}) {
  const { t } = useT()
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border border-line bg-surface px-6 py-14 text-center shadow-sh1">
        <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-accent-soft text-accent">
          <UsersIcon className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-ink-2">{t('users.emptyList')}</p>
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
              className={cn(
                'flex w-full items-center gap-3 rounded-[16px] border bg-surface p-3 text-left shadow-sh1 transition-all duration-200 ease-ios active:scale-[.99]',
                user.paid_at
                  ? 'border-[rgba(52,199,89,.35)] hover:border-[rgba(52,199,89,.55)]'
                  : 'border-line hover:border-line-strong hover:bg-surface-2',
              )}
              style={user.paid_at ? { background: PAID_WASH } : undefined}
            >
              <Avatar
                name={user.full_name}
                src={user.photo_url}
                size={44}
                className={cn(user.paid_at && 'ring-2 ring-[rgba(52,199,89,.45)]')}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold text-ink">
                    {user.full_name || '—'}
                  </span>
                  {user.paid_at && (
                    <BadgeCheck
                      size={15}
                      className="shrink-0 text-success"
                      aria-label={t('usercard.paidBadge')}
                    />
                  )}
                </div>
                <div className="truncate font-mono text-xs text-ink-3">
                  {user.phone || '—'}
                </div>
              </div>
              <PlanBadge months={user.plan_months} />
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
                <th className="px-5 py-3 font-medium">{t('users.colUser')}</th>
                <th className="px-5 py-3 font-medium">{t('users.colPhone')}</th>
                <th className="px-5 py-3 font-medium">{t('users.colPlan')}</th>
                <th className="px-5 py-3 font-medium">{t('users.colStatus')}</th>
                <th className="px-5 py-3 font-medium">{t('users.colRegistered')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onRowClick?.(user)}
                  role="button"
                  tabIndex={0}
                  aria-label={user.full_name || user.login || '—'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onRowClick?.(user)
                    }
                  }}
                  className={cn(
                    'cursor-pointer border-b border-line transition-colors last:border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                    user.paid_at
                      ? 'bg-success-soft shadow-[inset_3px_0_0_var(--success)] hover:brightness-[1.03] focus-visible:bg-success-soft'
                      : 'hover:bg-surface-2 focus-visible:bg-surface-2',
                  )}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={user.full_name}
                        src={user.photo_url}
                        size={38}
                        className={cn(user.paid_at && 'ring-2 ring-[rgba(52,199,89,.45)]')}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-ink">
                            {user.full_name || '—'}
                          </span>
                          {user.paid_at && (
                            <BadgeCheck
                              size={15}
                              className="shrink-0 text-success"
                              aria-label={t('usercard.paidBadge')}
                            />
                          )}
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
                    <PlanBadge months={user.plan_months} />
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
