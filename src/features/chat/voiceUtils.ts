/** «0:05» / «1:23» — длительность в м:сс. */
export function formatDuration(sec: number | null | undefined): string {
  const s = Math.max(0, Math.floor(sec ?? 0))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Поддерживаемый MediaRecorder mime (Chrome/FF: webm/opus; Safari: mp4). */
export function pickAudioMime(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c
    } catch {
      /* некоторые браузеры кидают — игнорируем */
    }
  }
  return ''
}

type AudioCtor = typeof AudioContext
function getAudioContext(): AudioContext {
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor }
  const Ctor = w.AudioContext ?? w.webkitAudioContext
  if (!Ctor) throw new Error('no AudioContext')
  return new Ctor()
}

/** Декодировать записанное аудио → длительность + N нормализованных пиков (для волны). */
export async function computePeaks(
  blob: Blob,
  bars = 44,
): Promise<{ duration: number; peaks: number[] }> {
  try {
    const buf = await blob.arrayBuffer()
    const ctx = getAudioContext()
    const audio = await ctx.decodeAudioData(buf)
    const ch = audio.getChannelData(0)
    const block = Math.max(1, Math.floor(ch.length / bars))
    const raw: number[] = []
    for (let i = 0; i < bars; i++) {
      let sum = 0
      for (let j = 0; j < block; j++) {
        const v = ch[i * block + j] ?? 0
        sum += v * v
      }
      raw.push(Math.sqrt(sum / block))
    }
    const max = Math.max(...raw, 0.0001)
    const peaks = raw.map((p) => Math.min(1, Math.max(0.05, p / max)))
    const duration = audio.duration
    void ctx.close()
    return { duration, peaks }
  } catch {
    // Не удалось декодировать (напр. Safari+webm) — ровная волна, длительность 0.
    return { duration: 0, peaks: Array.from({ length: bars }, () => 0.3) }
  }
}
