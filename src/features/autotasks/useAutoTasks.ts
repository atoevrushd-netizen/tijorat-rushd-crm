import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppSettings, TaskTemplate } from '@/types'
import {
  createGroup,
  createTemplate,
  deleteGroup,
  deleteTemplate,
  duplicateGroup,
  getSettings,
  listGroups,
  listTemplates,
  updateSettings,
  updateTemplate,
} from './api'

export function useSettings() {
  return useQuery({
    queryKey: ['autotasks', 'settings'],
    queryFn: getSettings,
    staleTime: 5 * 60_000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Pick<AppSettings, 'auto_tasks_enabled' | 'active_group_id'>>) =>
      updateSettings(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['autotasks', 'settings'] }),
  })
}

export function useGroups() {
  return useQuery({
    queryKey: ['autotasks', 'groups'],
    queryFn: listGroups,
    staleTime: 5 * 60_000,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createGroup(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['autotasks', 'groups'] }),
  })
}

export function useDuplicateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { sourceId: string; name: string }) => duplicateGroup(v.sourceId, v.name),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['autotasks', 'groups'] })
      void qc.invalidateQueries({ queryKey: ['autotasks', 'templates'] })
    },
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['autotasks', 'groups'] })
      void qc.invalidateQueries({ queryKey: ['autotasks', 'settings'] })
    },
  })
}

export function useTemplates(groupId: string | null) {
  return useQuery({
    queryKey: ['autotasks', 'templates', groupId],
    queryFn: () => listTemplates(groupId as string),
    enabled: !!groupId,
  })
}

export function useCreateTemplate(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      tab_key: string
      title: string
      task_type: string | null
      offset_days: number | null
      sort_order: number
    }) => createTemplate({ group_id: groupId, ...input }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['autotasks', 'templates', groupId] }),
  })
}

export function useUpdateTemplate(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: {
      id: string
      patch: Partial<Pick<TaskTemplate, 'title' | 'tab_key' | 'task_type' | 'offset_days'>>
    }) => updateTemplate(v.id, v.patch),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['autotasks', 'templates', groupId] }),
  })
}

export function useDeleteTemplate(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['autotasks', 'templates', groupId] }),
  })
}
