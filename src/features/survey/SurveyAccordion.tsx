import { type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Раздел-«шторка» с плавным раскрытием.
 * Высота анимируется через grid-rows 0fr→1fr (без скачков и фикс. высоты).
 */
export function SurveyAccordion({
  title,
  answered,
  total,
  open,
  onToggle,
  children,
}: {
  title: string
  answered: number
  total: number
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const complete = total > 0 && answered >= total

  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-sh1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:px-5"
      >
        <span
          className={cn(
            'flex h-7 w-7 flex-none items-center justify-center rounded-[9px] transition-colors',
            open ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-3',
          )}
        >
          <ChevronDown
            size={16}
            className={cn(
              'transition-transform duration-300 ease-kit',
              open && 'rotate-180',
            )}
          />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold uppercase tracking-wide text-ink">
          {title}
        </span>
        <span
          className={cn(
            'inline-flex flex-none items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
            complete ? 'bg-accent-soft text-accent' : 'bg-surface-3 text-ink-3',
          )}
        >
          {complete && <Check size={11} />}
          {answered}/{total}
        </span>
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-kit',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-line border-t border-line px-4 sm:px-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
