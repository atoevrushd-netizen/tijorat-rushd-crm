import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import type { UserRole } from '@/types'
import {
  useAllProfiles,
  useOverview,
  useSetUserRole,
} from '@/features/dev/useDev'

const ROLES: UserRole[] = ['user', 'admin', 'developer']

/** Панель разработчика (супер-доступ): роли, флаги, обзор. */
export function DevPage() {
  const { t } = useT()
  const { profile } = useAuth()
  const profilesQ = useAllProfiles()
  const overviewQ = useOverview()
  const setRole = useSetUserRole()

  return (
    <AppShell title={t('page.dev')} subtitle={t('dev.hint')}>
      <div className="space-y-4">
        {/* Обзор */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {overviewQ.isLoading || !overviewQ.data ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[84px] rounded-[18px]" />)
          ) : (
            <>
              <StatTile label={t('dev.leads')} value={overviewQ.data.leads} />
              <StatTile label={t('dev.admins')} value={overviewQ.data.admins} />
              <StatTile label={t('dev.developers')} value={overviewQ.data.developers} />
              <StatTile label={t('dev.tasksCount')} value={overviewQ.data.tasks} />
            </>
          )}
        </section>

        {/* Быстрый доступ */}
        <section className="rounded-[18px] border border-line bg-surface p-4 shadow-sh1">
          <div className="mb-3 text-[15px] font-bold text-ink">{t('dev.quickLinks')}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <QuickLink to="/admin" icon={<LayoutDashboard size={16} />} label={t('nav.dashboard')} />
            <QuickLink to="/admin/users" icon={<Users size={16} />} label={t('nav.users')} />
            <QuickLink to="/answers" icon={<ClipboardList size={16} />} label={t('nav.answers')} />
            <QuickLink to="/admin/auto-tasks" icon={<CalendarClock size={16} />} label={t('nav.autotasks')} />
          </div>
        </section>

        {/* Управление ролями */}
        <section className="rounded-[18px] border border-line bg-surface p-5 shadow-sh1">
          <div className="text-[15px] font-bold text-ink">{t('dev.roles')}</div>
          <p className="mb-3 mt-0.5 text-[13px] text-ink-3">{t('dev.rolesHint')}</p>
          {profilesQ.isLoading ? (
            <Skeleton className="h-40 w-full rounded-[12px]" />
          ) : (
            <ul className="space-y-2">
              {(profilesQ.data ?? []).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-[12px] bg-surface-2 p-2.5"
                >
                  <Avatar name={p.full_name} src={p.photo_url} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-ink">
                      {p.full_name || '—'}
                      {p.deleted_at && <span className="ml-1 text-ink-3">{t('devPage.inTrash')}</span>}
                    </div>
                    <div className="truncate font-mono text-[11px] text-ink-3">
                      {p.login ?? p.email ?? '—'}
                    </div>
                  </div>
                  <select
                    value={p.role}
                    disabled={p.id === profile?.id || setRole.isPending}
                    onChange={(e) =>
                      setRole.mutate(
                        { userId: p.id, role: e.target.value as UserRole },
                        { onSuccess: () => toast.success(t('common.saved')) },
                      )
                    }
                    className={cn(
                      'rounded-[10px] border border-line bg-surface px-2.5 py-2 text-[13px] font-semibold outline-none focus:border-accent disabled:opacity-60',
                      p.role === 'developer'
                        ? 'text-warn'
                        : p.role === 'admin'
                          ? 'text-accent'
                          : 'text-ink',
                    )}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r === 'developer'
                          ? t('dev.roleDeveloper')
                          : r === 'admin'
                            ? t('dev.roleAdmin')
                            : t('dev.roleUser')}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-line bg-surface p-4 shadow-sh1">
      <div className="text-[26px] font-bold tracking-tight text-ink">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-ink-2">{label}</div>
    </div>
  )
}

function QuickLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-[12px] bg-surface-2 px-3 py-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink active:scale-[.98]"
    >
      <span className="text-accent">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

