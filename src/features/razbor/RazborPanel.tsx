import { useMemo, useState } from 'react'
import { useT } from '@/i18n/useT'
import type { RazborField } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { SurveyAccordion } from '@/features/survey/SurveyAccordion'
import { RazborSection } from './RazborSection'
import { useRazborAnswers, useRazborSections, useUpsertRazborAnswer } from './useRazbor'

/** Панель «Разбор»: разделы-шторки с текстом и полями ответов. */
export function RazborPanel({
  userId,
  editable,
}: {
  userId: string
  editable: boolean
}) {
  const { t, lang } = useT()
  const [open, setOpen] = useState<Set<string>>(new Set())
  const sectionsQ = useRazborSections()
  const answersQ = useRazborAnswers(userId)
  const upsert = useUpsertRazborAnswer(userId)

  const answers = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of answersQ.data ?? []) m.set(`${a.section_id}:${a.field}`, a.answer)
    return m
  }, [answersQ.data])

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (sectionsQ.isLoading) {
    return (
      <section className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-[16px]" />
        ))}
      </section>
    )
  }
  if (sectionsQ.isError) {
    return (
      <div className="rounded-[14px] bg-danger-soft px-4 py-3 text-sm text-danger">
        {t('razbor.loadError')}
      </div>
    )
  }
  const sections = sectionsQ.data ?? []
  if (sections.length === 0) {
    return (
      <p className="rounded-[16px] border border-line bg-surface px-4 py-8 text-center text-sm text-ink-3 shadow-sh1">
        {t('razbor.empty')}
      </p>
    )
  }

  return (
    <section className="space-y-2.5">
      {sections.map((s) => {
        const ans = answers.get(`${s.id}:answers`) ?? ''
        const tasks = answers.get(`${s.id}:tasks`) ?? ''
        const answered = [ans, tasks].filter((v) => v.trim()).length
        return (
          <SurveyAccordion
            key={s.id}
            title={(lang === 'tg' && s.title_tg) || s.title_ru}
            answered={answered}
            total={2}
            open={open.has(s.id)}
            onToggle={() => toggle(s.id)}
          >
            <RazborSection
              section={s}
              values={{ answers: ans, tasks }}
              editable={editable}
              onSave={(field: RazborField, value: string) =>
                upsert.mutateAsync({ sectionId: s.id, field, answer: value })
              }
            />
          </SurveyAccordion>
        )
      })}
    </section>
  )
}
