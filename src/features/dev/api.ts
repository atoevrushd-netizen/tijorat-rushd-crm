import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

/** Все профили (разработчик видит всех: лидов, админов, разработчиков). */
export async function listAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })
  if (error) throw error
  return (data ?? []) as Profile[]
}

/** Сменить роль пользователя (guard в БД пускает только разработчика). */
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) throw error
}

export type Overview = {
  leads: number
  admins: number
  developers: number
  tasks: number
}

export async function getOverview(): Promise<Overview> {
  // Считаем count-запросами (head:true) — без выгрузки строк.
  const roleCount = (role: UserRole) =>
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', role)
  const [leads, admins, developers, tasksCount] = await Promise.all([
    roleCount('user').is('deleted_at', null),
    roleCount('admin'),
    roleCount('developer'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }),
  ])
  const err = leads.error || admins.error || developers.error || tasksCount.error
  if (err) throw err
  return {
    leads: leads.count ?? 0,
    admins: admins.count ?? 0,
    developers: developers.count ?? 0,
    tasks: tasksCount.count ?? 0,
  }
}
