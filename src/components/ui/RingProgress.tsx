import { useEffect, useId, useState } from 'react'

/**
 * Кольцевой прогресс в стиле iOS (Activity ring): градиентная дуга,
 * плавная дорисовка, скруглённые концы, число по центру.
 */
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
  const gid = useId()
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
        <defs>
          {/* Стопы совпадают с системным --accent-grad (светлый край → океан) */}
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-2)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
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
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(.32,.72,0,1)',
            filter: 'drop-shadow(0 0 6px rgba(46,124,246,.3))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <div className="text-[26px] font-bold leading-none tracking-tight text-ink">
            {label}
          </div>
        )}
        {sublabel && <div className="mt-1 text-[11px] text-ink-3">{sublabel}</div>}
      </div>
    </div>
  )
}
