import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { GlobalSearch } from '@/features/users/GlobalSearch'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { navForRole } from './nav'

// Позиция активной вкладки на прошлом экране. Живёт на уровне модуля, т.к. у нас
// нет общего layout — каждая страница монтирует свой AppShell заново, и без этого
// капля не знала бы, откуда «перетечь».
let lastNavIndex = -1

const centerPct = (index: number, count: number) => ((index + 0.5) / count) * 100

export type NavItem = {
  to: string
  /** Ключ перевода подписи (см. i18n/dictionaries/nav). */
  labelKey: string
  icon: ReactNode
  count?: number
  match?: string
}

function isActive(item: NavItem, pathname: string) {
  return (
    item.to === pathname || (item.match ? pathname.startsWith(item.match) : false)
  )
}

/**
 * Каркас CRM (светлая тема «Ocean Light»): на планшете/десктопе — белый сайдбар;
 * на телефоне — «жидкий» нижний таб-бар: активная вкладка — круглый пузырёк
 * с океановым градиентом, «выныривающий» из бара; при переключении выемка и
 * пузырёк плавно переливаются к новой кнопке.
 */
export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  const { profile, role, signOut } = useAuth()
  const { pathname } = useLocation()
  const { t } = useT()
  const name = profile?.full_name || profile?.login || t('common.userFallback')
  const roleLabel =
    role === 'admin'
      ? t('common.role.admin')
      : role === 'developer'
        ? t('common.role.developer')
        : t('common.role.user')
  const initials = (name.trim()[0] ?? 'U').toUpperCase()
  // Меню определяется РОЛЬЮ (единый источник — navForRole), а не страницей.
  const fullNav = navForRole(role)

  // «Жидкий» таб-бар: центр активной вкладки в % ширины бара.
  const activeIndex = fullNav.findIndex((item) => isActive(item, pathname))
  const targetX = activeIndex >= 0 ? centerPct(activeIndex, fullNav.length) : -25
  const activeItem = activeIndex >= 0 ? fullNav[activeIndex] : null

  // Стартуем каплю с прошлой позиции и на следующем кадре едем к новой — так
  // при переходе на другую страницу она «перетекает», а не прыгает.
  const startX =
    lastNavIndex >= 0 && activeIndex >= 0 ? centerPct(lastNavIndex, fullNav.length) : targetX
  const [renderX, setRenderX] = useState(startX)
  useEffect(() => {
    const id = requestAnimationFrame(() => setRenderX(targetX))
    return () => cancelAnimationFrame(id)
  }, [targetX])
  useEffect(() => {
    lastNavIndex = activeIndex
  }, [activeIndex])

  return (
    <div className="flex min-h-full">
      {/* Сайдбар — планшет/десктоп (md+) */}
      <div className="sticky top-0 hidden h-screen md:block">
        <aside className="flex h-full w-[216px] flex-none flex-col overflow-y-auto border-r border-line bg-surface px-4 pb-[max(22px,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pt-[max(22px,env(safe-area-inset-top))] lg:w-[248px]">
          <div className="flex items-center gap-[11px] px-2.5 pb-[22px]">
            {/* Логотип — белый знак на чипе с океановым градиентом */}
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] bg-accent-grad shadow-glow">
              <img
                src={`${import.meta.env.BASE_URL}logo/logo-light.svg`}
                alt="Tijorat & Rushd"
                className="h-5 w-auto"
              />
            </span>
            <div>
              <div className="text-[14.5px] font-extrabold leading-tight text-ink">
                Tijorat &amp; Rushd
              </div>
              <div className="font-mono text-[9.5px] tracking-wider text-ink-3">CRM</div>
            </div>
          </div>

          <div className="mb-2" />
          {(role === 'admin' || role === 'developer') && <GlobalSearch />}
          <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[.12em] text-ink-3">
            {t('common.menu')}
          </div>
          <nav className="flex flex-col gap-0.5">
            {fullNav.map((item) => {
              const active = isActive(item, pathname)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13.5px] transition-all duration-150 ease-kit active:scale-[0.98]',
                    active
                      ? 'bg-accent-soft font-semibold text-accent'
                      : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink',
                  )}
                >
                  <span className="flex h-[15px] w-[15px] items-center justify-center">
                    {item.icon}
                  </span>
                  {t(item.labelKey)}
                  {item.count != null && (
                    <span className="ml-auto rounded-full bg-surface-3 px-[7px] py-px font-mono text-[11px] text-ink-2">
                      {item.count}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex items-center gap-[11px] rounded-[14px] border border-line bg-surface-2 p-2.5">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-grad text-[13px] font-extrabold text-on-accent">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">{name}</div>
              <div className="text-[11px] text-ink-3">{roleLabel}</div>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label={t('common.signOut')}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-ink-3 transition-colors hover:bg-surface-3 hover:text-danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-[var(--header-bg)] pb-5 pl-5 pr-[92px] pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-xl sm:gap-4 sm:pl-8 sm:pr-[112px]">
          <div className="min-w-0">
            <h1 className="truncate text-[21px] font-bold tracking-tight text-ink sm:text-[27px]">
              {title}
            </h1>
            {subtitle && (
              <div className="mt-0.5 truncate text-[13px] text-ink-3">{subtitle}</div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <NotificationBell />
            {action}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-5 pt-7 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-8 md:pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          <div className="animate-rise">{children}</div>
        </main>
      </div>

      {/* «Жидкий» таб-бар — телефон (< md) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden">
        {/* Пузырёк активной вкладки — «выныривает» из выемки бара */}
        <div
          className="pointer-events-none absolute top-0 z-10 transition-[left] duration-[500ms] ease-[cubic-bezier(.33,1,.68,1)]"
          style={{ left: `${renderX}%` }}
        >
          <div
            key={activeItem?.to ?? 'none'}
            className={cn(
              'drop-liquid flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-[55%] items-center justify-center rounded-full bg-accent-grad text-on-accent shadow-glow transition-opacity duration-200',
              activeItem ? 'opacity-100' : 'opacity-0',
            )}
          >
            {activeItem && (
              <span
                key={activeItem.to}
                className="flex animate-pop items-center justify-center [&>svg]:h-[22px] [&>svg]:w-[22px]"
              >
                {activeItem.icon}
              </span>
            )}
          </div>
        </div>

        {/* Бар с плавно переливающейся выемкой (mask + @property --notch-x) */}
        <div
          className="liquid-bar flex bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(16,24,40,.09)]"
          style={{ '--notch-x': `${renderX}%` } as CSSProperties}
        >
          {fullNav.map((item) => {
            const active = isActive(item, pathname)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'group relative flex h-[62px] flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors duration-200 ease-kit',
                  active ? 'text-accent' : 'text-ink-3 active:scale-90',
                )}
              >
                {/* Иконка в ряду: активная скрыта — она «уплыла» в пузырёк */}
                <span
                  className={cn(
                    'flex h-6 items-center justify-center transition-all duration-200 [&>svg]:h-[21px] [&>svg]:w-[21px]',
                    active
                      ? 'scale-50 opacity-0'
                      : 'scale-100 opacity-100 group-active:scale-90',
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    'max-w-full truncate px-1 transition-all duration-200',
                    active ? 'translate-y-1.5 font-semibold' : 'font-medium',
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
