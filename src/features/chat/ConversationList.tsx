import { useMemo, useState } from 'react'
import { Megaphone, Search, MessageSquareOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { Spinner } from '@/components/ui/Spinner'
import { ConversationListItem } from './ConversationListItem'
import { BroadcastModal } from './BroadcastModal'
import { useChatList } from './useChat'

type Filter = 'all' | 'unread' | 'pinned' | 'active' | 'inactive' | 'archived'

/** Левая колонка: поиск, быстрые фильтры, список диалогов резидентов. */
export function ConversationList({
  selectedLeadId,
  onSelect,
}: {
  selectedLeadId: string | null
  onSelect: (leadId: string) => void
}) {
  const { t } = useT()
  const { items, isLoading } = useChatList()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [bcOpen, setBcOpen] = useState(false)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((it) => {
      // Архив показываем только в его фильтре, иначе прячем.
      if (filter === 'archived') {
        if (!it.archived) return false
      } else if (it.archived) return false
      if (filter === 'unread' && it.unread === 0) return false
      if (filter === 'pinned' && !it.pinned) return false
      if (filter === 'active' && it.status !== 'active') return false
      if (filter === 'inactive' && it.status === 'active') return false
      if (!needle) return true
      return (
        (it.name ?? '').toLowerCase().includes(needle) ||
        (it.phone ?? '').toLowerCase().includes(needle) ||
        (it.preview ?? '').toLowerCase().includes(needle)
      )
    })
  }, [items, q, filter])

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('chat.filterAll') },
    { key: 'unread', label: t('chat.filterUnread') },
    { key: 'pinned', label: t('chat.filterPinned') },
    { key: 'active', label: t('chat.filterActive') },
    { key: 'inactive', label: t('chat.filterInactive') },
    { key: 'archived', label: t('chat.filterArchived') },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('chat.searchPlaceholder')}
              className="w-full rounded-[13px] bg-surface-2 py-2.5 pl-9 pr-3 text-[13.5px] text-ink outline-none transition placeholder:text-ink-3 focus:ring-2 focus:ring-accent-ring"
            />
          </div>
          <button
            type="button"
            onClick={() => setBcOpen(true)}
            aria-label={t('bc.title')}
            title={t('bc.title')}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[13px] bg-accent-grad text-on-accent shadow-glow transition-all duration-150 ease-ios hover:brightness-[1.06] active:scale-90"
          >
            <Megaphone size={18} />
          </button>
        </div>
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'flex-none rounded-full px-3 py-1 text-[12px] font-semibold transition-colors',
                filter === f.key
                  ? 'bg-accent-grad text-on-accent shadow-glow'
                  : 'bg-surface-2 text-ink-2 hover:text-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-ink-3">
            <MessageSquareOff size={22} />
            <p className="text-[13px]">{q ? t('chat.nothingFound') : t('chat.noLeads')}</p>
          </div>
        ) : (
          filtered.map((it) => (
            <ConversationListItem
              key={it.leadId}
              item={it}
              active={it.leadId === selectedLeadId}
              onClick={() => onSelect(it.leadId)}
            />
          ))
        )}
      </div>

      <BroadcastModal open={bcOpen} onClose={() => setBcOpen(false)} />
    </div>
  )
}
