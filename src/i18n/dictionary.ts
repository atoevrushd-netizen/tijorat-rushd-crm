import type { Lang } from './types'
import common from './dictionaries/common'
import auth from './dictionaries/auth'
import nav from './dictionaries/nav'
import users from './dictionaries/users'
import settings from './dictionaries/settings'
import survey from './dictionaries/survey'
import razbor from './dictionaries/razbor'
import autotasks from './dictionaries/autotasks'

export type Bundle = Record<Lang, Record<string, string>>

// Все словари объединяются в один плоский справочник ключ→перевод.
// Новые разделы добавляются как отдельные файлы в ./dictionaries и импортируются здесь.
const bundles: Bundle[] = [common, auth, nav, users, settings, survey, razbor, autotasks]

const dictionary: Bundle = { tg: {}, ru: {} }
for (const b of bundles) {
  Object.assign(dictionary.tg, b.tg)
  Object.assign(dictionary.ru, b.ru)
}

export { dictionary }
