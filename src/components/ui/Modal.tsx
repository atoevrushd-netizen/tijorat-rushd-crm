import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Модальное окно. Рендерится ПОРТАЛОМ в document.body — иначе `transform`
 * у родителя (анимации) ломает position:fixed и окно «уезжает» за экран.
 * Прокручивается оверлей, окно приподнято. Esc — закрыть, фон не скроллится.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-start justify-center px-4 pb-8 pt-[max(8vh,env(safe-area-inset-top))]">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md animate-rise rounded-xl border border-line-strong bg-elevated p-6 shadow-sh2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="text-ink-3 transition-colors hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
