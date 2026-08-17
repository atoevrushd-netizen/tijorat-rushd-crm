import type { ChatMessage } from './types'

/** Краткий текст сообщения (текст, либо метка файла/голосового) — для баннеров/предпросмотра. */
export function messagePreview(m: ChatMessage, t: (k: string) => string): string {
  if (m.deleted_at) return t('chat.messageDeleted')
  if (m.kind === 'voice') return `🎙 ${t('chat.recordVoice')}`
  if (m.kind === 'file') return `📎 ${m.body || m.attachment_name || t('chat.file')}`
  return m.body || t('chat.file')
}

/** Время сообщения ЧЧ:ММ. */
export function timeHM(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Ключ дня YYYY-MM-DD в ЛОКАЛЬНОМ времени (iso.slice(0,10) дал бы UTC-день: сообщения
 *  ночью 00:00–05:00 по Душанбе уезжали бы во «вчера»). */
export function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Короткое «когда» для списка диалогов: сегодня — ЧЧ:ММ, иначе — ДД.ММ (вчера тоже датой). */
export function shortWhen(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (dayKey(iso) === dayKey(new Date().toISOString())) return timeHM(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}
