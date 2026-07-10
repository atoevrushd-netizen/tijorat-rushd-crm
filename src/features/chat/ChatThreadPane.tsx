import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { useT } from '@/i18n/useT'
import type { UserStatus } from '@/types'
import { MessageThread } from './MessageThread'
import { Composer } from './Composer'
import { useEnsureConversation } from './useChat'

const DOT: Record<string, string> = {
  active: 'bg-success',
  paused: 'bg-warn',
  archived: 'bg-ink-3',
}

/** Центральная колонка: шапка диалога + лента + ввод. Диалог создаётся при открытии. */
export function ChatThreadPane({
  leadId,
  name,
  photo,
  phone,
  status,
  isAdmin,
  onBack,
}: {
  leadId: string
  name: string | null
  photo: string | null
  phone: string | null
  status: UserStatus
  isAdmin: boolean
  onBack?: () => void
}) {
  const { t } = useT()
  const { data: conversationId, isLoading, isError } = useEnsureConversation(leadId)

  return (
    <div className="flex h-full min-w-0 flex-col bg-bg-grad">
      {/* Шапка */}
      <div className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2.5 sm:px-4">
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
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface',
              DOT[status] ?? 'bg-ink-3',
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-ink">{name || '—'}</div>
          <div className="truncate text-[12px] text-ink-3">
            {t(`userStatus.${status}`, status)}
            {phone ? ` · ${phone}` : ''}
          </div>
        </div>
        {isAdmin && (
          <Link
            to={`/admin/users/${leadId}`}
            aria-label={t('chat.openCard')}
            title={t('chat.openCard')}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-accent"
          >
            <ExternalLink size={18} />
          </Link>
        )}
      </div>

      {/* Лента + ввод */}
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
          <MessageThread conversationId={conversationId} />
          <Composer conversationId={conversationId} />
        </>
      )}
    </div>
  )
}
