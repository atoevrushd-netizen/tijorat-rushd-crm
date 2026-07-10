import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Сворачиваемая секция-«шторка»: заголовок-кнопка + плавно раскрывающееся тело.
 * Высота анимируется через grid-rows 0fr→1fr (без фикс. высоты и скачков).
 * По умолчанию свёрнута — чтобы длинные карточки было легко «пролистать» и
 * раскрывать только нужное.
 */
export function CollapsibleSection({
  title,
  icon,
  hint,
  right,
  defaultOpen = false,
  children,
}: {
  title: string
  icon?: ReactNode
  hint?: string
  /** Доп. слот справа от заголовка (счётчик, статус…). */
  right?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-2 sm:px-5"
      >
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 flex-none items-center justify-center rounded-[11px] transition-colors',
              open ? 'bg-accent-grad text-on-accent shadow-glow' : 'bg-accent-soft text-accent',
            )}
          >
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold text-ink">{title}</span>
          {hint && <span className="mt-0.5 block truncate text-[12.5px] text-ink-3">{hint}</span>}
        </span>
        {right}
        <ChevronDown
          size={20}
          className={cn(
            'flex-none text-ink-3 transition-transform duration-300 ease-kit',
            open && 'rotate-180 text-accent',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-kit',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line p-4 sm:p-5">{children}</div>
        </div>
      </div>
    </section>
  )
}
