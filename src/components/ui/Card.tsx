import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** hover-подъём (для кликабельных карточек) */
  hover?: boolean
  /** премиальная карточка: лёгкий градиент + glow на hover */
  glow?: boolean
}

export function Card({ hover, glow, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line transition-all duration-[180ms] ease-kit',
        glow ? 'bg-gradient-to-b from-surface-2 to-surface' : 'bg-surface',
        hover && 'hover:-translate-y-[3px] hover:border-line-strong hover:shadow-sh2',
        glow && 'hover:border-accent hover:shadow-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

/** KPI-карточка дашборда. */
export function StatCard({
  label,
  value,
  delta,
  deltaTone = 'up',
  icon,
}: {
  label: string
  value: string | number
  delta?: string
  deltaTone?: 'up' | 'down'
  icon?: ReactNode
}) {
  return (
    <Card hover className="p-4 sm:p-[22px]">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3.5">
        <span className="truncate text-xs text-ink-2 sm:text-[12.5px]">{label}</span>
        {icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent sm:h-8 sm:w-8">
            {icon}
          </span>
        )}
      </div>
      <div className="font-mono text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">
        {value}
      </div>
      {delta && (
        <div className="mt-[7px] text-xs font-semibold">
          <span className={deltaTone === 'up' ? 'text-accent' : 'text-danger'}>
            {deltaTone === 'up' ? '▲' : '▼'} {delta}
          </span>
        </div>
      )}
    </Card>
  )
}
