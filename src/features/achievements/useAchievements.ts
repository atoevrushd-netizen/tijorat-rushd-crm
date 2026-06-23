import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAchievement, deleteAchievement, listAchievements } from './api'

export function useAchievements(userId: string) {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => listAchievements(userId),
  })
}

export function useAddAchievement(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addAchievement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['achievements', userId] })
    },
  })
}

export function useDeleteAchievement(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAchievement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['achievements', userId] })
    },
  })
}
