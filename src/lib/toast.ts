/**
 * Тосты-уведомления. Глобальный эмиттер (не React), чтобы слать их можно было
 * откуда угодно — из компонентов и из обработчика ошибок React Query.
 * Подписчик — <Toaster/> — рендерит стек.
 */
export type ToastKind = 'success' | 'error' | 'info'
export type ToastItem = { id: number; kind: ToastKind; message: string }

type Listener = (toasts: ToastItem[]) => void

let items: ToastItem[] = []
let listeners: Listener[] = []
let nextId = 1

function emit() {
  for (const l of listeners) l(items)
}

/** Убрать тост по id. */
export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id)
  emit()
}

const MAX_STACK = 3

function push(kind: ToastKind, message: string, ms = 3500) {
  // Дедуп: тот же текст уже на экране — не плодим копию (например, серия одинаковых ошибок).
  const dup = items.find((t) => t.kind === kind && t.message === message)
  if (dup) return dup.id
  const id = nextId++
  // Кап стека: держим только последние MAX_STACK, старые снимаем сразу.
  items = [...items, { id, kind, message }].slice(-MAX_STACK)
  emit()
  setTimeout(() => dismissToast(id), ms)
  return id
}

export function subscribeToasts(l: Listener): () => void {
  listeners.push(l)
  l(items)
  return () => {
    listeners = listeners.filter((x) => x !== l)
  }
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message, 5000),
  info: (message: string) => push('info', message),
}

const ERR_FALLBACK: Record<string, string> = {
  tg: 'Хатогӣ рӯй дод',
  ru: 'Что-то пошло не так',
}

/** Запасное сообщение об ошибке на языке интерфейса (обработчик живёт вне провайдера). */
function defaultErrorFallback(): string {
  try {
    return localStorage.getItem('tijorat.lang') === 'tg' ? ERR_FALLBACK.tg : ERR_FALLBACK.ru
  } catch {
    return ERR_FALLBACK.ru
  }
}

/** Достаёт человекочитаемое сообщение об ошибке. */
export function errorMessage(err: unknown, fallback = defaultErrorFallback()): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return fallback
}
