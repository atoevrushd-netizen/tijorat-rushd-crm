import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** hover-подъём (для кликабельных карточек) */
  hover?: boolean
  /** премиальная карточка: лёгкий градиент + glow на hover */
  glow?: boolean
}

/** iOS-карточка: скругление 18px, мягкая тень, hairline-граница. */
export function Card({ hover, glow, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[18px] border border-line shadow-sh1 transition-all duration-200 ease-ios',
        glow ? 'bg-gradient-to-b from-surface-2 to-surface' : 'bg-surface',
        hover && 'cursor-pointer hover:border-line-strong hover:brightness-110 active:scale-[.985]',
        glow && 'hover:shadow-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

/** KPI-плитка в стиле iOS: цветной значок-чип, крупное число, подпись, дельта. */
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
    <Card hover className="p-4 sm:p-5">
      <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3.5">
        <span className="truncate text-[12.5px] font-medium text-ink-2">{label}</span>
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-accent-soft text-accent">
            {icon}
          </span>
        )}
      </div>
      <div className="text-[26px] font-bold tracking-tight text-ink sm:text-[30px]">
        {value}
      </div>
      {delta && (
        <div className="mt-1.5 text-xs font-semibold">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
              deltaTone === 'up'
                ? 'bg-success-soft text-success'
                : 'bg-danger-soft text-danger',
            )}
          >
            {deltaTone === 'up' ? '▲' : '▼'} {delta}
          </span>
        </div>
      )}
    </Card>
  )
}
