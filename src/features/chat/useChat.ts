import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import {
  ensureConversation,
  getConversation,
  listConversations,
  listLeads,
  listMessages,
  markRead,
  sendMessage,
} from './api'
import type { ChatListItem, ConversationRow, UiMessage } from './types'

/** Диалоги из представления (админ — все, лид — свой). */
export function useConversations() {
  return useQuery({ queryKey: ['chat', 'conversations'], queryFn: listConversations })
}

/** Резиденты (для списка контактов админа). */
export function useLeads(enabled: boolean) {
  return useQuery({ queryKey: ['chat', 'leads'], queryFn: listLeads, enabled })
}

/**
 * Список диалогов админа = все резиденты + сводка диалога (если есть).
 * Закреплённые — вверху, затем по времени последнего сообщения, затем по имени.
 */
export function useChatList(): { items: ChatListItem[]; isLoading: boolean } {
  const convsQ = useConversations()
  const leadsQ = useLeads(true)

  const items = useMemo<ChatListItem[]>(() => {
    const convByLead = new Map<string, ConversationRow>()
    for (const c of convsQ.data ?? []) convByLead.set(c.lead_id, c)

    const list = (leadsQ.data ?? []).map<ChatListItem>((lead) => {
      const c = convByLead.get(lead.id)
      return {
        leadId: lead.id,
        name: lead.full_name,
        phone: lead.phone,
        photo: lead.photo_url,
        status: lead.status,
        conversationId: c?.id ?? null,
        lastAt: c?.last_message_at ?? null,
        preview: c?.last_message ?? null,
        unread: c?.unread_for_admin ?? 0,
        fromMe: !!c?.last_sender_id && c.last_sender_id !== lead.id,
        pinned: c?.pinned ?? false,
      }
    })

    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.lastAt && b.lastAt) return a.lastAt < b.lastAt ? 1 : -1
      if (a.lastAt) return -1
      if (b.lastAt) return 1
      return (a.name ?? '').localeCompare(b.name ?? '')
    })
    return list
  }, [convsQ.data, leadsQ.data])

  return { items, isLoading: convsQ.isLoading || leadsQ.isLoading }
}

/** id диалога лида (создаётся при открытии). */
export function useEnsureConversation(leadId: string | null) {
  return useQuery({
    queryKey: ['chat', 'ensure', leadId],
    queryFn: () => ensureConversation(leadId as string),
    enabled: !!leadId,
    staleTime: Infinity,
  })
}

/** Строка диалога (метки прочтения — для галочек статуса). */
export function useConversationDetail(conversationId: string | null) {
  return useQuery({
    queryKey: ['chat', 'detail', conversationId],
    queryFn: () => getConversation(conversationId as string),
    enabled: !!conversationId,
  })
}

/** Сообщения диалога. */
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => listMessages(conversationId as string),
    enabled: !!conversationId,
  })
}

/** Отправка сообщения с оптимистичным добавлением и статусом (sending/error). */
export function useSendMessage(conversationId: string) {
  const qc = useQueryClient()
  const { profile } = useAuth()
  const key = ['chat', 'messages', conversationId]

  return useMutation({
    mutationFn: ({ body }: { body: string; tempId: string }) =>
      sendMessage(conversationId, profile?.id as string, body),
    onMutate: async ({ body, tempId }) => {
      await qc.cancelQueries({ queryKey: key })
      const optimistic: UiMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: profile?.id ?? null,
        body,
        kind: 'text',
        reply_to_id: null,
        edited_at: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        _status: 'sending',
      }
      qc.setQueryData<UiMessage[]>(key, (old) => [...(old ?? []), optimistic])
    },
    onError: (_e, { tempId }) => {
      qc.setQueryData<UiMessage[]>(key, (old) =>
        (old ?? []).map((m) => (m.id === tempId ? { ...m, _status: 'error' } : m)),
      )
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      void qc.invalidateQueries({ queryKey: ['chat', 'detail', conversationId] })
    },
  })
}

/** Убрать ошибочное сообщение из кэша (перед повторной отправкой). */
export function useDropMessage(conversationId: string) {
  const qc = useQueryClient()
  return (id: string) =>
    qc.setQueryData<UiMessage[]>(['chat', 'messages', conversationId], (old) =>
      (old ?? []).filter((m) => m.id !== id),
    )
}

/** Отметить диалог прочитанным. */
export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => markRead(conversationId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
  })
}

/**
 * Realtime: любые изменения chat_messages/chat_conversations обновляют списки и
 * открытую ленту. RLS фильтрует, что клиент реально получает (лид — только своё).
 */
export function useChatRealtime(enabled: boolean): void {
  const qc = useQueryClient()
  useEffect(() => {
    if (!enabled) return
    const ch = supabase
      .channel('chat_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        void qc.invalidateQueries({ queryKey: ['chat', 'messages'] })
        void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
        void qc.invalidateQueries({ queryKey: ['chat', 'detail'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
        void qc.invalidateQueries({ queryKey: ['chat', 'detail'] })
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(ch)
    }
  }, [enabled, qc])
}
