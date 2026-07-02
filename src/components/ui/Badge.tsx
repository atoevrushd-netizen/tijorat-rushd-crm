import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'accent' | 'success' | 'info' | 'warn' | 'danger' | 'muted'

const TONE: Record<Tone, { wrap: string; dot: string }> = {
  accent: { wrap: 'bg-accent-soft text-accent', dot: 'bg-accent' },
  success: { wrap: 'bg-success-soft text-success', dot: 'bg-success' },
  info: { wrap: 'bg-info-soft text-info', dot: 'bg-info' },
  warn: { wrap: 'bg-warn-soft text-warn', dot: 'bg-warn' },
  danger: { wrap: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  muted: {
    wrap: 'bg-surface-3 text-ink-2 border border-line-strong',
    dot: 'bg-ink-3',
  },
}

/** Статус-бейдж: soft-фон + цветной текст + точка-индикатор (по киту). */
export function Badge({
  tone = 'muted',
  dot = true,
  children,
}: {
  tone?: Tone
  dot?: boolean
  children: ReactNode
}) {
  const t = TONE[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12.5px] font-semibold',
        t.wrap,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  )
}
