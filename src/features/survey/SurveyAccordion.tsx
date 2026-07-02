import { type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
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
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2"
      >
        <ChevronDown
          size={18}
          className={cn(
            'flex-none text-ink-3 transition-transform duration-300 ease-kit',
            open && 'rotate-180',
          )}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold uppercase tracking-wide text-ink">
          {title}
        </span>
        <span
          className={cn(
            'flex-none rounded-full px-2 py-0.5 font-mono text-[11px]',
            complete ? 'bg-accent-soft text-accent' : 'bg-surface-3 text-ink-3',
          )}
        >
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
          <div className="divide-y divide-line border-t border-line px-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
