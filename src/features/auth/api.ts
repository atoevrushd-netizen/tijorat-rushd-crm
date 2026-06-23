import { supabase } from '@/lib/supabase'
import type { Profile } from './types'

/** Вход по email и паролю. */
export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Вход через Google (OAuth-редирект). */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

/** Выход. */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Загрузить профиль пользователя по id. */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data as Profile | null
}
