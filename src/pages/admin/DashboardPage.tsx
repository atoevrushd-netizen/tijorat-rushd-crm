import { useNavigate } from 'react-router-dom'
import { Activity, CheckCircle2, UserCheck, Users } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { weekdayDayMonth } from '@/lib/dateI18n'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/useAuth'
import { useDashboard } from '@/features/dashboard/useDashboard'
import { ChartCard, DonutCard } from '@/features/dashboard/DashboardCharts'
import {
  RecentTasksCard,
  RecentUsersCard,
} from '@/features/dashboard/DashboardRecent'

/** Дашборд админа — по макету CRM Dashboard, на данных нашей CRM. */
export function DashboardPage() {
  const navigate = useNavigate()
  const { t, lang } = useT()
  const { profile } = useAuth()
  const { data, isLoading, isError } = useDashboard()

  const firstName = (profile?.full_name || t('dash.admin')).split(' ')[0]
  const dateStr = weekdayDayMonth(new Date(), lang)

  return (
    <AppShell
      title={`${t('dash.welcome')}, ${firstName}`}
      subtitle={`${dateStr} · ${t('dash.overview')}`}
      action={
        <Button leftIcon={<Users className="h-3.5 w-3.5" />} onClick={() => navigate('/admin/users')}>
          {t('dash.allUsers')}
        </Button>
      }
    >
      {isError ? (
        <div className="rounded-[18px] border border-line bg-surface p-8 text-center text-sm shadow-sh1">
          <p className="text-danger">{t('dash.loadError')}</p>
          <p className="mt-1 text-ink-3">{t('dash.loadErrorHint')}</p>
        </div>
      ) : isLoading || !data ? (
        <div className="space-y-4 sm:space-y-[18px]">
          <div className="grid grid-cols-2 gap-3 sm:gap-[18px] lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[88px] sm:h-[116px]" />
            ))}
          </div>
          <div className="grid gap-3 sm:gap-[18px] lg:grid-cols-[1.7fr_1fr]">
            <Skeleton className="h-[280px]" />
            <Skeleton className="h-[280px]" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-[22px]">
          <div className="grid grid-cols-2 gap-3 sm:gap-[18px] lg:grid-cols-4">
            <StatCard label={t('dash.kpiUsers')} value={data.usersTotal} icon={<Users className="h-3.5 w-3.5" />} />
            <StatCard label={t('dash.kpiActive')} value={data.usersActive} icon={<UserCheck className="h-3.5 w-3.5" />} />
            <StatCard label={t('dash.kpiInProgress')} value={data.tasksInProgress} icon={<Activity className="h-3.5 w-3.5" />} />
            <StatCard label={t('dash.kpiAccepted')} value={data.tasksAccepted} icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
          </div>

          <div className="grid gap-3 sm:gap-[18px] lg:grid-cols-[1.7fr_1fr]">
            <ChartCard byStatus={data.tasksByStatus} />
            <DonutCard accepted={data.tasksAccepted} total={data.tasksTotal} />
          </div>

          <div className="grid gap-3 sm:gap-[18px] lg:grid-cols-[1.5fr_1fr]">
            <RecentUsersCard
              users={data.recentUsers}
              onOpen={(id) => navigate(`/admin/users/${id}`)}
            />
            <RecentTasksCard tasks={data.recentTasks} />
          </div>
        </div>
      )}
    </AppShell>
  )
}
