import { useEffect, useState } from 'react'

/** Кольцевой прогресс (donut): лаймовая дуга, плавная дорисовка, текст по центру. */
export function RingProgress({
  value,
  size = 120,
  stroke = 12,
  label,
  sublabel,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
}) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setOffset(circumference - (clamped / 100) * circumference),
    )
    return () => cancelAnimationFrame(id)
  }, [circumference, clamped])

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <div className="font-mono text-[24px] font-extrabold leading-none text-ink">
            {label}
          </div>
        )}
        {sublabel && <div className="mt-1 text-[11px] text-ink-3">{sublabel}</div>}
      </div>
    </div>
  )
}
