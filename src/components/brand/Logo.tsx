type LogoProps = {
  /** Высота логотипа в пикселях. */
  size?: number
  className?: string
}

/** Бренд-марка Tijorat & Rushd — светлый логотип без рамки/подложки. */
export function Logo({ size = 64, className = '' }: LogoProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo/logo-light.svg`}
      alt="Tijorat & Rushd"
      className={className}
      style={{ height: size, width: 'auto' }}
    />
  )
}
