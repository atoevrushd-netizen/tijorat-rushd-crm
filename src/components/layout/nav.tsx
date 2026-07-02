import {
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  Users,
} from 'lucide-react'
import type { NavItem } from './AppShell'

/** Навигация админ-разделов. Подписи — ключи перевода (см. i18n/dictionaries/nav). */
export const adminNav: NavItem[] = [
  { to: '/admin', labelKey: 'nav.dashboard', icon: <LayoutDashboard size={15} /> },
  { to: '/admin/users', labelKey: 'nav.users', match: '/admin/users', icon: <Users size={15} /> },
  { to: '/answers', labelKey: 'nav.answers', match: '/answers', icon: <ClipboardList size={15} /> },
  { to: '/admin/tabs', labelKey: 'nav.tabs', icon: <LayoutGrid size={15} /> },
  { to: '/settings', labelKey: 'nav.settings', icon: <Settings size={15} /> },
]

/** Навигация личного кабинета. */
export const userNav: NavItem[] = [
  { to: '/cabinet', labelKey: 'nav.myCabinet', icon: <LayoutDashboard size={15} /> },
  { to: '/answers', labelKey: 'nav.answers', match: '/answers', icon: <ClipboardList size={15} /> },
  { to: '/settings', labelKey: 'nav.settings', icon: <Settings size={15} /> },
]
