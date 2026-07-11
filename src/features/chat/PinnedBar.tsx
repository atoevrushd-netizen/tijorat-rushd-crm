import { useState } from 'react'
import { Pin, X } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { messagePreview } from './chatFormat'
import type { ChatMessage } from './types'

/**
 * Баннер закреплённых сообщений над лентой (виден и лиду, и админу). Клик —
 * переход к сообщению и переключение на следующее закреплённое (как в Telegram).
 * Открепить может только админ.
 */
export function PinnedBar({
  pinned,
  isAdmin,
  onJump,
  onUnpin,
}: {
  pinned: ChatMessage[]
  isAdmin: boolean
  onJump: (id: string) => void
  onUnpin: (id: string) => void
}) {
  const { t } = useT()
  const [idx, setIdx] = useState(0)
  if (pinned.length === 0) return null

  const i = Math.min(idx, pinned.length - 1)
  const cur = pinned[i]

  function activate() {
    onJump(cur.id)
    if (pinned.length > 1) setIdx((v) => (v + 1) % pinned.length)
  }

  return (
    <div className="flex flex-none items-center gap-2 border-b border-line bg-surface px-3 py-1.5 sm:px-4">
      <Pin size={15} className="flex-none text-accent" />
      <button type="button" onClick={activate} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent">
          {t('chat.pinnedMessage')}
          {pinned.length > 1 && <span className="text-ink-3">{i + 1}/{pinned.length}</span>}
        </div>
        <div className="truncate text-[12.5px] text-ink-2">{messagePreview(cur, t)}</div>
      </button>
      {isAdmin && (
        <button
          type="button"
          onClick={() => onUnpin(cur.id)}
          aria-label={t('chat.unpinMessage')}
          title={t('chat.unpinMessage')}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
