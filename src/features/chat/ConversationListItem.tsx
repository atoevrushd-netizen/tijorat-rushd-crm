import { Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useT } from '@/i18n/useT'
import { shortWhen } from './chatFormat'
import type { ChatListItem } from './types'

const DOT: Record<string, string> = {
  active: 'bg-success',
  paused: 'bg-warn',
  archived: 'bg-ink-3',
}

/** Строка списка диалогов: аватар+статус, имя, превью, время, непрочитанные. */
export function ConversationListItem({
  item,
  active,
  onClick,
}: {
  item: ChatListItem
  active: boolean
  onClick: () => void
}) {
  const { t } = useT()
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
        active ? 'bg-accent-soft' : 'hover:bg-surface-2',
      )}
    >
      <div className="relative flex-none">
        <Avatar name={item.name} src={item.photo} size={46} />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface',
            DOT[item.status] ?? 'bg-ink-3',
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
            {item.name || '—'}
          </span>
          {item.pinned && <Pin size={13} className="flex-none text-ink-3" />}
          <span className="flex-none text-[11px] text-ink-3">{shortWhen(item.lastAt)}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-[12.5px]',
              item.unread > 0 ? 'font-medium text-ink-2' : 'text-ink-3',
            )}
          >
            {item.preview
              ? (item.fromMe ? `${t('chat.youPrefix')} ` : '') + item.preview
              : t('chat.noMessages')}
          </span>
          {item.unread > 0 && (
            <span className="flex-none rounded-full bg-accent px-[7px] py-px text-[11px] font-bold text-on-accent">
              {item.unread > 99 ? '99+' : item.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
