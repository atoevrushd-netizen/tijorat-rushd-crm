import { useMutation, useQuery, useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query'
import {
  addTaskLink,
  createTask,
  createTasks,
  deleteTask,
  deleteTaskLink,
  listTasks,
  respondToTask,
  reviewTask,
  setTaskStatus,
  setTaskSubmitted,
  updateTask,
} from './api'
import type { CreateTaskInput, UpdateTaskInput } from './api'
import type { TaskStatus } from '@/types'

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

type StatusSnapshot = { key: QueryKey; status: TaskStatus }[]

/**
 * Оптимистично меняем статус ОДНОЙ задачи во всех кэшах ['tasks'] (списки задач и
 * «Повестку дня») и запоминаем прежний статус ТОЛЬКО этой задачи — чтобы откат при
 * ошибке не затирал параллельные правки соседних строк (только их id восстановит).
 */
async function optimisticStatus(qc: QueryClient, taskId: string, next: TaskStatus): Promise<StatusSnapshot> {
  await qc.cancelQueries({ queryKey: ['tasks'] })
  const prev: StatusSnapshot = []
  for (const [key, list] of qc.getQueriesData<{ id: string; status: TaskStatus }[]>({ queryKey: ['tasks'] })) {
    if (!Array.isArray(list)) continue
    const found = list.find((t) => t.id === taskId)
    if (found) prev.push({ key, status: found.status })
    qc.setQueryData(
      key,
      list.map((t) => (t.id === taskId ? { ...t, status: next } : t)),
    )
  }
  return prev
}
function rollbackStatus(qc: QueryClient, taskId: string, prev: StatusSnapshot | undefined) {
  prev?.forEach(({ key, status }) =>
    qc.setQueryData(key, (cur) =>
      Array.isArray(cur) ? cur.map((t: { id: string }) => (t.id === taskId ? { ...t, status } : t)) : cur,
    ),
  )
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
    // Оптимистично: статус откликается мгновенно; при ошибке откатываем только эту задачу.
    onMutate: async ({ id, status }) => ({ prev: await optimisticStatus(queryClient, id, status), taskId: id }),
    onError: (_err, _vars, ctx) => rollbackStatus(queryClient, ctx?.taskId ?? '', ctx?.prev),
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

/** Резидент отмечает задачу выполненной (→ submitted) или снимает отметку (→ in_progress). */
export function useSetTaskSubmitted() {
  const queryClient = useQueryClient()
  const invalidate = useTasksInvalidator()
  return useMutation({
    mutationFn: ({ taskId, submitted }: { taskId: string; submitted: boolean }) =>
      setTaskSubmitted(taskId, submitted),
    // Оптимистично: галочка откликается мгновенно; при ошибке откатываем только эту задачу.
    onMutate: async ({ taskId, submitted }) => ({
      prev: await optimisticStatus(queryClient, taskId, submitted ? 'submitted' : 'in_progress'),
      taskId,
    }),
    onError: (_err, _vars, ctx) => rollbackStatus(queryClient, ctx?.taskId ?? '', ctx?.prev),
    onSettled: () => void invalidate(),
  })
}

/** Админ проверяет отправленную задачу: принять (→ done) или вернуть (→ needs_revision). */
export function useReviewTask() {
  const queryClient = useQueryClient()
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
    }) => reviewTask(taskId, accept, comment),
    // Оптимистично: галочка/бейдж откликаются мгновенно (в т.ч. в «Повестке дня»);
    // при ошибке откатываем только эту задачу (соседние правки не трогаем).
    onMutate: async ({ taskId, accept }) => ({
      prev: await optimisticStatus(queryClient, taskId, accept ? 'done' : 'needs_revision'),
      taskId,
    }),
    onError: (_err, _vars, ctx) => rollbackStatus(queryClient, ctx?.taskId ?? '', ctx?.prev),
    onSettled: () => void invalidate(),
  })
}
