import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** hover-подъём (для кликабельных карточек) */
  hover?: boolean
  /** премиальная карточка: цветная ambient-тень (glow) на hover */
  glow?: boolean
}

/** Карточка «Ocean Light»: скругление 18px, мягкая тень, hairline-граница. */
export function Card({ hover, glow, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[18px] border border-line bg-surface shadow-sh1 transition-all duration-200 ease-ios',
        hover && 'cursor-pointer hover:border-line-strong active:scale-[.985]',
        // цветная и серая hover-тени конфликтуют — glow приоритетнее
        glow ? 'hover:shadow-glow' : hover && 'hover:shadow-sh2',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

type Tone = 'accent' | 'success' | 'warn' | 'info' | 'danger'

const CHIP: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warn: 'bg-warn-soft text-warn',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
}

/**
 * KPI-плитка: цветной значок-чип сверху, крупное число, подпись снизу.
 * Чёткая иерархия «число → подпись», цвет чипа задаёт смысл метрики.
 */
export function StatCard({
  label,
  value,
  delta,
  deltaTone = 'up',
  icon,
  tone = 'accent',
}: {
  label: string
  value: string | number
  delta?: string
  deltaTone?: 'up' | 'down'
  icon?: ReactNode
  tone?: Tone
}) {
  return (
    <Card hover className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]',
              CHIP[tone],
            )}
          >
            {icon}
          </span>
        )}
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
              deltaTone === 'up'
                ? 'bg-success-soft text-success'
                : 'bg-danger-soft text-danger',
            )}
          >
            {deltaTone === 'up' ? '▲' : '▼'} {delta}
          </span>
        )}
      </div>
      <div className="mt-3 text-[28px] font-bold leading-none tracking-tight text-ink sm:text-[32px]">
        {value}
      </div>
      <div className="mt-1.5 truncate text-[12.5px] font-medium text-ink-2">{label}</div>
    </Card>
  )
}

/**
 * Hero-KPI: крупная градиентная плитка (главная метрика экрана).
 * Океановый градиент + декоративный блик + белый текст — «видная градиентная часть».
 */
export function HeroStatCard({
  label,
  value,
  icon,
  hint,
  className,
}: {
  label: string
  value: string | number
  icon?: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-[20px] bg-hero-grad p-5 text-on-accent shadow-hero sm:p-6',
        className,
      )}
    >
      {/* Декоративные блики для глубины */}
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-center justify-between gap-2">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-white/20 backdrop-blur-sm">
            {icon}
          </span>
        )}
        {hint && (
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
            {hint}
          </span>
        )}
      </div>
      <div className="relative mt-5">
        <div className="text-[38px] font-extrabold leading-none tracking-tight sm:text-[42px]">
          {value}
        </div>
        <div className="mt-2 text-[13px] font-medium text-white/85">{label}</div>
      </div>
    </div>
  )
}
