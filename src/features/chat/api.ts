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

/** Отправить текстовое сообщение (опц. как ответ на другое). */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  replyToId?: string | null,
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body,
      kind: 'text',
      reply_to_id: replyToId ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as ChatMessage
}

/** Редактировать своё сообщение (RLS: автор или админ). */
export async function editMessage(id: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ body, edited_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** Мягко удалить сообщение (остаётся «плашка»). */
export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ deleted_at: new Date().toISOString(), body: null })
    .eq('id', id)
  if (error) throw error
}

export type ConversationPatch = {
  pinned?: boolean
  archived?: boolean
  muted?: boolean
}

/** Изменить флаги диалога (RLS: только админ). */
export async function updateConversation(id: string, patch: ConversationPatch): Promise<void> {
  const { error } = await supabase.from('chat_conversations').update(patch).eq('id', id)
  if (error) throw error
}

/** Отметить диалог прочитанным для своей стороны. */
export async function markRead(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('chat_mark_read', { p_conversation: conversationId })
  if (error) throw error
}

/** Отметить диалог непрочитанным (только админ). */
export async function markUnread(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('chat_mark_unread', { p_conversation: conversationId })
  if (error) throw error
}
