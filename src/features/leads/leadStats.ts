import type { Lead } from '@/types'

export type SourceStat = { source: string; count: number }

export type LeadStats = {
  total: number
  converted: number
  notConverted: number
  /** Конверсия в пользователей, % (целое). */
  rate: number
  /** Разбивка по источникам, по убыванию количества. */
  bySource: SourceStat[]
}

/** Посчитать воронку по лидам: всего, конвертировано, % и разбивку по источникам. */
export function leadStats(leads: Lead[]): LeadStats {
  const total = leads.length
  const converted = leads.filter((l) => l.converted_user_id).length
  const notConverted = total - converted
  const rate = total ? Math.round((converted / total) * 100) : 0

  const map = new Map<string, number>()
  for (const l of leads) {
    const key = l.source || 'unknown'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  const bySource = [...map.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  return { total, converted, notConverted, rate, bySource }
}
