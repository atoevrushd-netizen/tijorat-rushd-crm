import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, type NavigateFunction } from 'react-router-dom'
import { ArrowLeft, MessagesSquare } from 'lucide-react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/features/auth/useAuth'
import { canManage } from '@/features/auth/roles'
import { useT } from '@/i18n/useT'
import { ConversationList } from '@/features/chat/ConversationList'
import { ChatThreadPane } from '@/features/chat/ChatThreadPane'
import { ChatInfoPanel } from '@/features/chat/ChatInfoPanel'
import { useChatList, useChatRealtime } from '@/features/chat/useChat'

/** Выйти из чата: назад по истории, а если чат открыт первым (deep-link/refresh)
 *  — на главную (иначе на телефоне без нижнего меню выйти было бы некуда). */
function exitChat(navigate: NavigateFunction) {
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
  if (idx > 0) navigate(-1)
  else navigate('/')
}

/** Раздел «Чат». На телефоне — отдельное полноэкранное окно (без нижнего меню
 *  и общей шапки, только кнопка «назад»); на ПК/планшете — внутри каркаса. */
export function ChatPage() {
  const { profile, role } = useAuth()
  const isAdmin = canManage(role)
  const desktop = useMediaQuery('(min-width: 768px)')
  useChatRealtime(!!profile?.id)
  if (!profile) return null
  return isAdmin ? <AdminChat desktop={desktop} /> : <LeadChat desktop={desktop} />
}

/** Резидент: один диалог с администраторами. */
function LeadChat({ desktop }: { desktop: boolean }) {
  const { t } = useT()
  const { profile } = useAuth()
  const navigate = useNavigate()
  if (!profile) return null

  const pane = (
    <ChatThreadPane
      leadId={profile.id}
      name={t('chat.supportTitle')}
      photo={null}
      phone={null}
      status={profile.status}
      isAdmin={false}
      onBack={!desktop ? () => exitChat(navigate) : undefined}
    />
  )

  if (!desktop) return <div className="flex h-[100dvh] flex-col bg-surface">{pane}</div>

  return (
    <AppShell title={t('page.chat')}>
      <div className="h-[calc(100dvh-14rem)] overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1 md:h-[calc(100dvh-9.5rem)]">
        {pane}
      </div>
    </AppShell>
  )
}

/** Админ/разработчик: список резидентов + выбранный диалог. */
function AdminChat({ desktop }: { desktop: boolean }) {
  const { t } = useT()
  const { items } = useChatList()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const leadParam = params.get('lead')
  const [selected, setSelected] = useState<string | null>(leadParam)
  const [showInfo, setShowInfo] = useState(false)
  const wideEnough = useMediaQuery('(min-width: 1400px)')

  useEffect(() => {
    if (leadParam) setSelected(leadParam)
  }, [leadParam])

  // Переключение список⇄диалог — это состояние UI, а не навигация: обновляем URL
  // через replace, чтобы не плодить записи в истории. Тогда кнопка «назад» на
  // списке выходит из чата (в кабинет), а не возвращает в предыдущий диалог.
  function select(leadId: string) {
    setSelected(leadId)
    setShowInfo(false)
    setParams(
      (p) => {
        p.set('lead', leadId)
        return p
      },
      { replace: true },
    )
  }
  function back() {
    setSelected(null)
    setShowInfo(false)
    setParams(
      (p) => {
        p.delete('lead')
        return p
      },
      { replace: true },
    )
  }

  const item = items.find((i) => i.leadId === selected) ?? null

  const infoOverlay =
    showInfo && item ? (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 animate-fade-in bg-black/30" onClick={() => setShowInfo(false)} />
        <div className="absolute right-0 top-0 h-full w-[86%] max-w-[360px] animate-sheet-right border-l border-line bg-surface shadow-sh2">
          <ChatInfoPanel leadId={item.leadId} onClose={() => setShowInfo(false)} />
        </div>
      </div>
    ) : null

  const thread = item ? (
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
  ) : null

  // ── Телефон: полноэкранное окно, список ⇄ диалог, только кнопка «назад» ──
  if (!desktop) {
    return (
      <div className="flex h-[100dvh] flex-col bg-surface">
        {!item ? (
          <>
            <div className="flex items-center gap-1 border-b border-line px-2 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={() => exitChat(navigate)}
                aria-label={t('chat.back')}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <ArrowLeft size={21} />
              </button>
              <span className="text-[18px] font-bold text-ink">{t('page.chat')}</span>
            </div>
            <div className="min-h-0 flex-1">
              <ConversationList selectedLeadId={selected} onSelect={select} />
            </div>
          </>
        ) : (
          thread
        )}
        {infoOverlay}
      </div>
    )
  }

  // ── ПК/планшет: внутри каркаса, список + диалог (+ инфопанель) ──
  return (
    <AppShell title={t('page.chat')}>
      <div className="flex h-[calc(100dvh-9.5rem)] overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1">
        <div className="flex w-[340px] flex-none flex-col border-r border-line">
          <ConversationList selectedLeadId={selected} onSelect={select} />
        </div>

        <div className="flex min-w-0 flex-1">
          {thread ?? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-accent-soft text-accent">
                <MessagesSquare size={28} />
              </span>
              <p className="text-[15px] font-bold text-ink">{t('chat.noneSelected')}</p>
              <p className="max-w-xs text-[13px] text-ink-3">{t('chat.noneSelectedHint')}</p>
            </div>
          )}
        </div>

        {wideEnough && showInfo && item && (
          <div className="w-[320px] flex-none border-l border-line">
            <ChatInfoPanel leadId={item.leadId} onClose={() => setShowInfo(false)} />
          </div>
        )}
      </div>

      {!wideEnough && infoOverlay}
    </AppShell>
  )
}
