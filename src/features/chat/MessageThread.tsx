import { Fragment, useEffect, useRef } from 'react'
import { MessagesSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { Spinner } from '@/components/ui/Spinner'
import { MessageBubble } from './MessageBubble'
import { dayKey } from './chatFormat'
import { useConversationDetail, useDropMessage, useMarkRead, useMessages, useSendMessage } from './useChat'
import type { UiMessage } from './types'

function sepLabel(iso: string, t: (k: string) => string): string {
  const today = dayKey(new Date().toISOString())
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const key = dayKey(iso)
  if (key === today) return t('chat.today')
  if (key === dayKey(y.toISOString())) return t('chat.yesterday')
  return formatDate(iso)
}

/** Лента сообщений диалога: разделители по датам, автоскролл, галочки статуса. */
export function MessageThread({ conversationId }: { conversationId: string }) {
  const { t } = useT()
  const { profile } = useAuth()
  const uid = profile?.id
  const { data: messages, isLoading } = useMessages(conversationId)
  const { data: conv } = useConversationDetail(conversationId)
  const markRead = useMarkRead()
  const send = useSendMessage(conversationId)
  const drop = useDropMessage(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const lastId = messages && messages.length ? messages[messages.length - 1].id : null

  // Автоскролл вниз при новых сообщениях.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lastId, conversationId])

  // Отметить прочитанным при открытии и при новых сообщениях.
  useEffect(() => {
    if (conversationId) markRead.mutate(conversationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastId])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const list = (messages ?? []) as UiMessage[]
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

  // Кто «другая сторона» и когда прочитал — для галочек «прочитано».
  const amLead = uid === conv?.lead_id
  const otherReadAt = amLead ? conv?.admin_last_read_at : conv?.lead_last_read_at

  let prevDay = ''
  function retry(m: UiMessage) {
    drop(m.id)
    if (m.body) send.mutate({ body: m.body, tempId: crypto.randomUUID() })
  }

  return (
    <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-6">
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
            <MessageBubble message={m} mine={mine} read={read} onRetry={() => retry(m)} />
          </Fragment>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
