import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addTaskLink,
  createTask,
  createTasks,
  deleteTask,
  deleteTaskLink,
  listTasks,
  respondToTask,
  setTaskStatus,
  updateTask,
} from './api'
import type { CreateTaskInput, UpdateTaskInput } from './api'
import type { Task, TaskStatus } from '@/types'

export function useTasks(userId: string, tabId?: string) {
  return useQuery({
    queryKey: ['tasks', userId, tabId ?? null],
    queryFn: () => listTasks(userId, tabId),
  })
}

/** Любая мутация задач обновляет списки задач и ленту истории. */
function useTasksInvalidator() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    void queryClient.invalidateQueries({ queryKey: ['activity'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreateTask() {
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => void invalidate(),
  })
}

export function useCreateTasks() {
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: (inputs: CreateTaskInput[]) => createTasks(inputs),
    onSuccess: () => void invalidate(),
  })
}

export function useSetTaskStatus() {
  const queryClient = useQueryClient()
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      setTaskStatus(id, status),
    // Оптимистично: сразу меняем статус в кэше, чтобы галочка/бейдж откликались
    // мгновенно, не дожидаясь ответа сети. При ошибке откатываем.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const snapshots = queryClient.getQueriesData<Task[]>({ queryKey: ['tasks'] })
      for (const [key, list] of snapshots) {
        if (!list) continue
        queryClient.setQueryData<Task[]>(
          key,
          list.map((task) => (task.id === id ? { ...task, status } : task)),
        )
      }
      return { snapshots }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, list]) => queryClient.setQueryData(key, list))
    },
    onSettled: () => void invalidate(),
  })
}

export function useUpdateTask() {
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTaskInput }) =>
      updateTask(id, patch),
    onSuccess: () => void invalidate(),
  })
}

export function useDeleteTask() {
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => void invalidate(),
  })
}

export function useAddTaskLink() {
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: ({
      taskId,
      url,
      label,
    }: {
      taskId: string
      url: string
      label?: string
    }) => addTaskLink(taskId, url, label),
    onSuccess: () => void invalidate(),
  })
}

export function useDeleteTaskLink() {
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: deleteTaskLink,
    onSuccess: () => void invalidate(),
  })
}

export function useRespondToTask() {
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: ({
      taskId,
      accept,
      comment,
    }: {
      taskId: string
      accept: boolean
      comment?: string
    }) => respondToTask(taskId, accept, comment),
    onSuccess: () => void invalidate(),
  })
}
