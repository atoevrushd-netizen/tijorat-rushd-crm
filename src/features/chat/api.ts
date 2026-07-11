import { supabase } from '@/lib/supabase'
import type { UserStatus } from '@/types'
import type { Audience, BroadcastRow, ChatMessage, ConversationRow, FileMeta } from './types'

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

/** Сменить статус лида из чата (RLS: только админ на строке резидента). */
export async function setLeadStatus(leadId: string, status: UserStatus): Promise<void> {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', leadId)
  if (error) throw error
}

/** Внутренняя заметка о лиде (поле admin_comment, видят только админы). */
export async function setLeadNote(leadId: string, note: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ admin_comment: note.trim() || null })
    .eq('id', leadId)
  if (error) throw error
}

export type UploadedFile = { path: string; name: string; size: number; mime: string }

/**
 * Загрузка файла в приватный бакет 'chat' с ПРОГРЕССОМ и отменой (через XHR —
 * supabase-js не отдаёт прогресс). Путь: {conversationId}/{uuid}.{ext}.
 */
export async function uploadChatFile(
  conversationId: string,
  file: File,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<UploadedFile> {
  const dot = file.name.lastIndexOf('.')
  const ext = dot > 0 ? file.name.slice(dot) : ''
  const path = `${conversationId}/${crypto.randomUUID()}${ext}`
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const base = import.meta.env.VITE_SUPABASE_URL

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${base}/storage/v1/object/chat/${path}`)
    xhr.setRequestHeader('authorization', `Bearer ${token}`)
    xhr.setRequestHeader('x-upsert', 'false')
    if (file.type) xhr.setRequestHeader('content-type', file.type)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total)
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`upload_failed_${xhr.status}`))
    xhr.onerror = () => reject(new Error('upload_failed'))
    xhr.onabort = () => reject(new DOMException('aborted', 'AbortError'))
    if (signal) signal.addEventListener('abort', () => xhr.abort())
    xhr.send(file)
  })

  return { path, name: file.name, size: file.size, mime: file.type || 'application/octet-stream' }
}

/** Сообщение-вложение: файл (kind='file') или голосовое (kind='voice'). */
export async function sendFileMessage(
  conversationId: string,
  senderId: string,
  att: UploadedFile,
  opts?: { caption?: string; kind?: 'file' | 'voice'; meta?: FileMeta; replyToId?: string | null },
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: opts?.caption?.trim() || null,
      kind: opts?.kind ?? 'file',
      reply_to_id: opts?.replyToId ?? null,
      attachment_path: att.path,
      attachment_name: att.name,
      attachment_size: att.size,
      attachment_mime: att.mime,
      attachment_meta: opts?.meta ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as ChatMessage
}

// ── Массовые рассылки ───────────────────────────────────────────────────────

/** Сколько получателей у выбранной аудитории (для предпросмотра). */
export async function audienceCount(audience: Audience, leadIds: string[]): Promise<number> {
  const { data, error } = await supabase.rpc('broadcast_audience_count', {
    p_audience: audience,
    p_lead_ids: leadIds,
  })
  if (error) throw error
  return (data as number) ?? 0
}

/** Отправить рассылку. Возвращает id и счётчики доставки. */
export async function sendBroadcast(
  audience: Audience,
  leadIds: string[],
  body: string,
): Promise<{ id: string; delivered: number; errors: number }> {
  const { data, error } = await supabase.rpc('send_broadcast', {
    p_audience: audience,
    p_lead_ids: leadIds,
    p_body: body,
  })
  if (error) throw error
  return data as { id: string; delivered: number; errors: number }
}

/** Повторно отправить тем, кому не доставлено. */
export async function resendBroadcast(id: string): Promise<{ resent: number; errors: number }> {
  const { data, error } = await supabase.rpc('resend_broadcast', { p_broadcast: id })
  if (error) throw error
  return data as { resent: number; errors: number }
}

/** История рассылок со статистикой. */
export async function listBroadcasts(): Promise<BroadcastRow[]> {
  const { data, error } = await supabase
    .from('chat_broadcast_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as BroadcastRow[]
}

/**
 * Подписанная ссылка на файл (приватный бакет; RLS пускает участников).
 * downloadName != null → Content-Disposition: attachment (файл скачивается, а не
 * открывается встроенно) — защита от inline HTML/SVG. TTL 6ч.
 */
export async function getSignedUrl(path: string, downloadName?: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('chat')
    .createSignedUrl(path, 21600, downloadName ? { download: downloadName } : undefined)
  if (error) throw error
  return data.signedUrl
}
