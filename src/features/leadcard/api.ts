import { supabase } from '@/lib/supabase'
import type { LeadCard, LeadCardField } from '@/types'

export type LeadCardPatch = Partial<Record<LeadCardField, string>>

/** Карточка данных лида (RLS: свою — лид, любую — админ). null, если ещё не заполнял. */
export async function getLeadCard(userId: string): Promise<LeadCard | null> {
  const { data, error } = await supabase
    .from('lead_cards')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as LeadCard | null) ?? null
}

/** Создать/обновить карточку (меняются только переданные поля). */
export async function upsertLeadCard(
  userId: string,
  patch: LeadCardPatch,
): Promise<void> {
  const { error } = await supabase
    .from('lead_cards')
    .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
  if (error) throw error
}
