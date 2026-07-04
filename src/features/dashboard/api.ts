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

/** Быстрый count без выгрузки строк (head:true → передаётся только число). */
async function countOf<T extends { count: number | null; error: unknown }>(
  query: PromiseLike<T>,
): Promise<number> {
  const res = await query
  if (res.error) throw res.error
  return res.count ?? 0
}

/**
 * Сводные данные для дашборда админа (RLS пускает только админов).
 * Счётчики берём count-запросами (head:true) — не тянем тысячи строк ради подсчёта.
 */
export async function getDashboard(): Promise<DashboardData> {
  const leadFilter = () =>
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
      .is('deleted_at', null)
  const statusCount = (s: TaskStatus) =>
    countOf(
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', s),
    )

  const [
    usersTotal,
    usersActive,
    notStarted,
    inProgress,
    done,
    sentToUser,
    accepted,
    needsRevision,
    recentUsersRes,
    recentTasksRes,
  ] = await Promise.all([
    countOf(leadFilter()),
    countOf(leadFilter().eq('status', 'active')),
    statusCount('not_started'),
    statusCount('in_progress'),
    statusCount('done'),
    statusCount('sent_to_user'),
    statusCount('accepted_by_user'),
    statusCount('needs_revision'),
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .is('deleted_at', null)
      .order('registration_date', { ascending: false })
      .limit(5),
    supabase
      // '*' — чтобы безопасно получить title_ru/title_tg (их может ещё не быть до миграции 0029).
      .from('tasks')
      .select('*,owner:user_id(full_name)')
      .order('updated_at', { ascending: false })
      .limit(6),
  ])

  if (recentUsersRes.error) throw recentUsersRes.error
  if (recentTasksRes.error) throw recentTasksRes.error

  const byStatus: Record<TaskStatus, number> = {
    not_started: notStarted,
    in_progress: inProgress,
    done,
    sent_to_user: sentToUser,
    accepted_by_user: accepted,
    needs_revision: needsRevision,
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
    usersTotal,
    usersActive,
    tasksTotal,
    tasksAccepted: accepted,
    // «В работе» = только незавершённые (done сюда не входит).
    tasksInProgress: inProgress + sentToUser,
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
