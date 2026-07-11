import { useMemo, useState } from 'react'
import { Megaphone, Search, Send, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { confirm } from '@/lib/confirm'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { Avatar } from '@/components/ui/Avatar'
import { useAudienceCount, useLeads, useSendBroadcast } from './useChat'
import type { Audience } from './types'

/** Компоновка и отправка массовой рассылки (с предпросмотром и подтверждением). */
export function BroadcastCompose({ onSent }: { onSent: () => void }) {
  const { t } = useT()
  const [audience, setAudience] = useState<Audience>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [q, setQ] = useState('')
  const [body, setBody] = useState('')
  const selectedIds = useMemo(() => [...selected], [selected])

  const isSelected = audience === 'selected'
  const leadsQ = useLeads(isSelected)
  // Для «выбранных» число получателей = размер набора (все они — валидные лиды из
  // useLeads), поэтому RPC не дёргаем на каждый чекбокс; для остальных — считаем на БД.
  const countQ = useAudienceCount(audience, selectedIds, !isSelected)
  const send = useSendBroadcast()
  const count = isSelected ? selected.size : countQ.data ?? 0

  const AUD: { key: Audience; label: string }[] = [
    { key: 'all', label: t('bc.all') },
    { key: 'active', label: t('bc.active') },
    { key: 'inactive', label: t('bc.inactive') },
    { key: 'selected', label: t('bc.selected') },
  ]

  const filteredLeads = useMemo(() => {
    const n = q.trim().toLowerCase()
    return (leadsQ.data ?? []).filter(
      (l) =>
        !n ||
        (l.full_name ?? '').toLowerCase().includes(n) ||
        (l.phone ?? '').toLowerCase().includes(n),
    )
  }, [leadsQ.data, q])

  function toggleLead(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function submit() {
    const text = body.trim()
    if (!text || count === 0) return
    const ok = await confirm({
      title: t('bc.confirmTitle'),
      message: t('bc.confirmMsg').replace('{n}', String(count)),
      confirmLabel: t('bc.send'),
      danger: true,
    })
    if (!ok) return
    send.mutate(
      { audience, leadIds: selectedIds, body: text },
      {
        onSuccess: (res) => {
          toast.success(
            t('bc.sentToast').replace('{d}', String(res.delivered)).replace('{e}', String(res.errors)),
          )
          setBody('')
          setSelected(new Set())
          onSent()
        },
      },
    )
  }

  return (
    <div className="space-y-3.5">
      {/* Аудитория */}
      <div>
        <div className="mb-1.5 text-[12.5px] font-semibold text-ink-2">{t('bc.audience')}</div>
        <div className="grid grid-cols-2 gap-1.5">
          {AUD.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setAudience(a.key)}
              className={cn(
                'rounded-[12px] px-3 py-2 text-[13px] font-semibold transition-colors',
                audience === a.key
                  ? 'bg-accent-grad text-on-accent shadow-glow'
                  : 'bg-surface-2 text-ink-2 hover:text-ink',
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Пикер резидентов (для «Выбрать») */}
      {audience === 'selected' && (
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
          <div className="max-h-44 overflow-y-auto p-1">
            {filteredLeads.map((l) => (
              <label key={l.id} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-1.5 hover:bg-surface-2">
                <input
                  type="checkbox"
                  checked={selected.has(l.id)}
                  onChange={() => toggleLead(l.id)}
                  className="h-4 w-4 accent-accent"
                />
                <Avatar name={l.full_name} src={l.photo_url} size={28} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{l.full_name || '—'}</span>
              </label>
            ))}
            {filteredLeads.length === 0 && (
              <p className="px-2 py-4 text-center text-[12.5px] text-ink-3">{t('chat.noLeads')}</p>
            )}
          </div>
        </div>
      )}

      {/* Счётчик получателей */}
      <div className="flex items-center gap-2 rounded-[12px] bg-accent-soft px-3 py-2 text-[13px] font-semibold text-accent">
        <Users size={16} />
        {t('bc.recipients')}: {count}
      </div>

      {/* Сообщение */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder={t('bc.messagePlaceholder')}
        className="w-full resize-none rounded-[14px] bg-surface-2 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent-ring"
      />

      {/* Предпросмотр */}
      <div>
        <div className="mb-1.5 text-[12.5px] font-semibold text-ink-2">{t('bc.preview')}</div>
        <div className="flex justify-end rounded-[14px] bg-bg-grad p-3">
          <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-accent-grad px-3.5 py-2 text-on-accent shadow-sh1">
            <div className="mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-white/80">
              <Megaphone size={11} /> {t('bc.badge')}
            </div>
            <div className="whitespace-pre-wrap break-words text-[14px] leading-relaxed">
              {body.trim() || t('bc.messagePlaceholder')}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!body.trim() || count === 0 || send.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-accent-grad py-3 text-[15px] font-semibold text-on-accent shadow-glow transition-all duration-150 ease-ios hover:brightness-[1.06] active:scale-[.98] disabled:opacity-40 disabled:shadow-none"
      >
        <Send size={17} />
        {send.isPending ? t('bc.sending') : t('bc.sendTo').replace('{n}', String(count))}
      </button>
    </div>
  )
}
