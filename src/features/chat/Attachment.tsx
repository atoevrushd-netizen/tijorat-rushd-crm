import { Download, FileText, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { useSignedUrl } from './useChat'
import { docTone, extLabel, fileKind, formatSize, isInlineSafe } from './fileType'
import type { ChatMessage } from './types'

/** Рендер вложения сообщения: превью фото/видео/аудио или карточка документа. */
export function Attachment({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const { t } = useT()
  const name = message.attachment_name ?? t('chat.file')
  // Небезопасные для inline типы (SVG/HTML/документы) — только как скачивание.
  const dl = isInlineSafe(message.attachment_mime) ? undefined : name
  const { data: url, isLoading, isError } = useSignedUrl(message.attachment_path, dl)
  const kind = fileKind(message.attachment_mime)
  const ext = extLabel(message.attachment_name, message.attachment_mime)

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-[12px] bg-surface-2 px-3 py-2 text-[12.5px] text-ink-3">
        <ImageOff size={16} /> {t('chat.fileError')}
      </div>
    )
  }

  if (kind === 'image') {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        {url ? (
          <img
            src={url}
            alt={name}
            className="max-h-[320px] max-w-[260px] rounded-[12px] object-contain"
          />
        ) : (
          <div className="h-40 w-52 animate-pulse rounded-[12px] bg-surface-2" />
        )}
      </a>
    )
  }

  if (kind === 'video') {
    return url ? (
      <video src={url} controls className="max-h-[320px] max-w-[260px] rounded-[12px]" />
    ) : (
      <div className="h-40 w-52 animate-pulse rounded-[12px] bg-surface-2" />
    )
  }

  if (kind === 'audio') {
    return url ? (
      <audio src={url} controls className="w-[240px] max-w-full" />
    ) : (
      <div className="h-10 w-52 animate-pulse rounded-full bg-surface-2" />
    )
  }

  // Документ / архив / прочее
  return (
    <a
      href={url}
      download={name}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex min-w-[220px] max-w-[280px] items-center gap-3 rounded-[12px] p-2.5 transition-colors',
        mine ? 'bg-white/15 hover:bg-white/25' : 'bg-surface-2 hover:bg-surface-3',
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 flex-none items-center justify-center rounded-[11px] text-white',
          docTone(ext),
        )}
      >
        <FileText size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-[13px] font-semibold', mine ? 'text-white' : 'text-ink')}>
          {name}
        </span>
        <span className={cn('block text-[11.5px]', mine ? 'text-white/75' : 'text-ink-3')}>
          {ext} · {formatSize(message.attachment_size)}
        </span>
      </span>
      <span className={cn('flex-none', mine ? 'text-white/80' : 'text-ink-3')}>
        {isLoading ? <span className="text-[11px]">…</span> : <Download size={18} />}
      </span>
    </a>
  )
}
