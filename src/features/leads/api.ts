import { supabase } from '@/lib/supabase'
import type { Lead } from '@/types'

/** Все лиды (постранично до конца). RLS пускает только админов. */
export async function listLeads(): Promise<Lead[]> {
  const CHUNK = 1000
  const rows: Lead[] = []
  for (let from = 0; ; from += CHUNK) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + CHUNK - 1)
    if (error) throw error
    const batch = (data ?? []) as Lead[]
    rows.push(...batch)
    if (batch.length < CHUNK) break
  }
  return rows
}
