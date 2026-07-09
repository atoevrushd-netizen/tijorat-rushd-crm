import { useCallback, useEffect, useRef } from 'react'
import { useT } from '@/i18n/useT'
import { useAutosave } from '@/lib/useAutosave'
import { SaveStatusText } from '@/components/ui/SaveStatusText'

/**
 * Один вопрос анкеты: номер, текст и поле ответа.
 * Ответ сохраняется автоматически (debounce во время ввода + при потере фокуса).
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
    <div className="flex gap-3 py-3.5">
      <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-[9px] bg-accent-soft font-mono text-[12px] font-bold text-accent">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium leading-snug text-ink">{text}</p>

        {readOnly ? (
          value.trim() ? (
            <div className="mt-2 whitespace-pre-wrap rounded-[10px] bg-surface-2 px-3 py-2 text-sm text-ink-2">
              {value}
            </div>
          ) : (
            <p className="mt-1.5 text-sm italic text-ink-3">{t('survey.noAnswer')}</p>
          )
        ) : (
          <>
            <textarea
              ref={areaRef}
              rows={2}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={t('survey.answerPlaceholder')}
              className="mt-2 w-full resize-none overflow-hidden rounded-[12px] border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
            />
            <SaveStatusText status={status} />
          </>
        )}
      </div>
    </div>
  )
}
