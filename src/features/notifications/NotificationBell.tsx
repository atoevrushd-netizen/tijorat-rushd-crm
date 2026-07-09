import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { activityText } from '@/features/activity-log/activityText'
import { useNotifications, getLastSeen, markSeen } from './useNotifications'
import type { NotificationEvent } from './api'

/** Колокольчик уведомлений в шапке: непрочитанные + лента последних событий. */
export function NotificationBell() {
  const { t, lang } = useT()
  const { profile, role } = useAuth()
  const navigate = useNavigate()
  const uid = profile?.id ?? ''
  const isAdmin = role === 'admin' || role === 'developer'
  const { data = [] } = useNotifications()

  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(() => getLastSeen(uid))
  // Что было «новым» на момент открытия — чтобы подсветить свежие внутри списка.
  const prevSeen = useRef(lastSeen)

  const unread = data.filter((e) => e.created_at > lastSeen).length

  function toggle() {
    if (!open) {
      prevSeen.current = lastSeen
      const now = new Date().toISOString()
      markSeen(uid)
      setLastSeen(now)
    }
    setOpen((v) => !v)
  }

  useEffect(() => {
    if (!open) return
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function onItem(ev: NotificationEvent) {
    setOpen(false)
    // Админ прыгает в карточку лида, чью запись открыл; лид остаётся у себя.
    if (isAdmin && ev.user_id) navigate(`/admin/users/${ev.user_id}`)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={t('notif.title')}
        className="relative flex h-9 w-9 items-center justify-center rounded-[12px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-on-accent">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <>
            {/* Прозрачная подложка — клик вне закрывает */}
            <div className="fixed inset-0 z-[56]" onClick={() => setOpen(false)} />
            <div className="fixed right-3 top-[64px] z-[57] w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh2 sm:right-6">
              <div className="border-b border-line px-4 py-3 text-[14px] font-bold text-ink">
                {t('notif.title')}
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {data.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-ink-3">
                    {t('notif.empty')}
                  </p>
                ) : (
                  data.map((ev) => {
                    const isNew = ev.created_at > prevSeen.current
                    const subject = ev.subject?.full_name
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onItem(ev)}
                        className={cn(
                          'flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-surface-2',
                          isAdmin && ev.user_id ? 'cursor-pointer' : 'cursor-default',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            isNew ? 'bg-accent' : 'bg-transparent',
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] leading-snug text-ink">
                            {isAdmin && subject ? `${subject}: ` : ''}
                            {activityText(ev, t, lang)}
                          </span>
                          <span className="mt-0.5 block font-mono text-[11px] text-ink-3">
                            {ev.actor?.full_name ? `${ev.actor.full_name} · ` : ''}
                            {formatDateTime(ev.created_at)}
                          </span>
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}
