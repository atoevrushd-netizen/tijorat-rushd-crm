import { useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import {
  deleteMessage,
  editMessage,
  ensureConversation,
  forwardMessage,
  getConversation,
  listConversations,
  listLeads,
  listMessages,
  audienceCount,
  getSignedUrl,
  listBroadcasts,
  markRead,
  markUnread,
  pinMessage,
  resendBroadcast,
  sendBroadcast,
  sendFileMessage,
  sendMessage,
  setLeadNote,
  setLeadStatus,
  updateConversation,
  type ConversationPatch,
  type UploadedFile,
} from './api'
import type { Audience } from './types'
import type { Profile, UserStatus } from '@/types'
import type { ChatListItem, ChatMessage, ConversationRow, FileMeta, UiMessage } from './types'

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
        archived: c?.archived ?? false,
        muted: c?.muted ?? false,
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
    mutationFn: ({ body, replyToId }: { body: string; tempId: string; replyToId?: string | null }) =>
      sendMessage(conversationId, profile?.id as string, body, replyToId),
    onMutate: async ({ body, tempId, replyToId }) => {
      await qc.cancelQueries({ queryKey: key })
      const optimistic: UiMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: profile?.id ?? null,
        body,
        kind: 'text',
        reply_to_id: replyToId ?? null,
        edited_at: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        attachment_path: null,
        attachment_name: null,
        attachment_size: null,
        attachment_mime: null,
        attachment_meta: null,
        broadcast_id: null,
        pinned_at: null,
        pinned_by: null,
        forwarded_from_msg: null,
        forwarded_from_name: null,
        _status: 'sending',
      }
      qc.setQueryData<UiMessage[]>(key, (old) => [...(old ?? []), optimistic])
    },
    onError: (_e, { tempId }) => {
      qc.setQueryData<UiMessage[]>(key, (old) =>
        (old ?? []).map((m) => (m.id === tempId ? { ...m, _status: 'error' } : m)),
      )
    },
    // Заменяем временный пузырь реальной строкой НА МЕСТЕ (без полного рефетча —
    // иначе параллельные отправки/realtime могут «съесть» ещё не закоммиченные).
    onSuccess: (data, { tempId }) => {
      qc.setQueryData<UiMessage[]>(key, (old) => {
        const arr = old ?? []
        const idx = arr.findIndex((m) => m.id === tempId)
        if (idx >= 0) {
          const copy = arr.slice()
          copy[idx] = data
          return copy
        }
        if (arr.some((m) => m.id === data.id)) return arr
        return [...arr, data]
      })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      void qc.invalidateQueries({ queryKey: ['chat', 'detail', conversationId] })
    },
  })
}

/** Отправить сообщение-вложение (файл или голосовое) после успешной загрузки. */
export function useSendFileMessage(conversationId: string) {
  const qc = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: ({
      att,
      caption,
      kind,
      meta,
      replyToId,
    }: {
      att: UploadedFile
      caption?: string
      kind?: 'file' | 'voice'
      meta?: FileMeta
      replyToId?: string | null
    }) =>
      sendFileMessage(conversationId, profile?.id as string, att, { caption, kind, meta, replyToId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      void qc.invalidateQueries({ queryKey: ['chat', 'detail', conversationId] })
    },
  })
}

/** Подписанная ссылка на файл. TTL 6ч; пере-подписываем при возврате на вкладку/сети,
 *  чтобы долго открытый чат не «протух». downloadName → скачивание вместо inline. */
export function useSignedUrl(path: string | null, downloadName?: string) {
  return useQuery({
    queryKey: ['chat', 'file', path, downloadName ?? null],
    queryFn: () => getSignedUrl(path as string, downloadName),
    enabled: !!path,
    staleTime: 5 * 60 * 60_000,
    gcTime: 6 * 60 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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

/** Редактировать сообщение. */
export function useEditMessage(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => editMessage(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

/** Удалить сообщение (мягко). */
export function useDeleteMessage(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

/** Изменить флаги диалога (закрепить/архив/без звука) — только админ. */
export function useUpdateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ConversationPatch }) =>
      updateConversation(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
      void qc.invalidateQueries({ queryKey: ['chat', 'detail'] })
    },
  })
}

/** Отметить диалог непрочитанным (только админ). */
export function useMarkUnread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => markUnread(conversationId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
  })
}

/**
 * Сменить статус лида из чата. Статус меняем ОПТИМИСТИЧНО в кэше профиля
 * (без рефетча ['user', leadId]) — иначе рефетч сбросил бы недописанную заметку.
 * Списки чата обновляем (там показан статус-точка).
 */
export function useSetLeadStatus(leadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: UserStatus) => setLeadStatus(leadId, status),
    onMutate: (status: UserStatus) => {
      qc.setQueryData<Profile>(['user', leadId], (old) => (old ? { ...old, status } : old))
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'leads'] })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

/**
 * Сохранить внутреннюю заметку. Кэш профиля синхронизируем на месте
 * (setQueryData, без рефетча) — так `initial` заметки не расходится с БД и
 * позднейшие обновления не сбрасывают набранный текст.
 */
export function useSetLeadNote(leadId: string) {
  const qc = useQueryClient()
  return async (note: string) => {
    await setLeadNote(leadId, note)
    qc.setQueryData<Profile>(['user', leadId], (old) =>
      old ? { ...old, admin_comment: note.trim() || null } : old,
    )
  }
}

/** История рассылок со статистикой. */
export function useBroadcasts(enabled: boolean) {
  return useQuery({ queryKey: ['chat', 'broadcasts'], queryFn: listBroadcasts, enabled })
}

/**
 * Кол-во получателей аудитории (для предпросмотра). Для «выбранных» считаем на
 * клиенте (по размеру набора) — потому вызывающий отключает запрос через enabled,
 * чтобы не бить RPC на каждый клик по чекбоксу.
 */
export function useAudienceCount(audience: Audience, leadIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['chat', 'audience', audience, leadIds.slice().sort().join(',')],
    queryFn: () => audienceCount(audience, leadIds),
    enabled,
  })
}

/** Отправить рассылку. */
export function useSendBroadcast() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ audience, leadIds, body }: { audience: Audience; leadIds: string[]; body: string }) =>
      sendBroadcast(audience, leadIds, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'broadcasts'] })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

/** Повторить недоставленным. */
export function useResendBroadcast() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resendBroadcast(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', 'broadcasts'] })
      void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

/** Закрепить/открепить сообщение (обновляет ленту диалога). */
export function usePinMessage(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: boolean }) => pinMessage(id, pin),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] }),
  })
}

/** Переслать сообщение резидентам (копии в их диалоги). */
export function useForwardMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ source, leadIds }: { source: ChatMessage; leadIds: string[] }) =>
      forwardMessage(source, leadIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
  })
}

/**
 * Realtime: изменения chat_messages/chat_conversations обновляют списки и ленту.
 * RLS фильтрует, что клиент реально получает (лид — только своё). Рассылка
 * вставляет N сообщений одной транзакцией → ~2N событий, поэтому:
 *  - ленту сообщений инвалидируем ТОЧЕЧНО по затронутому диалогу (открытая лента
 *    не рефетчится зря — соседние диалоги неактивны и просто помечаются stale);
 *  - списки (conversations/detail) коалесцируем — один рефреш на всплеск.
 */
export function useChatRealtime(enabled: boolean): void {
  const qc = useQueryClient()
  useEffect(() => {
    if (!enabled) return
    let listTimer: ReturnType<typeof setTimeout> | null = null
    const bumpLists = () => {
      if (listTimer) return
      listTimer = setTimeout(() => {
        listTimer = null
        void qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
        void qc.invalidateQueries({ queryKey: ['chat', 'detail'] })
      }, 250)
    }
    const ch = supabase
      .channel('chat_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, (payload) => {
        const cid = (payload.new as { conversation_id?: string } | null)?.conversation_id
        if (cid) void qc.invalidateQueries({ queryKey: ['chat', 'messages', cid] })
        bumpLists()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        bumpLists()
      })
      .subscribe()
    return () => {
      if (listTimer) clearTimeout(listTimer)
      void supabase.removeChannel(ch)
    }
  }, [enabled, qc])
}
