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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4 sm:pt-[max(1rem,env(safe-area-inset-top))]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-h-[92vh] animate-sheet-up overflow-y-auto rounded-t-[22px] border-t border-line bg-elevated px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-sh2 sm:max-w-md sm:animate-pop sm:rounded-[22px] sm:border sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* «Грабер» — как у iOS-шторок (только на телефоне) */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line-strong sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink active:scale-90"
          >
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
