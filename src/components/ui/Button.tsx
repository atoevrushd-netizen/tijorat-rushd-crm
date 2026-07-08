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
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[13px] font-semibold ' +
  'transition-all duration-150 ease-ios select-none active:scale-[0.96] disabled:pointer-events-none disabled:opacity-[.5]'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent-grad text-on-accent shadow-glow ' +
    'hover:brightness-[1.06] active:brightness-95',
  secondary: 'bg-surface-2 text-ink border border-line hover:bg-surface-3',
  outline:
    'bg-transparent text-accent border border-line-strong hover:bg-surface-2',
  ghost: 'bg-transparent text-accent hover:bg-accent-soft',
  danger:
    'bg-danger-soft text-danger hover:bg-[rgba(255,59,48,.16)]',
}

const sizes: Record<Size, string> = {
  sm: 'text-[13px] px-4 py-2 rounded-[12px]',
  md: 'text-[15px] px-[22px] py-3',
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
