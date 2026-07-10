import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Pencil, Reply, Send, Smile, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { EMOJIS } from './emoji'
import { useEditMessage, useSendMessage } from './useChat'
import type { ChatMessage } from './types'

/** Ввод: текст (Enter=отправить, Shift+Enter=перенос), эмодзи, ответ/редактирование. */
export function Composer({
  conversationId,
  replyTo,
  editing,
  onClear,
}: {
  conversationId: string
  replyTo: ChatMessage | null
  editing: ChatMessage | null
  onClear: () => void
}) {
  const { t } = useT()
  const send = useSendMessage(conversationId)
  const edit = useEditMessage(conversationId)
  const [text, setText] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // При входе в режим редактирования — подставить текст; при выходе — очистить.
  useEffect(() => {
    setText(editing?.body ?? '')
    requestAnimationFrame(() => {
      taRef.current?.focus()
      grow()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id])

  useEffect(() => {
    if (replyTo) taRef.current?.focus()
  }, [replyTo])

  function grow() {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }

  function submit() {
    const body = text.trim()
    if (!body) return
    if (editing) {
      edit.mutate({ id: editing.id, body })
    } else {
      send.mutate({ body, tempId: crypto.randomUUID(), replyToId: replyTo?.id ?? null })
    }
    setText('')
    setEmojiOpen(false)
    onClear()
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = 'auto'
    })
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape' && (replyTo || editing)) onClear()
  }

  function addEmoji(emoji: string) {
    const ta = taRef.current
    const start = ta?.selectionStart ?? text.length
    const end = ta?.selectionEnd ?? text.length
    setText((prev) => prev.slice(0, start) + emoji + prev.slice(end))
    requestAnimationFrame(() => {
      ta?.focus()
      grow()
    })
  }

  const context = editing ?? replyTo
  const contextIsEdit = !!editing

  return (
    <div className="relative border-t border-line bg-surface px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4">
      {emojiOpen && (
        <div className="absolute bottom-[calc(100%+6px)] left-3 z-20 grid w-[288px] max-w-[calc(100vw-1.5rem)] animate-pop grid-cols-8 gap-1 rounded-[16px] border border-line bg-elevated p-2.5 shadow-sh2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => addEmoji(e)}
              className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[19px] transition-colors hover:bg-surface-2"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {context && (
        <div className="mb-2 flex items-center gap-2 rounded-[12px] border-l-[3px] border-accent bg-surface-2 py-1.5 pl-2.5 pr-2">
          {contextIsEdit ? <Pencil size={14} className="flex-none text-accent" /> : <Reply size={14} className="flex-none text-accent" />}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-accent">
              {contextIsEdit ? t('chat.editing') : t('chat.replyingTo')}
            </div>
            <div className="truncate text-[12.5px] text-ink-2">{context.body}</div>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label={t('common.cancel')}
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-ink-3 hover:bg-surface-3 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => setEmojiOpen((v) => !v)}
          aria-label={t('chat.emoji')}
          className={cn(
            'flex h-10 w-10 flex-none items-center justify-center rounded-[13px] transition-colors',
            emojiOpen ? 'bg-accent-soft text-accent' : 'text-ink-3 hover:bg-surface-2 hover:text-ink',
          )}
        >
          <Smile size={20} />
        </button>

        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            grow()
          }}
          onKeyDown={onKey}
          rows={1}
          placeholder={t('chat.messagePlaceholder')}
          className="max-h-[140px] min-h-[40px] flex-1 resize-none rounded-[16px] bg-surface-2 px-3.5 py-2.5 text-[14.5px] leading-relaxed text-ink outline-none transition placeholder:text-ink-3 focus:ring-2 focus:ring-accent-ring"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          aria-label={t('chat.send')}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-[13px] bg-accent-grad text-on-accent shadow-glow transition-all duration-150 ease-ios hover:brightness-[1.06] active:scale-90 disabled:opacity-40 disabled:shadow-none"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
