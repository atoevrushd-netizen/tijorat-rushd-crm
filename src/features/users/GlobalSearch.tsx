import { useEffect, useRef, useState, type KeyboardEvent as ReactKbdEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useT } from '@/i18n/useT'
import { useUserSearch } from './useUsers'

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

/**
 * Глобальный поиск лидов: кнопка в сайдбаре + оверлей (Ctrl/⌘+K).
 * Ищет по имени/телефону/логину и переходит в карточку. Только для админа.
 */
export function GlobalSearch() {
  const { t } = useT()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [active, setActive] = useState(0)
  const debounced = useDebouncedValue(term, 250)
  const { data: results = [], isFetching } = useUserSearch(debounced)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ctrl/⌘+K — открыть/закрыть.
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // При открытии — фокус в поле и блокировка прокрутки фона.
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Сброс подсветки при новых результатах.
  useEffect(() => {
    setActive(0)
  }, [debounced])

  function close() {
    setOpen(false)
    setTerm('')
  }

  function go(id: string) {
    close()
    navigate(`/admin/users/${id}`)
  }

  function onKeyDown(e: ReactKbdEvent<HTMLInputElement>) {
    if (e.key === 'Escape') return close()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const r = results[active]
      if (r) go(r.id)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-2 flex w-full items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink"
      >
        <Search size={15} />
        <span className="flex-1 text-left">{t('search.open')}</span>
        <kbd className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-ink-2">
          {isMac ? '⌘K' : 'Ctrl K'}
        </kbd>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[58] flex justify-center bg-black/30 px-4 pt-[12vh] backdrop-blur-sm"
            onClick={close}
          >
            <div
              className="animate-sheet-up h-fit w-full max-w-[520px] overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 border-b border-line px-4">
                <Search size={17} className="shrink-0 text-ink-3" />
                <input
                  ref={inputRef}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={t('search.placeholder')}
                  className="w-full bg-transparent py-3.5 text-[15px] text-ink outline-none placeholder:text-ink-3"
                />
              </div>

              <div className="max-h-[52vh] overflow-y-auto py-1">
                {debounced.trim().length < 2 ? (
                  <p className="px-4 py-6 text-center text-[13px] text-ink-3">{t('search.hint')}</p>
                ) : results.length === 0 && !isFetching ? (
                  <p className="px-4 py-6 text-center text-[13px] text-ink-3">{t('search.empty')}</p>
                ) : (
                  results.map((u, i) => (
                    <button
                      key={u.id}
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(u.id)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        i === active ? 'bg-surface-2' : 'hover:bg-surface-2',
                      )}
                    >
                      <Avatar name={u.full_name} src={u.photo_url} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-medium text-ink">
                          {u.full_name || '—'}
                        </div>
                        <div className="truncate font-mono text-[11.5px] text-ink-3">
                          {u.phone || u.login || '—'}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
