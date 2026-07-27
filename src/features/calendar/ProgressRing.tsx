import { useId, type ReactNode } from 'react'

/**
 * Кольцо прогресса (SVG). value 0..1. tone='success' — зелёное (месяц выполнен),
 * иначе океановый градиент. Уникальный id градиента на экземпляр (без коллизий).
 */
export function ProgressRing({
  size = 120,
  stroke = 10,
  value,
  tone = 'accent',
  children,
}: {
  size?: number
  stroke?: number
  value: number
  tone?: 'accent' | 'success'
  children?: ReactNode
}) {
  const gid = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, value)) * c

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-2)" />
            <stop offset="58%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-600)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-3" />
        {/* Дугу рисуем только при ненулевом прогрессе — иначе round-cap оставляет точку на 0%. */}
        {dash > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={tone === 'success' ? 'var(--success)' : `url(#${gid})`}
            strokeDasharray={`${dash} ${c}`}
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
        )}
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">{children}</div>}
    </div>
  )
}
