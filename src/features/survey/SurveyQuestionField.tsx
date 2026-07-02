import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useT } from '@/i18n/useT'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Один вопрос анкеты: номер, текст и поле ответа.
 * Ответ сохраняется автоматически при потере фокуса (если изменился).
 * В режиме readOnly — только показ ответа (для просмотра чужих анкет).
 */
export function SurveyQuestionField({
  index,
  text,
  initial,
  readOnly = false,
  onSave,
}: {
  index: number
  text: string
  initial: string
  readOnly?: boolean
  onSave?: (answer: string) => Promise<void>
}) {
  const { t } = useT()
  const [value, setValue] = useState(initial)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const savedRef = useRef(initial)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Внешнее изменение (сменили лида/тип анкеты) — подхватываем новое значение.
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
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md bg-surface-3 font-mono text-[12px] font-bold text-ink-2">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-snug text-ink">{text}</p>

        {readOnly ? (
          <p
            className={
              value.trim()
                ? 'mt-1.5 whitespace-pre-wrap text-sm text-ink-2'
                : 'mt-1.5 text-sm italic text-ink-3'
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
              placeholder={t('survey.answerPlaceholder')}
              className="mt-2 w-full resize-none overflow-hidden rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
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
    </div>
  )
}
