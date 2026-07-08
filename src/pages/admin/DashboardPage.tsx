import { useNavigate } from 'react-router-dom'
import { Activity, CheckCircle2, UserCheck, Users } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { weekdayDayMonth } from '@/lib/dateI18n'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { HeroStatCard, StatCard } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/useAuth'
import { useDashboard } from '@/features/dashboard/useDashboard'
import { ChartCard, DonutCard } from '@/features/dashboard/DashboardCharts'
import {
  RecentTasksCard,
  RecentUsersCard,
} from '@/features/dashboard/DashboardRecent'

/** Дашборд админа: bento-KPI с градиентным hero + графики + недавнее. */
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
        <Button leftIcon={<Users className="h-4 w-4" />} onClick={() => navigate('/admin/users')}>
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
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Skeleton className="col-span-2 h-[132px] rounded-[20px] lg:col-span-1" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[132px] rounded-[18px]" />
            ))}
          </div>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.7fr_1fr]">
            <Skeleton className="h-[300px] rounded-[18px]" />
            <Skeleton className="h-[300px] rounded-[18px]" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {/* Bento: градиентный hero + чистые KPI-плитки */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <HeroStatCard
              className="col-span-2 lg:col-span-1"
              label={t('dash.kpiUsers')}
              value={data.usersTotal}
              icon={<Users className="h-5 w-5" />}
              hint={
                data.usersTotal ? `${t('dash.kpiActive')}: ${data.usersActive}` : undefined
              }
            />
            <StatCard
              tone="success"
              label={t('dash.kpiActive')}
              value={data.usersActive}
              icon={<UserCheck className="h-[18px] w-[18px]" />}
            />
            <StatCard
              tone="warn"
              label={t('dash.kpiInProgress')}
              value={data.tasksInProgress}
              icon={<Activity className="h-[18px] w-[18px]" />}
            />
            <StatCard
              tone="info"
              label={t('dash.kpiAccepted')}
              value={data.tasksAccepted}
              icon={<CheckCircle2 className="h-[18px] w-[18px]" />}
            />
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.7fr_1fr]">
            <ChartCard byStatus={data.tasksByStatus} />
            <DonutCard accepted={data.tasksAccepted} total={data.tasksTotal} />
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.5fr_1fr]">
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
