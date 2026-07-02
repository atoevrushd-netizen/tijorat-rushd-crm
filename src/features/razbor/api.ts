import { supabase } from '@/lib/supabase'
import type { RazborAnswer, RazborField, RazborSection } from '@/types'

/** Разделы «Разбора» (общий контент), по порядку. */
export async function listSections(): Promise<RazborSection[]> {
  const { data, error } = await supabase
    .from('razbor_sections')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as RazborSection[]
}

/** Ответы лида по всем разборам. */
export async function listAnswers(userId: string): Promise<RazborAnswer[]> {
  const { data, error } = await supabase
    .from('razbor_answers')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as RazborAnswer[]
}

/** Сохранить ответ (свой — лид, любой — админ; RLS). */
export async function upsertAnswer(input: {
  userId: string
  sectionId: string
  field: RazborField
  answer: string
}): Promise<void> {
  const { error } = await supabase.from('razbor_answers').upsert(
    {
      user_id: input.userId,
      section_id: input.sectionId,
      field: input.field,
      answer: input.answer,
    },
    { onConflict: 'user_id,section_id,field' },
  )
  if (error) throw error
}
