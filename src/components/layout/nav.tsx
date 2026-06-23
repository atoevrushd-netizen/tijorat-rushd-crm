import { LayoutDashboard, LayoutGrid, Settings, Users } from 'lucide-react'
import type { NavItem } from './AppShell'

/** Навигация админ-разделов. */
export const adminNav: NavItem[] = [
  { to: '/admin', label: 'Дашборд', icon: <LayoutDashboard size={15} /> },
  { to: '/admin/users', label: 'Пользователи', match: '/admin/users', icon: <Users size={15} /> },
  { to: '/admin/tabs', label: 'Вкладки', icon: <LayoutGrid size={15} /> },
  { to: '/settings', label: 'Настройки', icon: <Settings size={15} /> },
]

/** Навигация личного кабинета. */
export const userNav: NavItem[] = [
  { to: '/cabinet', label: 'Мой кабинет', icon: <LayoutDashboard size={15} /> },
  { to: '/settings', label: 'Настройки', icon: <Settings size={15} /> },
]
