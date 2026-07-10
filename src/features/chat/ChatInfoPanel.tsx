import { ExternalLink, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Spinner } from '@/components/ui/Spinner'
import { AutoSaveTextarea } from '@/components/ui/AutoSaveTextarea'
import { useT } from '@/i18n/useT'
import { useUser } from '@/features/users/useUser'
import type { UserStatus } from '@/types'
import { useSetLeadNote, useSetLeadStatus } from './useChat'

const STATUSES: UserStatus[] = ['active', 'paused', 'archived']

/** Правая панель: контекст резидента + быстрые действия (только для админа). */
export function ChatInfoPanel({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const { t } = useT()
  const { data: user, isLoading } = useUser(leadId)
  const setStatus = useSetLeadStatus(leadId)
  const saveNote = useSetLeadNote(leadId)

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-[14px] font-bold text-ink">{t('chat.info')}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      {isLoading || !user ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.full_name} src={user.photo_url} size={72} className="ring-2 ring-accent-soft" />
            <div className="mt-2.5 text-[16px] font-bold text-ink">{user.full_name || '—'}</div>
            <div className="mt-1"><StatusBadge status={user.status} /></div>
            {user.business_direction && (
              <div className="mt-1 text-[12.5px] text-ink-3">{user.business_direction}</div>
            )}
          </div>

          <div className="mt-4 space-y-0.5 rounded-[14px] bg-surface-2 p-1">
            <Row label={t('usercard.fieldPhone')} value={user.phone} />
            <Row label={t('usercard.fieldLogin')} value={user.login ?? user.email} />
            <Row label={t('usercard.fieldRegDate')} value={formatDate(user.registration_date)} />
            <Row
              label={t('chat.subscription')}
              value={
                user.subscription_start || user.subscription_end
                  ? `${formatDate(user.subscription_start)} — ${formatDate(user.subscription_end)}`
                  : null
              }
            />
          </div>

          {/* Статус лида */}
          <div className="mt-4">
            <div className="mb-1.5 text-[12.5px] font-semibold text-ink-2">{t('chat.leadStatus')}</div>
            <div className="flex gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus.mutate(s)}
                  disabled={setStatus.isPending}
                  className={cn(
                    'flex-1 rounded-[11px] py-2 text-[12.5px] font-semibold transition-colors',
                    user.status === s
                      ? 'bg-accent-grad text-on-accent shadow-glow'
                      : 'bg-surface-2 text-ink-2 hover:text-ink',
                  )}
                >
                  {t(`userStatus.${s}`, s)}
                </button>
              ))}
            </div>
          </div>

          {/* Внутренняя заметка — видна только админам */}
          <div className="mt-4 rounded-[14px] border border-dashed border-line-strong bg-warn-soft/30 px-3 py-1">
            <AutoSaveTextarea
              label={t('chat.internalNote')}
              initial={user.admin_comment ?? ''}
              onSave={saveNote}
              placeholder={t('chat.internalNotePlaceholder')}
            />
          </div>

          <Link
            to={`/admin/users/${leadId}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-[13px] bg-accent-grad px-4 py-2.5 text-[13.5px] font-semibold text-on-accent shadow-glow transition-all duration-150 ease-ios hover:brightness-[1.06] active:scale-[.98]"
          >
            <ExternalLink size={16} />
            {t('chat.openFullCard')}
          </Link>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[11px] px-2.5 py-2">
      <span className="text-[12px] text-ink-3">{label}</span>
      <span className="truncate text-right text-[13px] font-medium text-ink">{value || '—'}</span>
    </div>
  )
}
