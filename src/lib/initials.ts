/** Инициалы из имени (до 2 букв). Пусто/нет имени → «?». */
export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const result = parts.map((p) => p.charAt(0).toUpperCase()).join('')
  return result || '?'
}
