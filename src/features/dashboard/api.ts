import { supabase } from '@/lib/supabase'
import type { Profile, TaskStatus } from '@/types'

const STATUSES: TaskStatus[] = [
  'not_started',
  'in_progress',
  'done',
  'sent_to_user',
  'accepted_by_user',
  'needs_revision',
]

export type RecentTask = {
  id: string
  title: string
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

/** Сводные данные для дашборда админа (RLS пускает только админов). */
export async function getDashboard(): Promise<DashboardData> {
  const [usersRes, tasksRes, recentUsersRes, recentTasksRes] = await Promise.all([
    supabase.from('profiles').select('status'),
    supabase.from('tasks').select('status'),
    supabase
      .from('profiles')
      .select('*')
      .order('registration_date', { ascending: false })
      .limit(5),
    supabase
      .from('tasks')
      .select('id,title,status,owner:user_id(full_name)')
      .order('updated_at', { ascending: false })
      .limit(6),
  ])

  if (usersRes.error) throw usersRes.error
  if (tasksRes.error) throw tasksRes.error
  if (recentUsersRes.error) throw recentUsersRes.error
  if (recentTasksRes.error) throw recentTasksRes.error

  const users = (usersRes.data ?? []) as { status: string }[]
  const tasks = (tasksRes.data ?? []) as { status: TaskStatus }[]

  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, 0]),
  ) as Record<TaskStatus, number>
  for (const t of tasks) byStatus[t.status] = (byStatus[t.status] ?? 0) + 1

  const rows = (recentTasksRes.data ?? []) as {
    id: string
    title: string
    status: TaskStatus
    owner: unknown
  }[]

  return {
    usersTotal: users.length,
    usersActive: users.filter((u) => u.status === 'active').length,
    tasksTotal: tasks.length,
    tasksAccepted: byStatus.accepted_by_user,
    tasksInProgress:
      byStatus.in_progress + byStatus.sent_to_user + byStatus.done,
    tasksByStatus: byStatus,
    recentUsers: (recentUsersRes.data ?? []) as Profile[],
    recentTasks: rows.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      userName: ownerName(r.owner),
    })),
  }
}
