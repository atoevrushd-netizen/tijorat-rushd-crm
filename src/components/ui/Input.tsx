import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  /** underline (как в шаблоне) | box */
  variant?: 'underline' | 'box'
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, variant = 'underline', leftIcon, className, id, ...rest },
  ref,
) {
  const base = variant === 'underline' ? 'input-underline' : 'input-box'
  const field = (
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="pointer-events-none absolute left-2 text-ink-3">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          base,
          leftIcon ? (variant === 'underline' ? 'pl-8' : 'pl-9') : undefined,
          error ? 'border-danger focus:border-danger' : undefined,
          className,
        )}
        style={error ? { boxShadow: '0 0 0 3px var(--danger-soft)' } : undefined}
        {...rest}
      />
    </div>
  )

  if (!label && !error) return field

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-[12.5px] font-semibold',
            error ? 'text-danger' : 'text-ink-2',
          )}
        >
          {label}
        </label>
      )}
      {field}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
})
