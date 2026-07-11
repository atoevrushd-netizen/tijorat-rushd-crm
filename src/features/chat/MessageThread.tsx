import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { confirm } from '@/lib/confirm'
import { toast } from '@/lib/toast'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { Spinner } from '@/components/ui/Spinner'
import { MessageBubble } from './MessageBubble'
import { PinnedBar } from './PinnedBar'
import { ForwardModal } from './ForwardModal'
import { dayKey } from './chatFormat'
import {
  useConversationDetail,
  useDeleteMessage,
  useDropMessage,
  useMarkRead,
  useMessages,
  usePinMessage,
  useSendMessage,
} from './useChat'
import type { ChatMessage, UiMessage } from './types'

function sepLabel(iso: string, t: (k: string) => string): string {
  const today = dayKey(new Date().toISOString())
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const key = dayKey(iso)
  if (key === today) return t('chat.today')
  if (key === dayKey(y.toISOString())) return t('chat.yesterday')
  return formatDate(iso)
}

/** Лента сообщений: разделители по датам, автоскролл, галочки, действия, цитаты. */
export function MessageThread({
  conversationId,
  isAdmin,
  onReply,
  onStartEdit,
}: {
  conversationId: string
  isAdmin: boolean
  onReply: (m: ChatMessage) => void
  onStartEdit: (m: ChatMessage) => void
}) {
  const { t } = useT()
  const { profile } = useAuth()
  const uid = profile?.id
  const { data: messages, isLoading } = useMessages(conversationId)
  const { data: conv } = useConversationDetail(conversationId)
  const markRead = useMarkRead()
  const send = useSendMessage(conversationId)
  const del = useDeleteMessage(conversationId)
  const drop = useDropMessage(conversationId)
  const pin = usePinMessage(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [forwardMsg, setForwardMsg] = useState<ChatMessage | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const list = useMemo(() => (messages ?? []) as UiMessage[], [messages])
  const lastId = list.length ? list[list.length - 1].id : null

  // Закреплённые (не удалённые) — новые сверху; для баннера над лентой.
  const pinned = useMemo(
    () => list.filter((m) => m.pinned_at && !m.deleted_at).sort((a, b) => (a.pinned_at! < b.pinned_at! ? 1 : -1)),
    [list],
  )

  const byId = useMemo(() => {
    const m = new Map<string, ChatMessage>()
    for (const x of messages ?? []) m.set(x.id, x)
    return m
  }, [messages])

  // Смена диалога — всегда вниз. Новое сообщение — вниз только если читатель у края
  // (не выдёргиваем его, когда он листает историю).
  useEffect(() => {
    atBottomRef.current = true
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [conversationId])
  useEffect(() => {
    if (atBottomRef.current) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lastId])

  function onScroll() {
    const el = scrollRef.current
    if (el) atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90
  }

  useEffect(() => {
    if (conversationId) markRead.mutate(conversationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastId])

  // Смена диалога — закрыть пересылку и снять подсветку.
  useEffect(() => {
    setForwardMsg(null)
    setHighlightId(null)
  }, [conversationId])
  useEffect(() => () => { if (highlightTimer.current) clearTimeout(highlightTimer.current) }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-accent-soft text-accent">
          <MessagesSquare size={24} />
        </span>
        <p className="text-[14px] font-semibold text-ink">{t('chat.emptyDialog')}</p>
        <p className="text-[12.5px] text-ink-3">{t('chat.emptyDialogHint')}</p>
      </div>
    )
  }

  const amLead = uid === conv?.lead_id
  const otherReadAt = amLead ? conv?.admin_last_read_at : conv?.lead_last_read_at

  function retry(m: UiMessage) {
    drop(m.id)
    if (m.body) send.mutate({ body: m.body, tempId: crypto.randomUUID(), replyToId: m.reply_to_id })
  }
  async function remove(m: UiMessage) {
    if (await confirm({ message: t('chat.deleteConfirm'), danger: true, confirmLabel: t('chat.delete') })) {
      del.mutate(m.id, { onSuccess: () => toast.success(t('common.deleted')) })
    }
  }
  function jump(id: string) {
    setHighlightId(id)
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (highlightTimer.current) clearTimeout(highlightTimer.current)
    highlightTimer.current = setTimeout(() => setHighlightId(null), 1800)
  }
  function togglePin(m: UiMessage) {
    const willPin = !m.pinned_at
    pin.mutate(
      { id: m.id, pin: willPin },
      { onSuccess: () => toast.success(t(willPin ? 'chat.messagePinned' : 'chat.messageUnpinned')) },
    )
  }

  let prevDay = ''
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {pinned.length > 0 && (
        <PinnedBar key={conversationId} pinned={pinned} isAdmin={isAdmin} onJump={jump} onUnpin={(id) => pin.mutate({ id, pin: false }, { onSuccess: () => toast.success(t('chat.messageUnpinned')) })} />
      )}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4 sm:px-6"
      >
        {list.map((m) => {
          const key = dayKey(m.created_at)
          const showSep = key !== prevDay
          prevDay = key
          const mine = m.sender_id === uid
          const read = !!otherReadAt && !!m.created_at && otherReadAt >= m.created_at
          return (
            <Fragment key={m.id}>
              {showSep && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold text-ink-3">
                    {sepLabel(m.created_at, t)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={m}
                mine={mine}
                isAdmin={isAdmin}
                read={read}
                domId={`msg-${m.id}`}
                highlighted={highlightId === m.id}
                repliedTo={m.reply_to_id ? byId.get(m.reply_to_id) ?? null : null}
                onRetry={() => retry(m)}
                onReply={() => onReply(m)}
                onEdit={() => onStartEdit(m)}
                onDelete={() => void remove(m)}
                onForward={isAdmin && !m._status ? () => setForwardMsg(m) : undefined}
                onPin={isAdmin && !m._status ? () => togglePin(m) : undefined}
              />
            </Fragment>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <ForwardModal message={forwardMsg} sourceLeadId={conv?.lead_id ?? null} onClose={() => setForwardMsg(null)} />
    </div>
  )
}
