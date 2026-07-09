import type { UserRole } from '@/types'

/**
 * Может ли роль управлять (админ-доступ): админ ИЛИ разработчик.
 * Разработчик — «супер-доступ»: везде, где проверяется админ, он тоже проходит.
 * Единый источник правды вместо разрозненных `role === 'admin'`.
 */
export function canManage(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'developer'
}

/** Разработчик (супер-доступ, управление ролями). */
export function isDeveloper(role: UserRole | null | undefined): boolean {
  return role === 'developer'
}
