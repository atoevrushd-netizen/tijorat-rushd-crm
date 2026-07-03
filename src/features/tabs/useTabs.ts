import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTab,
  deleteTab,
  listActiveTabs,
  listAllTabs,
  updateTab,
  type TabPatch,
} from './api'

// Вкладки меняются редко — держим свежими 5 минут (меньше перезапросов).
export function useActiveTabs() {
  return useQuery({
    queryKey: ['tabs', 'active'],
    queryFn: listActiveTabs,
    staleTime: 5 * 60_000,
  })
}

export function useAllTabs() {
  return useQuery({
    queryKey: ['tabs', 'all'],
    queryFn: listAllTabs,
    staleTime: 5 * 60_000,
  })
}

/** Любая мутация вкладок обновляет все списки вкладок. */
function useTabsInvalidator() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['tabs'] })
}

export function useCreateTab() {
  const invalidate = useTabsInvalidator()
  return useMutation({
    mutationFn: createTab,
    onSuccess: () => void invalidate(),
  })
}

export function useUpdateTab() {
  const invalidate = useTabsInvalidator()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TabPatch }) =>
      updateTab(id, patch),
    onSuccess: () => void invalidate(),
  })
}

export function useDeleteTab() {
  const invalidate = useTabsInvalidator()
  return useMutation({
    mutationFn: deleteTab,
    onSuccess: () => void invalidate(),
  })
}
