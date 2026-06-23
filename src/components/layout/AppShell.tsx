import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/useAuth'

export type NavItem = {
  to: string
  label: string
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
 * Каркас CRM: на планшете/десктопе — боковое меню (сайдбар);
 * на телефоне — нижняя навигация (таб-бар, как в нативных приложениях).
 */
export function AppShell({
  title,
  subtitle,
  nav,
  action,
  children,
}: {
  title: string
  subtitle?: string
  nav: NavItem[]
  action?: ReactNode
  children: ReactNode
}) {
  const { profile, role, signOut } = useAuth()
  const { pathname } = useLocation()
  const name = profile?.full_name || profile?.login || 'Пользователь'
  const roleLabel = role === 'admin' ? 'Администратор' : 'Пользователь'
  const initials = (name.trim()[0] ?? 'U').toUpperCase()

  return (
    <div className="flex min-h-full">
      {/* Сайдбар — планшет/десктоп (md+) */}
      <div className="sticky top-0 hidden h-screen md:block">
        <aside className="flex h-full w-[216px] flex-none flex-col overflow-y-auto border-r border-line bg-[#0c0d0f] px-4 pb-[max(22px,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pt-[max(22px,env(safe-area-inset-top))] lg:w-[248px]">
          <div className="flex items-center gap-[11px] px-2.5 pb-[22px]">
            <img src="/logo/logo-light.svg" alt="Tijorat & Rushd" className="h-7 w-auto" />
            <div>
              <div className="text-[14.5px] font-extrabold leading-tight text-ink">
                Tijorat &amp; Rushd
              </div>
              <div className="font-mono text-[9.5px] tracking-wider text-ink-3">CRM</div>
            </div>
          </div>

          <div className="mb-2" />
          <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[.12em] text-ink-3">
            Меню
          </div>
          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => {
              const active = isActive(item, pathname)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] transition-all duration-150 ease-kit active:scale-[0.98]',
                    active
                      ? 'bg-accent-soft font-semibold text-accent'
                      : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink',
                  )}
                >
                  <span className="flex h-[15px] w-[15px] items-center justify-center">
                    {item.icon}
                  </span>
                  {item.label}
                  {item.count != null && (
                    <span className="ml-auto rounded-full bg-surface-3 px-[7px] py-px font-mono text-[11px] text-ink-2">
                      {item.count}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex items-center gap-[11px] rounded-md border border-line bg-surface p-2.5">
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-[13px] font-extrabold text-on-accent"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">{name}</div>
              <div className="text-[11px] text-ink-3">{roleLabel}</div>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Выйти"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-[rgba(11,12,14,.85)] px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-md sm:gap-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-ink sm:text-[22px]">
              {title}
            </h1>
            {subtitle && (
              <div className="mt-0.5 truncate text-[13px] text-ink-3">{subtitle}</div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">{action}</div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-5 pt-7 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:px-8 md:pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          <div className="animate-rise">{children}</div>
        </main>
      </div>

      {/* Нижняя навигация — телефон (< md), как в нативных приложениях */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-[rgba(11,12,14,.92)] pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
        {nav.map((item) => {
          const active = isActive(item, pathname)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors duration-200 active:scale-95',
                active ? 'text-accent' : 'text-ink-3',
              )}
            >
              <span
                className={cn(
                  'absolute top-0 h-[3px] rounded-b-full bg-accent transition-all duration-300 ease-kit',
                  active ? 'w-7 opacity-100' : 'w-0 opacity-0',
                )}
              />
              <span
                className={cn(
                  'flex h-6 items-center justify-center transition-transform duration-200 [&>svg]:h-[21px] [&>svg]:w-[21px]',
                  active ? 'scale-110' : 'group-active:scale-90',
                )}
              >
                {item.icon}
              </span>
              <span className="max-w-full truncate px-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
