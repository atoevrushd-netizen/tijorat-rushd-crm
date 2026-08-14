import type { Profile } from '@/types'

/** Параметры выборки списка пользователей. */
export type UsersQuery = {
  search: string
  page: number // нумерация с 1
  pageSize: number
  /** true — показывать «Корзину» (удалённых), false/undefined — активных. */
  trashed?: boolean
  /** Фильтр по метке плана: 3 | 6 месяцев; undefined — все. */
  plan?: number
  /** true — только «оплатившие полностью» (paid_at задан). */
  paid?: boolean
}

/** Страница списка пользователей. */
export type UsersPage = {
  items: Profile[]
  total: number
}
