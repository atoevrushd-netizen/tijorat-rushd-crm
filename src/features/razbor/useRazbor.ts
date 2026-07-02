import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RazborField } from '@/types'
import { listAnswers, listSections, upsertAnswer } from './api'

/** Разделы «Разбора» (меняются редко). */
export function useRazborSections() {
  return useQuery({
    queryKey: ['razbor', 'sections'],
    queryFn: listSections,
    staleTime: 5 * 60_000,
  })
}

/** Ответы лида по разборам. */
export function useRazborAnswers(userId: string) {
  return useQuery({
    queryKey: ['razbor', 'answers', userId],
    queryFn: () => listAnswers(userId),
    enabled: !!userId,
  })
}

/** Сохранение ответа. */
export function useUpsertRazborAnswer(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { sectionId: string; field: RazborField; answer: string }) =>
      upsertAnswer({ userId, sectionId: v.sectionId, field: v.field, answer: v.answer }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['razbor', 'answers', userId] })
    },
  })
}
