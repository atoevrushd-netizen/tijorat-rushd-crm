import { supabase } from '@/lib/supabase'
import type { Achievement } from '@/types'

/** Достижения пользователя (RLS: свои или, для админа, любые). */
export async function listAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as Achievement[]
}

export type AddAchievementInput = {
  user_id: string
  title: string
  description?: string
  achieved_at?: string
  created_by?: string | null
}

/** Добавить достижение (по RLS — только админ). */
export async function addAchievement(input: AddAchievementInput): Promise<void> {
  const { error } = await supabase.from('achievements').insert({
    user_id: input.user_id,
    title: input.title,
    description: input.description ?? null,
    achieved_at: input.achieved_at || null,
    created_by: input.created_by ?? null,
  })
  if (error) throw error
}

/** Удалить достижение (по RLS — только админ). */
export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await supabase.from('achievements').delete().eq('id', id)
  if (error) throw error
}
