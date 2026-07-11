import { useRef, useState, type MouseEvent } from 'react'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSignedUrl } from './useChat'
import { formatDuration } from './voiceUtils'
import type { ChatMessage } from './types'

const FALLBACK_PEAKS = Array.from({ length: 44 }, () => 0.3)

/** Плеер голосового сообщения: волна, play/pause, время, скорость, перемотка. */
export function VoicePlayer({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const { data: url } = useSignedUrl(message.attachment_path)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [rate, setRate] = useState(1)

  const peaks = message.attachment_meta?.peaks?.length ? message.attachment_meta.peaks : FALLBACK_PEAKS
  const metaDur = message.attachment_meta?.duration ?? 0
  const [audioDur, setAudioDur] = useState(0)
  const duration = metaDur || audioDur
  const progress = duration > 0 ? Math.min(1, cur / duration) : 0

  function toggle() {
    const a = audioRef.current
    if (!a || !url) return
    if (playing) {
      a.pause()
    } else {
      a.playbackRate = rate
      void a.play()
    }
  }

  function cycleRate() {
    const next = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1
    setRate(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    const a = audioRef.current
    if (!a || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    a.currentTime = frac * duration
    setCur(frac * duration)
  }

  const filledColor = mine ? 'bg-white' : 'bg-accent'
  const emptyColor = mine ? 'bg-white/40' : 'bg-ink-3/40'

  return (
    <div className="flex items-center gap-2.5">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setCur(0)
        }}
        onLoadedMetadata={(e) => {
          const a = e.currentTarget
          if (Number.isFinite(a.duration)) {
            setAudioDur(a.duration)
            return
          }
          // webm от MediaRecorder часто отдаёт Infinity — форсируем подсчёт длительности.
          const onSeeked = () => {
            a.removeEventListener('seeked', onSeeked)
            if (Number.isFinite(a.duration)) setAudioDur(a.duration)
            a.currentTime = 0
          }
          a.addEventListener('seeked', onSeeked)
          a.currentTime = 1e101
        }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className={cn(
          'flex h-9 w-9 flex-none items-center justify-center rounded-full',
          mine ? 'bg-white/20 text-white' : 'bg-accent-soft text-accent',
        )}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div
        onClick={seek}
        className="flex h-8 min-w-[120px] max-w-[180px] flex-1 cursor-pointer items-center gap-[2px]"
      >
        {peaks.map((p, i) => {
          const filled = i / peaks.length < progress
          return (
            <span
              key={i}
              className={cn('w-[3px] flex-1 rounded-full', filled ? filledColor : emptyColor)}
              style={{ height: `${Math.round(6 + p * 22)}px` }}
            />
          )
        })}
      </div>

      <div className="flex flex-none flex-col items-end gap-0.5">
        <span className={cn('font-mono text-[11px]', mine ? 'text-white/80' : 'text-ink-3')}>
          {formatDuration(playing || cur ? cur : duration)}
        </span>
        <button
          type="button"
          onClick={cycleRate}
          className={cn(
            'rounded-full px-1.5 py-px text-[10px] font-bold',
            mine ? 'bg-white/20 text-white' : 'bg-surface-2 text-ink-2',
          )}
        >
          {rate}×
        </button>
      </div>
    </div>
  )
}
