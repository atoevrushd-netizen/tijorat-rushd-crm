import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, Check, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { dismissToast, subscribeToasts, type ToastItem } from '@/lib/toast'

const ICON = { success: Check, error: AlertCircle, info: Info } as const
const COLOR = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-accent',
} as const

/** Стек тостов (портал в body, поверх модалок). */
export function Toaster() {
  const { t } = useT()
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {items.map((item) => {
        const Icon = ICON[item.kind]
        return (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full max-w-sm animate-sheet-up items-center gap-3 rounded-[16px] border border-line bg-[rgba(255,255,255,.92)] px-4 py-3 shadow-sh2 backdrop-blur-xl"
          >
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center', COLOR[item.kind])}>
              <Icon size={18} strokeWidth={2.5} />
            </span>
            <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-ink">
              {item.message}
            </span>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="shrink-0 text-ink-2 transition-colors hover:text-ink"
              aria-label={t('common.close')}
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
