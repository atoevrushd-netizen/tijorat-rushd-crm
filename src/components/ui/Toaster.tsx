import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, Check, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dismissToast, subscribeToasts, type ToastItem } from '@/lib/toast'

const ICON = { success: Check, error: AlertCircle, info: Info } as const
const COLOR = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-accent',
} as const

/** Стек тостов (портал в body, поверх модалок). */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {items.map((t) => {
        const Icon = ICON[t.kind]
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm animate-sheet-up items-center gap-3 rounded-[16px] border border-line-strong bg-[rgba(28,28,30,.96)] px-4 py-3 shadow-sh2 backdrop-blur-xl"
          >
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center', COLOR[t.kind])}>
              <Icon size={18} strokeWidth={2.5} />
            </span>
            <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-ink">
              {t.message}
            </span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="shrink-0 text-ink-3 transition-colors hover:text-ink"
              aria-label="Закрыть"
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
