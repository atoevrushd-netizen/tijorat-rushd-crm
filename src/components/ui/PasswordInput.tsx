import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Поле пароля (box-стиль) с кнопкой показать/скрыть. */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { className, ...rest },
  ref,
) {
  const { t } = useT()
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? 'text' : 'password'}
        className={cn('input-box pr-11', className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={t(show ? 'auth.hidePassword' : 'auth.showPassword')}
        aria-pressed={show}
        tabIndex={-1}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[9px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
})
