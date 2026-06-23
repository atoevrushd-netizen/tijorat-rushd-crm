/**
 * Строит значение для supabase `.or(...)` из поискового запроса.
 * Возвращает null, если фильтр не нужен (пустой запрос).
 * Запятые ломают синтаксис `.or()` — заменяем их на пробел.
 */
export function buildSearchFilter(search: string): string | null {
  // Запятые и скобки ломают синтаксис .or() PostgREST — заменяем на пробел.
  const term = search.trim().replace(/[,()]/g, ' ')
  if (!term) return null
  const like = `%${term}%`
  return `full_name.ilike.${like},phone.ilike.${like},login.ilike.${like},email.ilike.${like}`
}
