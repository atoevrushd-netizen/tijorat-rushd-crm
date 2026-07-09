import { useCallback, useEffect, useRef, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Автосохранение поля: debounce во время ввода + немедленно при потере фокуса.
 * Возвращает текущее значение, статус («сохранение…/сохранено/ошибка») и обработчики.
 */
export function useAutosave(
  initial: string,
  onSave?: (value: string) => Promise<unknown>,
  debounceMs = 800,
) {
  const [value, setValue] = useState(initial)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const savedRef = useRef(initial)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const idleRef = useRef<ReturnType<typeof setTimeout>>()

  // Внешняя смена initial (сменили запись/тип) — подхватываем.
  useEffect(() => {
    setValue(initial)
    savedRef.current = initial
    setStatus('idle')
  }, [initial])

  useEffect(
    () => () => {
      clearTimeout(debounceRef.current)
      clearTimeout(idleRef.current)
    },
    [],
  )

  const save = useCallback(
    async (val: string) => {
      if (!onSave || val === savedRef.current) return
      setStatus('saving')
      try {
        await onSave(val)
        savedRef.current = val
        setStatus('saved')
        clearTimeout(idleRef.current)
        idleRef.current = setTimeout(() => setStatus('idle'), 2000)
      } catch {
        setStatus('error')
      }
    },
    [onSave],
  )

  const onChange = useCallback(
    (val: string) => {
      setValue(val)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => save(val), debounceMs)
    },
    [save, debounceMs],
  )

  const onBlur = useCallback(() => {
    clearTimeout(debounceRef.current)
    void save(value)
  }, [save, value])

  return { value, status, onChange, onBlur }
}
