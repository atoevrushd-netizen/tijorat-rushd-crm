import { supabase } from '@/lib/supabase'
import type { UserStatus } from '@/types'
import type { ChatMessage, ConversationRow } from './types'

/** Все диалоги (для админа — все, для лида — свой). */
export async function listConversations(): Promise<ConversationRow[]> {
  const { data, error } = await supabase
    .from('chat_conversation_view')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as ConversationRow[]
}

export type LeadRow = {
  id: string
  full_name: string | null
  phone: string | null
  photo_url: string | null
  status: UserStatus
}

/** Все резиденты (для списка контактов админа: можно начать диалог с любым). */
export async function listLeads(): Promise<LeadRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, photo_url, status')
    .eq('role', 'user')
    .is('deleted_at', null)
    .order('full_name', { ascending: true })
  if (error) throw error
  return (data ?? []) as LeadRow[]
}

/** Диалог по id (строка представления — нужны метки прочтения для галочек). */
export async function getConversation(id: string): Promise<ConversationRow | null> {
  const { data, error } = await supabase
    .from('chat_conversation_view')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as ConversationRow) ?? null
}

/** Сообщения диалога по возрастанию времени. */
export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as ChatMessage[]
}

/** Получить/создать диалог лида, вернуть его id. */
export async function ensureConversation(leadId: string): Promise<string> {
  const { data, error } = await supabase.rpc('ensure_conversation', { p_lead: leadId })
  if (error) throw error
  return data as string
}

/** Отправить текстовое сообщение. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body, kind: 'text' })
    .select('*')
    .single()
  if (error) throw error
  return data as ChatMessage
}

/** Отметить диалог прочитанным для своей стороны. */
export async function markRead(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('chat_mark_read', { p_conversation: conversationId })
  if (error) throw error
}
