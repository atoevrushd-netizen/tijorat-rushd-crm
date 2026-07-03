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

export type Flags = Record<string, string>

export async function getFlags(): Promise<Flags> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('flags')
    .eq('id', 1)
    .single()
  if (error) throw error
  return ((data?.flags as Flags | null) ?? {}) as Flags
}

export async function setFlags(flags: Flags): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .update({ flags, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) throw error
}

export type Overview = {
  leads: number
  admins: number
  developers: number
  tasks: number
}

export async function getOverview(): Promise<Overview> {
  const [profs, tasksCount] = await Promise.all([
    supabase.from('profiles').select('role, deleted_at'),
    supabase.from('tasks').select('id', { count: 'exact', head: true }),
  ])
  if (profs.error) throw profs.error
  const rows = (profs.data ?? []) as { role: UserRole; deleted_at: string | null }[]
  return {
    leads: rows.filter((r) => r.role === 'user' && !r.deleted_at).length,
    admins: rows.filter((r) => r.role === 'admin').length,
    developers: rows.filter((r) => r.role === 'developer').length,
    tasks: tasksCount.count ?? 0,
  }
}
