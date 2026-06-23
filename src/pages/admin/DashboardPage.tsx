import { useNavigate } from 'react-router-dom'
import { Activity, CheckCircle2, UserCheck, Users } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
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
  const { profile } = useAuth()
  const { data, isLoading, isError } = useDashboard()

  const firstName = (profile?.full_name || 'админ').split(' ')[0]
  const dateStr = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <AppShell
      title={`Добро пожаловать, ${firstName}`}
      subtitle={`${dateStr} · обзор системы`}
      nav={adminNav}
      action={
        <Button leftIcon={<Users className="h-3.5 w-3.5" />} onClick={() => navigate('/admin/users')}>
          Все пользователи
        </Button>
      }
    >
      {isError ? (
        <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm">
          <p className="text-danger">Не удалось загрузить данные дашборда.</p>
          <p className="mt-1 text-ink-3">Обновите страницу или попробуйте позже.</p>
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
            <StatCard label="Пользователей" value={data.usersTotal} icon={<Users className="h-3.5 w-3.5" />} />
            <StatCard label="Активных" value={data.usersActive} icon={<UserCheck className="h-3.5 w-3.5" />} />
            <StatCard label="Задач в работе" value={data.tasksInProgress} icon={<Activity className="h-3.5 w-3.5" />} />
            <StatCard label="Принято задач" value={data.tasksAccepted} icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
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
