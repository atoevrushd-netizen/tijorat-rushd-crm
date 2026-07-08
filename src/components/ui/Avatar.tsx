import { cn } from '@/lib/utils'
import { initials } from '@/lib/initials'

type AvatarProps = {
  name: string | null
  src?: string | null
  size?: number
  className?: string
}

/** Аватар: squircle. Фото — или инициалы на океановом градиенте (по киту). */
export function Avatar({ name, src, size = 40, className = '' }: AvatarProps) {
  const radius = Math.round(size * 0.28) // squircle, не круг

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={cn('object-cover', className)}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center font-extrabold text-on-accent',
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: Math.round(size * 0.36),
        background: 'var(--accent-grad)',
      }}
    >
      {initials(name)}
    </div>
  )
}
