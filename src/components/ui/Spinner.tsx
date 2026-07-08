import { cn } from '@/lib/utils'

/** Кольцевой спиннер (акцентная дуга на светлом треке). */
export function Spinner({
  size = 18,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-line-strong border-t-accent',
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
}
