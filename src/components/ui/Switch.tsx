import { cn } from '@/lib/utils'

/** iOS-переключатель: зелёный во включённом состоянии, с плавным «переливом». */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  /** aria-label для скринридеров (переключатель без видимой подписи). */
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50',
        checked ? 'bg-success shadow-[0_0_12px_rgba(52,199,89,.35)]' : 'bg-surface-3',
      )}
    >
      <span
        className={cn(
          'absolute left-[2px] top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform duration-200 ease-ios',
          checked && 'translate-x-[20px]',
        )}
      />
    </button>
  )
}
