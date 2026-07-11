import type { UserStatus } from '@/types'

/** Сообщение чата (таблица public.chat_messages). */
export type ChatMessage = {
  id: string
  conversation_id: string
  sender_id: string | null
  body: string | null
  kind: string
  reply_to_id: string | null
  edited_at: string | null
  deleted_at: string | null
  created_at: string
  attachment_path: string | null
  attachment_name: string | null
  attachment_size: number | null
  attachment_mime: string | null
}

/** Сообщение с клиентским статусом отправки (оптимистичные/ошибочные). */
export type UiMessage = ChatMessage & { _status?: 'sending' | 'error' }

/** Строка представления chat_conversation_view (диалог + профиль лида + непрочитанные). */
export type ConversationRow = {
  id: string
  lead_id: string
  last_message: string | null
  last_message_at: string | null
  last_sender_id: string | null
  lead_last_read_at: string | null
  admin_last_read_at: string | null
  pinned: boolean
  archived: boolean
  muted: boolean
  assigned_admin_id: string | null
  lead_name: string | null
  lead_phone: string | null
  lead_photo: string | null
  lead_status: UserStatus
  unread_for_admin: number
  unread_for_lead: number
}

/** Элемент списка диалогов админа: лид + (опционально) сводка диалога. */
export type ChatListItem = {
  leadId: string
  name: string | null
  phone: string | null
  photo: string | null
  status: UserStatus
  conversationId: string | null
  lastAt: string | null
  preview: string | null
  unread: number
  fromMe: boolean
  pinned: boolean
  archived: boolean
  muted: boolean
}
