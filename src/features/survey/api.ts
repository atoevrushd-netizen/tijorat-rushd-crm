import { supabase } from '@/lib/supabase'
import type {
  SurveyAnswer,
  SurveyPerson,
  SurveyQuestion,
  SurveyType,
} from '@/types'

/** Общий банк вопросов, отсортирован по разделам и порядку. */
export async function listQuestions(): Promise<SurveyQuestion[]> {
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .order('section_order', { ascending: true })
    .order('question_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as SurveyQuestion[]
}

/** Ответы конкретного лида по типу анкеты (A или B). */
export async function listAnswers(
  userId: string,
  type: SurveyType,
): Promise<SurveyAnswer[]> {
  const { data, error } = await supabase
    .from('survey_answers')
    .select('*')
    .eq('user_id', userId)
    .eq('survey_type', type)
  if (error) throw error
  return (data ?? []) as SurveyAnswer[]
}

/** Сохранить (создать/обновить) ответ. RLS: свой ответ — лид, любой — админ. */
export async function upsertAnswer(input: {
  userId: string
  type: SurveyType
  questionId: string
  answer: string
}): Promise<void> {
  const { error } = await supabase.from('survey_answers').upsert(
    {
      user_id: input.userId,
      survey_type: input.type,
      question_id: input.questionId,
      answer: input.answer,
    },
    { onConflict: 'user_id,survey_type,question_id' },
  )
  if (error) throw error
}

/** Список участников (только id/имя/фото) для страницы «ответы всех». */
export async function listPeople(): Promise<SurveyPerson[]> {
  const { data, error } = await supabase
    .from('survey_people')
    .select('*')
    .order('full_name', { ascending: true })
  if (error) throw error
  return (data ?? []) as SurveyPerson[]
}
