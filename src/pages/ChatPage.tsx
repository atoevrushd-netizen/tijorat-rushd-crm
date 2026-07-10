import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessagesSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/features/auth/useAuth'
import { canManage } from '@/features/auth/roles'
import { useT } from '@/i18n/useT'
import { ConversationList } from '@/features/chat/ConversationList'
import { ChatThreadPane } from '@/features/chat/ChatThreadPane'
import { ChatInfoPanel } from '@/features/chat/ChatInfoPanel'
import { useChatList, useChatRealtime } from '@/features/chat/useChat'

/** Раздел «Чат»: админ — список+диалог; резидент — свой диалог с админами. */
export function ChatPage() {
  const { profile, role } = useAuth()
  const isAdmin = canManage(role)

  useChatRealtime(!!profile?.id)

  if (!profile) return null
  if (!isAdmin) return <LeadChat />

  return <AdminChat />
}

/** Резидент: единственный диалог с администраторами. */
function LeadChat() {
  const { t } = useT()
  const { profile } = useAuth()
  if (!profile) return null
  return (
    <AppShell title={t('page.chat')}>
      <div className="h-[calc(100dvh-14rem)] overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1 md:h-[calc(100dvh-9.5rem)]">
        <ChatThreadPane
          leadId={profile.id}
          name={profile.full_name}
          photo={profile.photo_url}
          phone={profile.phone}
          status={profile.status}
          isAdmin={false}
        />
      </div>
    </AppShell>
  )
}

/** Админ/разработчик: список резидентов + выбранный диалог. */
function AdminChat() {
  const { t } = useT()
  const { items } = useChatList()
  const [params, setParams] = useSearchParams()
  const leadParam = params.get('lead')
  const [selected, setSelected] = useState<string | null>(leadParam)
  const [showInfo, setShowInfo] = useState(false)
  // Инфопанель — колонкой только когда хватает ширины (иначе сжала бы переписку),
  // иначе выезжающим оверлеем. Рендерим ОДИН экземпляр (одно состояние заметки).
  const wideEnough = useMediaQuery('(min-width: 1400px)')

  // Открытие конкретного диалога по ?lead=<id> (например, из карточки резидента).
  useEffect(() => {
    if (leadParam) setSelected(leadParam)
  }, [leadParam])

  function select(leadId: string) {
    setSelected(leadId)
    setShowInfo(false)
    setParams((p) => {
      p.set('lead', leadId)
      return p
    })
  }
  function back() {
    setSelected(null)
    setShowInfo(false)
    setParams((p) => {
      p.delete('lead')
      return p
    })
  }

  const item = items.find((i) => i.leadId === selected) ?? null

  return (
    <AppShell title={t('page.chat')}>
      <div className="flex h-[calc(100dvh-14rem)] overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1 md:h-[calc(100dvh-9.5rem)]">
        {/* Список: на мобильном скрыт, когда открыт диалог */}
        <div
          className={cn(
            'w-full flex-col border-r border-line md:flex md:w-[340px] md:flex-none',
            selected ? 'hidden md:flex' : 'flex',
          )}
        >
          <ConversationList selectedLeadId={selected} onSelect={select} />
        </div>

        {/* Диалог: на мобильном показан, когда выбран */}
        <div className={cn('min-w-0 flex-1', selected ? 'flex' : 'hidden md:flex')}>
          {item ? (
            <ChatThreadPane
              leadId={item.leadId}
              name={item.name}
              photo={item.photo}
              phone={item.phone}
              status={item.status}
              isAdmin
              onBack={back}
              onToggleInfo={() => setShowInfo((v) => !v)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-accent-soft text-accent">
                <MessagesSquare size={28} />
              </span>
              <p className="text-[15px] font-bold text-ink">{t('chat.noneSelected')}</p>
              <p className="max-w-xs text-[13px] text-ink-3">{t('chat.noneSelectedHint')}</p>
            </div>
          )}
        </div>

        {/* Инфопанель как колонка — только на очень широком экране (есть место) */}
        {wideEnough && showInfo && item && (
          <div className="w-[320px] flex-none border-l border-line">
            <ChatInfoPanel leadId={item.leadId} onClose={() => setShowInfo(false)} />
          </div>
        )}
      </div>

      {/* Иначе — выезжающий оверлей справа (единственный экземпляр панели) */}
      {!wideEnough && showInfo && item && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 animate-fade-in bg-black/30" onClick={() => setShowInfo(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-[360px] animate-sheet-right border-l border-line bg-surface shadow-sh2">
            <ChatInfoPanel leadId={item.leadId} onClose={() => setShowInfo(false)} />
          </div>
        </div>
      )}
    </AppShell>
  )
}
