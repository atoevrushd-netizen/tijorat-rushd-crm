import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '@/i18n/useT'
import { subscribeConfirm, type ConfirmRequest } from '@/lib/confirm'
import { Button } from './Button'

/** Диалог подтверждения (iOS-шторка снизу / по центру на десктопе). */
export function ConfirmDialog() {
  const { t } = useT()
  const [req, setReq] = useState<ConfirmRequest | null>(null)

  useEffect(() => subscribeConfirm(setReq), [])

  useEffect(() => {
    if (!req) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req])

  function close(value: boolean) {
    req?.resolve(value)
    setReq(null)
  }

  if (!req) return null
  const o = req.opts

  return createPortal(
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/50 backdrop-blur-md animate-fade-in sm:items-center sm:p-4"
      onClick={() => close(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm animate-sheet-up rounded-t-[22px] border-t border-line bg-elevated px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-sh2 sm:animate-pop sm:rounded-[22px] sm:border sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {o.title && <h2 className="mb-1.5 text-[17px] font-bold text-ink">{o.title}</h2>}
        <p className="whitespace-pre-line text-sm text-ink-2">{o.message}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => close(false)}>
            {o.cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant={o.danger ? 'danger' : 'primary'}
            className="flex-1"
            onClick={() => close(true)}
          >
            {o.confirmLabel ?? t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
