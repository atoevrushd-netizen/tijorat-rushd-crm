import { supabase } from '@/lib/supabase'
import type { Profile, TaskStatus } from '@/types'

const STATUSES: TaskStatus[] = [
  'not_started',
  'in_progress',
  'submitted',
  'done',
  'sent_to_user',
  'accepted_by_user',
  'needs_revision',
]

export type RecentTask = {
  id: string
  title: string
  title_ru?: string | null
  title_tg?: string | null
  status: TaskStatus
  userName: string | null
}

export type DashboardData = {
  usersTotal: number
  usersActive: number
  tasksTotal: number
  tasksAccepted: number
  tasksInProgress: number
  tasksByStatus: Record<TaskStatus, number>
  recentUsers: Profile[]
  recentTasks: RecentTask[]
}

function ownerName(owner: unknown): string | null {
  if (!owner) return null
  const o = Array.isArray(owner) ? owner[0] : owner
  return (o as { full_name?: string | null })?.full_name ?? null
}

type Counts = {
  users_total: number
  users_active: number
  not_started: number
  in_progress: number
  submitted: number
  done: number
  sent_to_user: number
  accepted_by_user: number
  needs_revision: number
}

/**
 * Сводные данные для дашборда админа. Счётчики — одной RPC `dashboard_counts`
 * (было ~8 отдельных count-запросов), + два запроса на «недавние». RLS пускает
 * только админов; функция security invoker уважает RLS.
 */
export async function getDashboard(): Promise<DashboardData> {
  const [countsRes, recentUsersRes, recentTasksRes] = await Promise.all([
    supabase.rpc('dashboard_counts'),
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .is('deleted_at', null)
      .order('registration_date', { ascending: false })
      .limit(5),
    supabase
      .from('tasks')
      .select('id,title,title_ru,title_tg,status,owner:user_id(full_name)')
      .order('updated_at', { ascending: false })
      .limit(6),
  ])

  if (countsRes.error) throw countsRes.error
  if (recentUsersRes.error) throw recentUsersRes.error
  if (recentTasksRes.error) throw recentTasksRes.error

  const c = (countsRes.data ?? {}) as Counts
  const byStatus: Record<TaskStatus, number> = {
    not_started: c.not_started ?? 0,
    in_progress: c.in_progress ?? 0,
    submitted: c.submitted ?? 0,
    done: c.done ?? 0,
    sent_to_user: c.sent_to_user ?? 0,
    accepted_by_user: c.accepted_by_user ?? 0,
    needs_revision: c.needs_revision ?? 0,
  }
  const tasksTotal = STATUSES.reduce((sum, s) => sum + byStatus[s], 0)

  const rows = (recentTasksRes.data ?? []) as {
    id: string
    title: string
    title_ru?: string | null
    title_tg?: string | null
    status: TaskStatus
    owner: unknown
  }[]

  return {
    usersTotal: c.users_total ?? 0,
    usersActive: c.users_active ?? 0,
    tasksTotal,
    tasksAccepted: byStatus.accepted_by_user,
    // «В работе» = незавершённые: в работе, на проверке, отправленные (done не входит).
    tasksInProgress: byStatus.in_progress + byStatus.submitted + byStatus.sent_to_user,
    tasksByStatus: byStatus,
    recentUsers: (recentUsersRes.data ?? []) as Profile[],
    recentTasks: rows.map((r) => ({
      id: r.id,
      title: r.title,
      title_ru: r.title_ru,
      title_tg: r.title_tg,
      status: r.status,
      userName: ownerName(r.owner),
    })),
  }
}
