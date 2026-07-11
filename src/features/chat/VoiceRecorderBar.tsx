import { useEffect, useRef, useState } from 'react'
import { Check, Mic, Pause, Play, Send, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { useVoiceRecorder, type VoiceResult } from './useVoiceRecorder'
import { formatDuration } from './voiceUtils'

// Фиксированный «профиль» столбиков для живой визуализации записи.
const W = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.55, 0.8, 0.45, 0.95, 0.6, 0.75, 0.5, 0.85, 0.65, 0.4, 0.9, 0.55, 0.7, 0.5]

/** Панель записи голосового: запись/пауза → предпрослушивание → отправка. */
export function VoiceRecorderBar({
  onSend,
  onCancel,
  sending,
}: {
  onSend: (r: VoiceResult) => void
  onCancel: () => void
  sending: boolean
}) {
  const { t } = useT()
  const rec = useVoiceRecorder()
  const started = useRef(false)

  useEffect(() => {
    if (!started.current) {
      started.current = true
      void rec.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (rec.error) {
    return (
      <div className="flex items-center gap-2 rounded-[16px] bg-danger-soft px-3 py-2.5">
        <Mic size={16} className="flex-none text-danger" />
        <span className="flex-1 text-[13px] font-medium text-danger">{t('chat.micDenied')}</span>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[10px] px-2.5 py-1 text-[13px] font-semibold text-ink-2 hover:bg-surface-2"
        >
          {t('common.cancel')}
        </button>
      </div>
    )
  }

  // Готовая запись — предпрослушивание + отправка. «Удалить» — назад к вводу.
  if (rec.status === 'recorded' && rec.result) {
    return <Preview result={rec.result} onSend={onSend} onDelete={onCancel} sending={sending} />
  }

  const recording = rec.status === 'recording'
  return (
    <div className="flex items-center gap-2 rounded-[16px] bg-surface-2 px-2.5 py-2">
      <button
        type="button"
        onClick={onCancel}
        aria-label={t('common.cancel')}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-danger hover:bg-danger-soft"
      >
        <Trash2 size={18} />
      </button>

      <span className={cn('h-2.5 w-2.5 flex-none rounded-full bg-danger', recording && 'animate-pulse')} />
      <span className="flex-none font-mono text-[13px] font-semibold text-ink tabular-nums">
        {formatDuration(rec.elapsed)}
      </span>

      <div className="flex h-8 flex-1 items-center justify-center gap-[3px] overflow-hidden">
        {W.map((w, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-accent transition-[height] duration-100"
            style={{ height: `${Math.round(4 + (recording ? rec.level : 0) * 26 * w + w * 3)}px` }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={recording ? rec.pause : rec.resume}
        aria-label={recording ? t('chat.pause') : t('chat.resume')}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-ink-2 hover:bg-surface-3"
      >
        {recording ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </button>

      <button
        type="button"
        onClick={rec.stop}
        aria-label={t('chat.stopRec')}
        className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-grad text-on-accent shadow-glow"
      >
        <Check size={18} />
      </button>
    </div>
  )
}

function Preview({
  result,
  onSend,
  onDelete,
  sending,
}: {
  result: VoiceResult
  onSend: (r: VoiceResult) => void
  onDelete: () => void
  sending: boolean
}) {
  const { t } = useT()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (playing) a.pause()
    else void a.play()
  }

  return (
    <div className="flex items-center gap-2 rounded-[16px] bg-surface-2 px-2.5 py-2">
      <audio
        ref={audioRef}
        src={result.url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label={t('chat.deleteRec')}
        disabled={sending}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-danger hover:bg-danger-soft disabled:opacity-50"
      >
        <Trash2 size={18} />
      </button>

      <button
        type="button"
        onClick={toggle}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-soft text-accent"
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div className="flex h-8 flex-1 items-center gap-[2px]">
        {result.peaks.map((p, i) => (
          <span key={i} className="w-[3px] flex-1 rounded-full bg-accent/60" style={{ height: `${Math.round(6 + p * 22)}px` }} />
        ))}
      </div>

      <span className="flex-none font-mono text-[12px] text-ink-3 tabular-nums">
        {formatDuration(result.duration)}
      </span>

      <button
        type="button"
        onClick={() => onSend(result)}
        disabled={sending}
        aria-label={t('chat.send')}
        className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-grad text-on-accent shadow-glow disabled:opacity-50"
      >
        <Send size={18} />
      </button>
    </div>
  )
}
