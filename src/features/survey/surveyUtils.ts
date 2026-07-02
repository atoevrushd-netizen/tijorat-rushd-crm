import type { Lang } from '@/i18n/types'
import type { SurveyAnswer, SurveyQuestion } from '@/types'

/** Раздел анкеты со своими вопросами. */
export type SurveySection = {
  order: number
  key: string
  titleRu: string
  titleTg: string | null
  questions: SurveyQuestion[]
}

/** Заголовок раздела на текущем языке (tg при наличии, иначе ru). */
export function sectionTitle(section: SurveySection, lang: Lang): string {
  return (lang === 'tg' && section.titleTg) || section.titleRu
}

/** Текст вопроса на текущем языке (tg при наличии, иначе ru). */
export function questionText(q: SurveyQuestion, lang: Lang): string {
  return (lang === 'tg' && q.text_tg) || q.text_ru
}

/** Сгруппировать плоский список вопросов по разделам (сохраняя порядок). */
export function groupBySections(questions: SurveyQuestion[]): SurveySection[] {
  const map = new Map<number, SurveySection>()
  for (const q of questions) {
    let s = map.get(q.section_order)
    if (!s) {
      s = {
        order: q.section_order,
        key: q.section_key,
        titleRu: q.section_title_ru,
        titleTg: q.section_title_tg,
        questions: [],
      }
      map.set(q.section_order, s)
    }
    s.questions.push(q)
  }
  return [...map.values()].sort((a, b) => a.order - b.order)
}

/** Ответы в удобную мапу question_id → текст. */
export function answersMap(answers: SurveyAnswer[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const a of answers) m.set(a.question_id, a.answer)
  return m
}

/** Сколько вопросов с непустым ответом. */
export function countAnswered(
  questions: SurveyQuestion[],
  answers: Map<string, string>,
): number {
  let n = 0
  for (const q of questions) {
    if ((answers.get(q.id) ?? '').trim()) n++
  }
  return n
}
