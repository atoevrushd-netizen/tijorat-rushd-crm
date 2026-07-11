/** Человекочитаемый размер файла. */
export function formatSize(bytes: number | null | undefined): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

export type FileKind = 'image' | 'video' | 'audio' | 'doc'

/** Категория файла по mime (для превью/иконки). */
export function fileKind(mime: string | null | undefined): FileKind {
  const m = mime ?? ''
  if (m.startsWith('image/')) return 'image'
  if (m.startsWith('video/')) return 'video'
  if (m.startsWith('audio/')) return 'audio'
  return 'doc'
}

/**
 * Безопасно ли показывать файл встроенно (inline). Растровые картинки, видео и
 * аудио — да. SVG/HTML/прочее открываем ТОЛЬКО как скачивание (Content-Disposition:
 * attachment), иначе HTML/SVG со скриптом мог бы выполниться при открытии в новой вкладке.
 */
export function isInlineSafe(mime: string | null | undefined): boolean {
  const m = mime ?? ''
  return /^image\/(jpe?g|png|webp|gif|bmp)$/.test(m) || m.startsWith('video/') || m.startsWith('audio/')
}

/** Короткая метка формата (расширение или из mime). */
export function extLabel(name: string | null | undefined, mime?: string | null): string {
  const n = name ?? ''
  const dot = n.lastIndexOf('.')
  if (dot > 0 && dot < n.length - 1) return n.slice(dot + 1).toUpperCase().slice(0, 4)
  const m = mime ?? ''
  if (m.includes('pdf')) return 'PDF'
  return 'FILE'
}

/** Цвет плашки формата документа. */
export function docTone(ext: string): string {
  const e = ext.toLowerCase()
  if (e === 'pdf') return 'bg-red-500'
  if (['doc', 'docx', 'rtf'].includes(e)) return 'bg-blue-500'
  if (['xls', 'xlsx', 'csv'].includes(e)) return 'bg-emerald-500'
  if (['ppt', 'pptx'].includes(e)) return 'bg-orange-500'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return 'bg-amber-500'
  if (['psd', 'ai', 'xd', 'fig', 'sketch'].includes(e)) return 'bg-indigo-500'
  return 'bg-ink-3'
}
