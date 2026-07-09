import { useCallback, useEffect, useRef } from 'react'
import { useT } from '@/i18n/useT'
import { useAutosave } from '@/lib/useAutosave'
import { SaveStatusText } from './SaveStatusText'

/**
 * Поле с заголовком и автосохранением (debounce во время ввода + при blur).
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
  const { value, status, onChange, onBlur } = useAutosave(initial, onSave)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const grow = useCallback(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    grow()
  }, [grow, value])

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
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className="w-full resize-none overflow-hidden rounded-[12px] border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
          />
          <SaveStatusText status={status} />
        </>
      )}
    </div>
  )
}
