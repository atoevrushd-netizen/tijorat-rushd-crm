import { type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none rounded-md border border-line-strong bg-bg px-3.5 py-3 pr-9 text-sm text-ink',
          'outline-none transition-all duration-200 ease-kit',
          'focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
      />
    </div>
  )
}
