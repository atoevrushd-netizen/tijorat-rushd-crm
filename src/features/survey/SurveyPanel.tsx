import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import type { SurveyType } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSurveyAnswers, useSurveyQuestions, useUpsertAnswer } from './useSurvey'
import { SurveyAccordion } from './SurveyAccordion'
import { SurveyQuestionField } from './SurveyQuestionField'
import {
  answersMap,
  countAnswered,
  groupBySections,
  questionText,
  sectionTitle,
} from './surveyUtils'

const TYPES: SurveyType[] = ['A', 'B']

/**
 * Панель анкет: переключатель A/B, прогресс и разделы-шторки с вопросами.
 * editable=true — лид заполняет свою анкету; false — просмотр (чужая/для админа).
 */
export function SurveyPanel({
  userId,
  editable,
}: {
  userId: string
  editable: boolean
}) {
  const { t, lang } = useT()
  const [type, setType] = useState<SurveyType>('A')
  const [openSections, setOpenSections] = useState<Set<number>>(() => new Set([1]))

  const questionsQ = useSurveyQuestions()
  const answersQ = useSurveyAnswers(userId, type)
  const upsert = useUpsertAnswer(userId, type)

  const sections = useMemo(
    () => groupBySections(questionsQ.data ?? []),
    [questionsQ.data],
  )
  const answers = useMemo(() => answersMap(answersQ.data ?? []), [answersQ.data])
  const total = questionsQ.data?.length ?? 0
  const answeredTotal = useMemo(
    () => countAnswered(questionsQ.data ?? [], answers),
    [questionsQ.data, answers],
  )
  const pct = total ? Math.round((answeredTotal / total) * 100) : 0

  function toggleSection(order: number) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(order)) next.delete(order)
      else next.add(order)
      return next
    })
  }
  const allOpen = sections.length > 0 && sections.every((s) => openSections.has(s.order))
  function toggleAll() {
    setOpenSections(allOpen ? new Set() : new Set(sections.map((s) => s.order)))
  }

  if (questionsQ.isLoading) {
    return (
      <section className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </section>
    )
  }
  if (questionsQ.isError) {
    return (
      <div className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
        {t('survey.loadError')}
      </div>
    )
  }
  if (total === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-ink-3">
        {t('survey.empty')}
      </p>
    )
  }

  return (
    <section className="space-y-3">
      {/* Переключатель A/B + прогресс */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-[14px] border border-line bg-surface-2 p-1">
          {TYPES.map((ty) => (
            <button
              key={ty}
              type="button"
              onClick={() => setType(ty)}
              className={cn(
                'rounded-[10px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors sm:px-4',
                type === ty
                  ? 'bg-accent-grad text-on-accent shadow-glow'
                  : 'text-ink-2 hover:text-ink',
              )}
            >
              {t(ty === 'A' ? 'survey.typeA' : 'survey.typeB')}
              <span className="ml-1 hidden opacity-70 sm:inline">
                · {t(ty === 'A' ? 'survey.typeA.desc' : 'survey.typeB.desc')}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="text-[12px] font-medium text-ink-3 transition-colors hover:text-accent"
        >
          {allOpen ? t('survey.collapseAll') : t('survey.expandAll')}
        </button>
      </div>

      {/* Полоса прогресса */}
      <div className="rounded-xl border border-line bg-surface px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="text-ink-2">
            {answeredTotal} {t('survey.of')} {total} {t('survey.answered')}
          </span>
          <span className="font-mono font-bold text-accent">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-accent-grad transition-all duration-500 ease-kit"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Разделы-шторки */}
      <div className="space-y-2">
        {sections.map((s) => (
          <SurveyAccordion
            key={s.order}
            title={sectionTitle(s, lang)}
            answered={countAnswered(s.questions, answers)}
            total={s.questions.length}
            open={openSections.has(s.order)}
            onToggle={() => toggleSection(s.order)}
          >
            {s.questions.map((q) => (
              <SurveyQuestionField
                key={q.id}
                index={q.question_order}
                text={questionText(q, lang)}
                initial={answers.get(q.id) ?? ''}
                readOnly={!editable}
                onSave={
                  editable
                    ? (answer) =>
                        upsert.mutateAsync({ questionId: q.id, answer })
                    : undefined
                }
              />
            ))}
          </SurveyAccordion>
        ))}
      </div>
    </section>
  )
}
