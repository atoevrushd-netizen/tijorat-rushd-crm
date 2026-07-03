/**
 * Глобальное подтверждение действия (замена window.confirm).
 * Использование: const ok = await confirm({ message, danger: true }); if (ok) { … }
 * Диалог рендерит <ConfirmDialog/>; пока он не смонтирован — фолбэк на window.confirm.
 */
export type ConfirmOptions = {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export type ConfirmRequest = {
  id: number
  opts: ConfirmOptions
  resolve: (value: boolean) => void
}

type Listener = (req: ConfirmRequest | null) => void

let listener: Listener | null = null
let nextId = 1

export function subscribeConfirm(l: Listener): () => void {
  listener = l
  return () => {
    if (listener === l) listener = null
  }
}

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.confirm(opts.message))
      return
    }
    listener({ id: nextId++, opts, resolve })
  })
}
