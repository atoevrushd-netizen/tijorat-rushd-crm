import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SurveyType } from '@/types'
import { listAnswers, listPeople, listQuestions, upsertAnswer } from './api'

/** Банк вопросов (меняется редко — держим свежим 5 минут). */
export function useSurveyQuestions() {
  return useQuery({
    queryKey: ['survey', 'questions'],
    queryFn: listQuestions,
    staleTime: 5 * 60_000,
  })
}

/** Ответы лида по типу анкеты. */
export function useSurveyAnswers(userId: string, type: SurveyType) {
  return useQuery({
    queryKey: ['survey', 'answers', userId, type],
    queryFn: () => listAnswers(userId, type),
    enabled: !!userId,
  })
}

/** Сохранение ответа с оптимистичным обновлением кэша. */
export function useUpsertAnswer(userId: string, type: SurveyType) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { questionId: string; answer: string }) =>
      upsertAnswer({ userId, type, questionId: v.questionId, answer: v.answer }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['survey', 'answers', userId, type] })
    },
  })
}

/** Список участников для страницы «ответы всех». */
export function useSurveyPeople() {
  return useQuery({ queryKey: ['survey', 'people'], queryFn: listPeople })
}
