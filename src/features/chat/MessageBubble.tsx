import { useState } from 'react'
import { Check, CheckCheck, Clock3, Copy, Megaphone, MoreVertical, Pencil, Reply, RotateCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { Attachment } from './Attachment'
import { VoicePlayer } from './VoicePlayer'
import { timeHM } from './chatFormat'
import type { ChatMessage, UiMessage } from './types'

/** Один пузырь сообщения: цитата ответа, текст, время+статус, меню действий. */
export function MessageBubble({
  message,
  mine,
  isAdmin,
  read,
  repliedTo,
  onRetry,
  onReply,
  onEdit,
  onDelete,
}: {
  message: UiMessage
  mine: boolean
  isAdmin: boolean
  read: boolean
  repliedTo: ChatMessage | null
  onRetry?: () => void
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useT()
  const [menu, setMenu] = useState(false)
  const status = message._status
  const deleted = !!message.deleted_at

  function copy() {
    if (message.body) {
      void navigator.clipboard?.writeText(message.body)
      toast.success(t('chat.copied'))
    }
    setMenu(false)
  }

  if (deleted) {
    return (
      <div className={cn('flex w-full', mine ? 'justify-end' : 'justify-start')}>
        <div className="max-w-[78%] rounded-[16px] border border-dashed border-line bg-surface px-3.5 py-2 text-[13px] italic text-ink-3 sm:max-w-[68%]">
          {t('chat.messageDeleted')}
        </div>
      </div>
    )
  }

  const canEdit = mine && !status
  const canDelete = (mine || isAdmin) && !status

  return (
    <div className={cn('group flex w-full items-end gap-1', mine ? 'justify-end' : 'justify-start')}>
      {/* Кнопка меню слева от своих пузырей */}
      {mine && !status && (
        <MenuButton open={menu} setOpen={setMenu} align="right">
          <MenuItems
            t={t}
            onReply={() => { onReply(); setMenu(false) }}
            onCopy={message.body ? copy : undefined}
            onEdit={canEdit ? () => { onEdit(); setMenu(false) } : undefined}
            onDelete={canDelete ? () => { onDelete(); setMenu(false) } : undefined}
          />
        </MenuButton>
      )}

      <div
        className={cn(
          'relative max-w-[78%] animate-rise rounded-[18px] px-3.5 py-2 shadow-sh1 sm:max-w-[68%]',
          mine ? 'rounded-br-[6px] bg-accent-grad text-on-accent' : 'rounded-bl-[6px] bg-surface text-ink',
        )}
      >
        {repliedTo && (
          <div
            className={cn(
              'mb-1 border-l-2 pl-2 text-[12px]',
              mine ? 'border-white/70 text-white/80' : 'border-accent text-ink-2',
            )}
          >
            <span className="line-clamp-2 break-words">
              {repliedTo.deleted_at ? t('chat.messageDeleted') : repliedTo.body}
            </span>
          </div>
        )}

        {/* Метку «Рассылка» видит только админ — резиденту незачем знать, что
            сообщение массовое (для него это обычное личное сообщение). */}
        {message.broadcast_id && isAdmin && (
          <div
            className={cn(
              'mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide',
              mine ? 'text-white/80' : 'text-accent',
            )}
          >
            <Megaphone size={11} /> {t('bc.badge')}
          </div>
        )}

        {message.attachment_path && (
          <div className={cn(message.body ? 'mb-1.5' : '')}>
            {message.kind === 'voice' ? (
              <VoicePlayer message={message} mine={mine} />
            ) : (
              <Attachment message={message} mine={mine} />
            )}
          </div>
        )}

        {message.body && (
          <div className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed">
            {message.body}
          </div>
        )}
        <div
          className={cn(
            'mt-0.5 flex items-center justify-end gap-1 text-[10.5px]',
            mine ? 'text-white/75' : 'text-ink-3',
          )}
        >
          {message.edited_at && <span>{t('chat.edited')}</span>}
          <span>{timeHM(message.created_at)}</span>
          {mine && status === 'sending' && <Clock3 size={13} />}
          {mine && status === 'error' && (
            <button type="button" onClick={onRetry} className="flex items-center gap-0.5 font-semibold text-white" aria-label={t('chat.retry')}>
              <RotateCw size={12} /> {t('chat.retry')}
            </button>
          )}
          {mine && !status && (read ? <CheckCheck size={14} /> : <Check size={13} />)}
        </div>
      </div>

      {/* Кнопка меню справа от чужих пузырей */}
      {!mine && (
        <MenuButton open={menu} setOpen={setMenu} align="left">
          <MenuItems
            t={t}
            onReply={() => { onReply(); setMenu(false) }}
            onCopy={message.body ? copy : undefined}
            onEdit={undefined}
            onDelete={isAdmin ? () => { onDelete(); setMenu(false) } : undefined}
          />
        </MenuButton>
      )}
    </div>
  )
}

function MenuButton({
  open,
  setOpen,
  align,
  children,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  align: 'left' | 'right'
  children: React.ReactNode
}) {
  return (
    <div className="relative self-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="⋯"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full text-ink-3 transition-opacity hover:bg-surface-2 hover:text-ink',
          open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute bottom-8 z-40 w-40 overflow-hidden rounded-[13px] border border-line bg-elevated py-1 shadow-sh2',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  )
}

function MenuItems({
  t,
  onReply,
  onCopy,
  onEdit,
  onDelete,
}: {
  t: (k: string) => string
  onReply: () => void
  onCopy?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  const cls = 'flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-ink transition-colors hover:bg-surface-2'
  return (
    <>
      <button type="button" onClick={onReply} className={cls}>
        <Reply size={15} /> {t('chat.reply')}
      </button>
      {onCopy && (
        <button type="button" onClick={onCopy} className={cls}>
          <Copy size={15} /> {t('chat.copy')}
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} className={cls}>
          <Pencil size={15} /> {t('chat.edit')}
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className={cn(cls, 'text-danger hover:bg-danger-soft')}>
          <Trash2 size={15} /> {t('chat.delete')}
        </button>
      )}
    </>
  )
}
