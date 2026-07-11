import { useMemo, useState } from 'react'
import { CornerUpRight, Search } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { messagePreview } from './chatFormat'
import { useForwardMessage, useLeads } from './useChat'
import type { ChatMessage } from './types'

/** Переслать сообщение выбранным резидентам (пикер + предпросмотр). */
export function ForwardModal({
  message,
  sourceLeadId,
  onClose,
}: {
  message: ChatMessage | null
  sourceLeadId: string | null
  onClose: () => void
}) {
  const { t } = useT()
  const open = !!message
  const leadsQ = useLeads(open)
  const forward = useForwardMessage()
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    return (leadsQ.data ?? []).filter(
      (l) =>
        l.id !== sourceLeadId &&
        (!n ||
          (l.full_name ?? '').toLowerCase().includes(n) ||
          (l.phone ?? '').toLowerCase().includes(n)),
    )
  }, [leadsQ.data, q, sourceLeadId])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function close() {
    setQ('')
    setSelected(new Set())
    onClose()
  }

  function submit() {
    if (!message || selected.size === 0) return
    forward.mutate(
      { source: message, leadIds: [...selected] },
      {
        onSuccess: (n) => {
          toast.success(t('chat.forwarded').replace('{n}', String(n)))
          close()
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={close} title={t('chat.forwardTitle')}>
      <div className="space-y-3">
        {/* Предпросмотр пересылаемого сообщения */}
        {message && (
          <div className="rounded-[12px] border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink-2">
            <div className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold text-accent">
              <CornerUpRight size={12} /> {t('chat.forward')}
            </div>
            <div className="line-clamp-2 break-words">{messagePreview(message, t)}</div>
          </div>
        )}

        <div className="text-[12.5px] font-semibold text-ink-2">{t('chat.forwardPick')}</div>

        <div className="rounded-[14px] border border-line">
          <div className="relative border-b border-line p-2">
            <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('chat.pickerSearchPlaceholder')}
              className="w-full rounded-[10px] bg-surface-2 py-2 pl-8 pr-2 text-[13px] text-ink outline-none placeholder:text-ink-3"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.map((l) => (
              <label key={l.id} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-1.5 hover:bg-surface-2">
                <input
                  type="checkbox"
                  checked={selected.has(l.id)}
                  onChange={() => toggle(l.id)}
                  className="h-4 w-4 accent-accent"
                />
                <Avatar name={l.full_name} src={l.photo_url} size={28} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{l.full_name || '—'}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-4 text-center text-[12.5px] text-ink-3">{t('chat.noLeads')}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={selected.size === 0 || forward.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent-grad py-3 text-[15px] font-semibold text-on-accent shadow-glow transition-all duration-150 ease-ios hover:brightness-[1.06] active:scale-[.98] disabled:opacity-40 disabled:shadow-none"
        >
          <CornerUpRight size={17} />
          {t('chat.forwardAction').replace('{n}', String(selected.size))}
        </button>
      </div>
    </Modal>
  )
}
