import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '@/types'
import { getOverview, listAllProfiles, setUserRole } from './api'

export function useAllProfiles() {
  return useQuery({ queryKey: ['dev', 'profiles'], queryFn: listAllProfiles })
}

export function useSetUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { userId: string; role: UserRole }) => setUserRole(v.userId, v.role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['dev'] })
      void qc.invalidateQueries({ queryKey: ['users'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useOverview() {
  return useQuery({ queryKey: ['dev', 'overview'], queryFn: getOverview })
}
