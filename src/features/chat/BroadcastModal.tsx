import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { useT } from '@/i18n/useT'
import { BroadcastCompose } from './BroadcastCompose'
import { BroadcastHistory } from './BroadcastHistory'

/** Массовые рассылки: вкладки «Новая» и «История». */
export function BroadcastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const [tab, setTab] = useState<'new' | 'history'>('new')

  // Модалка остаётся смонтированной между открытиями — сбрасываем на «Новую».
  useEffect(() => {
    if (open) setTab('new')
  }, [open])

  return (
    <Modal open={open} onClose={onClose} title={t('bc.title')}>
      <div className="mb-4 flex gap-1.5">
        {(['new', 'history'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              'flex-1 rounded-[11px] py-2 text-[13px] font-semibold transition-colors',
              tab === k ? 'bg-accent-grad text-on-accent shadow-glow' : 'bg-surface-2 text-ink-2 hover:text-ink',
            )}
          >
            {t(k === 'new' ? 'bc.new' : 'bc.history')}
          </button>
        ))}
      </div>

      {tab === 'new' ? (
        <BroadcastCompose onSent={() => setTab('history')} />
      ) : (
        <BroadcastHistory active={tab === 'history'} />
      )}
    </Modal>
  )
}
