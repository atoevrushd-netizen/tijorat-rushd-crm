import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  BellOff,
  BellRing,
  ExternalLink,
  Info,
  MailOpen,
  MoreVertical,
  Pin,
  PinOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { useT } from '@/i18n/useT'
import type { UserStatus } from '@/types'
import { MessageThread } from './MessageThread'
import { Composer } from './Composer'
import {
  useConversationDetail,
  useEnsureConversation,
  useMarkUnread,
  useUpdateConversation,
} from './useChat'
import type { ChatMessage } from './types'

const DOT: Record<string, string> = {
  active: 'bg-success',
  paused: 'bg-warn',
  archived: 'bg-ink-3',
}

/** Центральная колонка: шапка (+меню диалога у админа), лента, ввод (ответ/правка). */
export function ChatThreadPane({
  leadId,
  name,
  photo,
  phone,
  status,
  isAdmin,
  onBack,
  onToggleInfo,
}: {
  leadId: string
  name: string | null
  photo: string | null
  phone: string | null
  status: UserStatus
  isAdmin: boolean
  onBack?: () => void
  onToggleInfo?: () => void
}) {
  const { t } = useT()
  const { data: conversationId, isLoading, isError } = useEnsureConversation(leadId)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [editing, setEditing] = useState<ChatMessage | null>(null)

  // Смена диалога — сбросить режимы ответа/правки.
  useEffect(() => {
    setReplyTo(null)
    setEditing(null)
  }, [leadId])

  return (
    <div className="flex h-full min-w-0 flex-col bg-bg-grad">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-3 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('chat.back')}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
          >
            <ArrowLeft size={19} />
          </button>
        )}
        <div className="relative flex-none">
          <Avatar name={name} src={photo} size={42} />
          <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface', DOT[status] ?? 'bg-ink-3')} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-ink">{name || '—'}</div>
          <div className="truncate text-[12px] text-ink-3">
            {t(`userStatus.${status}`, status)}
            {phone ? ` · ${phone}` : ''}
          </div>
        </div>
        {isAdmin && onToggleInfo && (
          <button
            type="button"
            onClick={onToggleInfo}
            aria-label={t('chat.info')}
            title={t('chat.info')}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-accent"
          >
            <Info size={19} />
          </button>
        )}
        {isAdmin && (
          <Link
            to={`/admin/users/${leadId}`}
            aria-label={t('chat.openCard')}
            title={t('chat.openCard')}
            className="hidden h-9 w-9 flex-none items-center justify-center rounded-[11px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-accent sm:flex"
          >
            <ExternalLink size={18} />
          </Link>
        )}
        {isAdmin && conversationId && <ConversationMenu conversationId={conversationId} />}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : isError || !conversationId ? (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-danger">
          {t('chat.loadError')}
        </div>
      ) : (
        <>
          <MessageThread
            conversationId={conversationId}
            isAdmin={isAdmin}
            onReply={(m) => {
              setEditing(null)
              setReplyTo(m)
            }}
            onStartEdit={(m) => {
              setReplyTo(null)
              setEditing(m)
            }}
          />
          <Composer
            key={conversationId}
            conversationId={conversationId}
            replyTo={replyTo}
            editing={editing}
            onClear={() => {
              setReplyTo(null)
              setEditing(null)
            }}
          />
        </>
      )}
    </div>
  )
}

/** Меню действий над диалогом (админ): закрепить/архив/без звука/непрочитано. */
function ConversationMenu({ conversationId }: { conversationId: string }) {
  const { t } = useT()
  const { data: conv } = useConversationDetail(conversationId)
  const update = useUpdateConversation()
  const unread = useMarkUnread()
  const [open, setOpen] = useState(false)

  function patch(p: { pinned?: boolean; archived?: boolean; muted?: boolean }, msg: string) {
    update.mutate({ id: conversationId, patch: p }, { onSuccess: () => toast.success(msg) })
    setOpen(false)
  }

  const cls = 'flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-ink transition-colors hover:bg-surface-2'
  return (
    <div className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t('chat.actions')}
        className="flex h-9 w-9 items-center justify-center rounded-[11px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-[13px] border border-line bg-elevated py-1 shadow-sh2">
            <button type="button" className={cls} onClick={() => patch({ pinned: !conv?.pinned }, t(conv?.pinned ? 'chat.unpinned' : 'chat.pinned_'))}>
              {conv?.pinned ? <PinOff size={15} /> : <Pin size={15} />}
              {conv?.pinned ? t('chat.unpin') : t('chat.pin')}
            </button>
            <button type="button" className={cls} onClick={() => patch({ muted: !conv?.muted }, t(conv?.muted ? 'chat.unmuted' : 'chat.muted'))}>
              {conv?.muted ? <BellRing size={15} /> : <BellOff size={15} />}
              {conv?.muted ? t('chat.unmute') : t('chat.mute')}
            </button>
            <button
              type="button"
              className={cls}
              onClick={() => {
                unread.mutate(conversationId, { onSuccess: () => toast.success(t('chat.markedUnread')) })
                setOpen(false)
              }}
            >
              <MailOpen size={15} /> {t('chat.markUnread')}
            </button>
            <button type="button" className={cls} onClick={() => patch({ archived: !conv?.archived }, t(conv?.archived ? 'chat.unarchived' : 'chat.archived_'))}>
              {conv?.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              {conv?.archived ? t('chat.unarchive') : t('chat.archive')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
