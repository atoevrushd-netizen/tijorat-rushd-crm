import type { Profile } from '@/types'

/** Параметры выборки списка пользователей. */
export type UsersQuery = {
  search: string
  page: number // нумерация с 1
  pageSize: number
}

/** Страница списка пользователей. */
export type UsersPage = {
  items: Profile[]
  total: number
}
