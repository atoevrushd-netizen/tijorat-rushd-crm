import { cn } from '@/lib/utils'

/** Плейсхолдер загрузки с бегущим бликом (shimmer). */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={cn('animate-shimmer rounded-md', className)}
      style={{
        background:
          'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 37%, var(--surface-2) 63%)',
        backgroundSize: '200% 100%',
      }}
    />
  )
}
