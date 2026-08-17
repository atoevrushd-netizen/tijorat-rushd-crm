import { supabase } from '@/lib/supabase'
import type { Profile } from './types'

/** Вход по email и паролю. */
export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Выход. */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Профиль текущего пользователя. Админ-поля (admin_comment, plan_months, paid_at)
// резиденту НЕДОСТУПНЫ на уровне БД (колоночные привилегии, миграция 0061) — их и не
// запрашиваем (select * упал бы). Период подписки — можно: резидент видит его в настройках.
const SELF_COLS =
  'id, full_name, phone, email, photo_url, role, status, business_direction, login, subscription_start, subscription_end, registration_date, created_at, updated_at, deleted_at, deactivated_at'

/** Загрузить профиль текущего пользователя по id (без админских полей). */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(SELF_COLS)
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as unknown as Profile) ?? null
}
