import type { RazborField, RazborSection as Section } from '@/types'
import { useT } from '@/i18n/useT'
import { AutoSaveTextarea } from '@/components/ui/AutoSaveTextarea'

/** Внутренность одного разбора: показываемый текст (отчёт, вопросы) + поля ответов. */
export function RazborSection({
  section,
  values,
  editable,
  onSave,
}: {
  section: Section
  values: { answers: string; tasks: string }
  editable: boolean
  onSave: (field: RazborField, value: string) => Promise<void>
}) {
  const { t, lang } = useT()
  const report = (lang === 'tg' && section.report_tg) || section.report_ru
  const questions = (lang === 'tg' && section.questions_tg) || section.questions_ru

  return (
    <div className="space-y-3 py-3">
      {report.trim() && (
        <ReadBlock title={t('razbor.report')} text={report} />
      )}
      {questions.trim() && (
        <ReadBlock title={t('razbor.questions')} text={questions} />
      )}

      <AutoSaveTextarea
        label={t('razbor.answers')}
        initial={values.answers}
        readOnly={!editable}
        placeholder={t('razbor.answerPlaceholder')}
        onSave={editable ? (v) => onSave('answers', v) : undefined}
      />
      <AutoSaveTextarea
        label={t('razbor.tasks')}
        initial={values.tasks}
        readOnly={!editable}
        placeholder={t('razbor.answerPlaceholder')}
        onSave={editable ? (v) => onSave('tasks', v) : undefined}
      />
    </div>
  )
}

/** Показываемый (read-only) блок текста разбора. */
function ReadBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-3">
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-3">
        {title}
      </div>
      <p className="whitespace-pre-wrap text-sm text-ink-2">{text}</p>
    </div>
  )
}
