import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  /** иконка слева от текста */
  leftIcon?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold ' +
  'transition-all duration-[180ms] ease-kit select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-[.55]'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent font-bold shadow-[0_4px_16px_rgba(59,130,246,.22)] ' +
    'hover:bg-accent-600 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(59,130,246,.34)]',
  secondary:
    'bg-surface-3 text-ink border border-line-strong hover:bg-elevated hover:-translate-y-0.5',
  outline:
    'bg-transparent text-ink border border-line-strong hover:border-accent hover:text-accent',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger:
    'bg-danger-soft text-danger border border-[rgba(245,107,107,.3)] hover:bg-[rgba(245,107,107,.2)]',
}

const sizes: Record<Size, string> = {
  sm: 'text-[12.5px] px-[15px] py-2',
  md: 'text-sm px-[22px] py-3',
  lg: 'text-base px-[30px] py-[15px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  )
})
