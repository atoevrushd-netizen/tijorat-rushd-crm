import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useT } from '@/i18n/useT'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Поле с заголовком и автосохранением при потере фокуса.
 * Авто-растёт под объём текста. В readOnly — показывает текст (или «нет ответа»).
 */
export function AutoSaveTextarea({
  label,
  initial,
  readOnly = false,
  onSave,
  placeholder,
}: {
  label: string
  initial: string
  readOnly?: boolean
  onSave?: (value: string) => Promise<void>
  placeholder?: string
}) {
  const { t } = useT()
  const [value, setValue] = useState(initial)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const savedRef = useRef(initial)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setValue(initial)
    savedRef.current = initial
    setStatus('idle')
  }, [initial])

  const grow = useCallback(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    grow()
  }, [grow, value])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  async function handleBlur() {
    if (!onSave || value === savedRef.current) return
    setStatus('saving')
    try {
      await onSave(value)
      savedRef.current = value
      setStatus('saved')
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setStatus('idle'), 2200)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="py-2">
      <div className="mb-1.5 text-[12.5px] font-semibold text-accent">{label}</div>
      {readOnly ? (
        <p
          className={
            value.trim()
              ? 'whitespace-pre-wrap text-sm text-ink-2'
              : 'text-sm italic text-ink-3'
          }
        >
          {value.trim() || t('survey.noAnswer')}
        </p>
      ) : (
        <>
          <textarea
            ref={areaRef}
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full resize-none overflow-hidden rounded-[12px] border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
          />
          <div className="mt-1 h-4 text-[11px]">
            {status === 'saving' && (
              <span className="inline-flex items-center gap-1 text-ink-3">
                <Loader2 size={12} className="animate-spin" /> {t('survey.saving')}
              </span>
            )}
            {status === 'saved' && (
              <span className="inline-flex items-center gap-1 text-accent">
                <Check size={12} /> {t('survey.saved')}
              </span>
            )}
            {status === 'error' && (
              <span className="text-danger">{t('survey.saveError')}</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
