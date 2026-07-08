import { type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-[12px] border border-line-strong bg-surface-2 px-3.5 py-2.5 text-sm text-ink',
        'outline-none transition-all duration-200 ease-kit placeholder:text-ink-3',
        'focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]',
        className,
      )}
      {...props}
    />
  )
}
