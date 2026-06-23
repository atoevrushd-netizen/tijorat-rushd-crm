/**
 * Вход по логину (username). Supabase Auth требует email, поэтому из логина
 * строим синтетический email `<login>@users.tijorat.local`.
 * Та же логика повторена в Edge Function `admin-create-user` (Deno не видит src/).
 */

/** Домен синтетического email для входа по логину. */
export const LOGIN_EMAIL_DOMAIN = 'users.tijorat.local'

/** Нормализация логина: нижний регистр, только латиница/цифры/точка/дефис/подчёркивание. */
export function normalizeLogin(login: string): string {
  return login.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
}

/**
 * Идентификатор из формы входа → email для Supabase Auth.
 * Если введён email (есть «@») — используем как есть (старые аккаунты: admin, студенты).
 * Иначе строим синтетический email из логина.
 */
export function identifierToEmail(input: string): string {
  const v = input.trim()
  if (v.includes('@')) return v.toLowerCase()
  return `${normalizeLogin(v)}@${LOGIN_EMAIL_DOMAIN}`
}
