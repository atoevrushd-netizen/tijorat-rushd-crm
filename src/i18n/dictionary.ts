import type { Lang } from './types'
import common from './dictionaries/common'
import auth from './dictionaries/auth'
import nav from './dictionaries/nav'
import users from './dictionaries/users'
import leads from './dictionaries/leads'
import settings from './dictionaries/settings'
import survey from './dictionaries/survey'
import razbor from './dictionaries/razbor'
import autotasks from './dictionaries/autotasks'
import dev from './dictionaries/dev'
import status from './dictionaries/status'
import calendar from './dictionaries/calendar'
import tasksui from './dictionaries/tasksui'
import calmodal from './dictionaries/calmodal'
import dash from './dictionaries/dash'
import usercard from './dictionaries/usercard'
import misc from './dictionaries/misc'

export type Bundle = Record<Lang, Record<string, string>>

// Все словари объединяются в один плоский справочник ключ→перевод.
// Новые разделы добавляются как отдельные файлы в ./dictionaries и импортируются здесь.
const bundles: Bundle[] = [
  common, auth, nav, users, leads, settings, survey, razbor, autotasks, dev, status, calendar,
  tasksui, calmodal, dash, usercard, misc,
]

const dictionary: Bundle = { tg: {}, ru: {} }
for (const b of bundles) {
  Object.assign(dictionary.tg, b.tg)
  Object.assign(dictionary.ru, b.ru)
}

export { dictionary }
