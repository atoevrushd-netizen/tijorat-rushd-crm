import { useCallback, useEffect, useRef, useState } from 'react'
import { computePeaks, pickAudioMime } from './voiceUtils'

export type VoiceResult = {
  blob: Blob
  url: string
  mime: string
  duration: number
  peaks: number[]
}
export type RecorderStatus = 'idle' | 'recording' | 'paused' | 'processing' | 'recorded'

/**
 * Запись голосового сообщения: старт/пауза/продолжение/стоп, живой уровень
 * (для анимации), результат с волной. Всё чистится при размонтировании.
 */
export function useVoiceRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [level, setLevel] = useState(0)
  const [result, setResult] = useState<VoiceResult | null>(null)
  const [error, setError] = useState(false)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accMsRef = useRef(0)
  const startedAtRef = useRef(0)
  const mimeRef = useRef('')
  const mountedRef = useRef(true)

  const stopMeters = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
    rafRef.current = null
    tickRef.current = null
  }, [])

  const teardown = useCallback(() => {
    stopMeters()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    analyserRef.current = null
    recorderRef.current = null
  }, [stopMeters])

  const runMeters = useCallback(() => {
    const analyser = analyserRef.current
    const data = analyser ? new Uint8Array(analyser.fftSize) : null
    const loop = () => {
      if (analyser && data) {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 2.5))
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    tickRef.current = setInterval(() => {
      const live = performance.now() - startedAtRef.current
      setElapsed((accMsRef.current + live) / 1000)
    }, 200)
  }, [])

  const start = useCallback(async () => {
    setError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Компонент размонтировали, пока ждали разрешение — отпускаем микрофон и выходим.
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      const mime = pickAudioMime()
      mimeRef.current = mime
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      recorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = async () => {
        setStatus('processing')
        const type = mimeRef.current || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        const { duration, peaks } = await computePeaks(blob)
        teardown()
        // Размонтировали во время обработки — не создаём «висячий» object URL.
        if (!mountedRef.current) return
        setResult({ blob, url: URL.createObjectURL(blob), mime: type, duration, peaks })
        setStatus('recorded')
      }

      // Анализатор для живого уровня.
      const Ctx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      const ctx = new Ctx()
      audioCtxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      src.connect(analyser)
      analyserRef.current = analyser

      accMsRef.current = 0
      startedAtRef.current = performance.now()
      setElapsed(0)
      rec.start(100)
      setStatus('recording')
      runMeters()
    } catch {
      setError(true)
      teardown()
      setStatus('idle')
    }
  }, [runMeters, teardown])

  const pause = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state === 'recording') {
      rec.pause()
      accMsRef.current += performance.now() - startedAtRef.current
      stopMeters()
      setLevel(0)
      setStatus('paused')
    }
  }, [stopMeters])

  const resume = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state === 'paused') {
      rec.resume()
      startedAtRef.current = performance.now()
      setStatus('recording')
      runMeters()
    }
  }, [runMeters])

  const stop = useCallback(() => {
    const rec = recorderRef.current
    stopMeters()
    if (rec && rec.state !== 'inactive') rec.stop()
  }, [stopMeters])

  const reset = useCallback(() => {
    // Снимаем onstop, чтобы отложенная обработка не «воскресила» результат после сброса.
    if (recorderRef.current) recorderRef.current.onstop = null
    stop()
    teardown()
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url)
      return null
    })
    setElapsed(0)
    setLevel(0)
    setStatus('idle')
  }, [stop, teardown])

  // Полная очистка при размонтировании.
  useEffect(
    () => () => {
      mountedRef.current = false
      teardown()
      setResult((r) => {
        if (r) URL.revokeObjectURL(r.url)
        return null
      })
    },
    [teardown],
  )

  return { status, elapsed, level, result, error, start, pause, resume, stop, reset }
}
