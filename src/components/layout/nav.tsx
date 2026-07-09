import {
  CalendarClock,
  ClipboardList,
  FileText,
  IdCard,
  LayoutDashboard,
  Settings,
  Terminal,
  Users,
} from 'lucide-react'
import type { UserRole } from '@/types'
import type { NavItem } from './AppShell'

/** Пункт меню разработчика — добавляется в AppShell только для роли developer. */
export const devNavItem: NavItem = {
  to: '/dev',
  labelKey: 'nav.dev',
  match: '/dev',
  icon: <Terminal size={15} />,
}

/** Навигация админ-разделов. Подписи — ключи перевода (см. i18n/dictionaries/nav). */
export const adminNav: NavItem[] = [
  { to: '/admin', labelKey: 'nav.dashboard', icon: <LayoutDashboard size={15} /> },
  { to: '/admin/users', labelKey: 'nav.users', match: '/admin/users', icon: <Users size={15} /> },
  { to: '/answers', labelKey: 'nav.answers', match: '/answers', icon: <ClipboardList size={15} /> },
  { to: '/admin/auto-tasks', labelKey: 'nav.autotasks', icon: <CalendarClock size={15} /> },
  { to: '/settings', labelKey: 'nav.settings', icon: <Settings size={15} /> },
]

/** Навигация личного кабинета. Лид видит только свои ответы (в кабинете),
 * поэтому раздела «Ответы всех» здесь нет — он только у админа. */
export const userNav: NavItem[] = [
  { to: '/cabinet', labelKey: 'nav.myCabinet', icon: <LayoutDashboard size={15} /> },
  { to: '/my-data', labelKey: 'nav.myData', icon: <IdCard size={15} /> },
  { to: '/survey', labelKey: 'nav.mySurvey', icon: <ClipboardList size={15} /> },
  { to: '/razbor', labelKey: 'nav.razbor', icon: <FileText size={15} /> },
  { to: '/settings', labelKey: 'nav.settings', icon: <Settings size={15} /> },
]

/**
 * Меню по роли — единый источник правды (используется в AppShell).
 * Разработчик: админское меню + «Разработчик»; админ: только админское (без «Разработчик»);
 * лид (и неизвестная роль): только своё. Так ни одна страница не подменит чужое меню.
 */
export function navForRole(role: UserRole | null | undefined): NavItem[] {
  if (role === 'developer') return [...adminNav, devNavItem]
  if (role === 'admin') return adminNav
  return userNav
}
