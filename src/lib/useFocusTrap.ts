import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Управление фокусом для диалогов (a11y):
 *  • при открытии — фокус на первый фокусируемый элемент внутри (или сам контейнер);
 *  • Tab/Shift+Tab не выходят за пределы диалога («ловушка»);
 *  • при закрытии — фокус возвращается туда, откуда диалог открыли.
 * Хук ничего не делает, пока active=false.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return
    const opener = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )

    // Начальный фокус — на следующем кадре, чтобы анимация/портал успели смонтироваться.
    const raf = requestAnimationFrame(() => {
      const first = focusables()[0]
      if (first) first.focus()
      else {
        root.tabIndex = -1
        root.focus()
      }
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const cur = document.activeElement as HTMLElement | null
      if (e.shiftKey && (cur === first || !root.contains(cur))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (cur === last || !root.contains(cur))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      // Возвращаем фокус открывшему элементу (если он ещё в документе).
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [ref, active])
}
