import type { Lang } from '../types'

/** Общие строки: каркас приложения, роли, часто используемые кнопки. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'common.menu': 'Меню',
    'common.signOut': 'Баромадан',
    'common.role.admin': 'Маъмур',
    'common.role.user': 'Корбар',
    'common.userFallback': 'Корбар',
    'common.close': 'Пӯшидан',
    'common.cancel': 'Бекор кардан',
    'common.save': 'Сабт кардан',
    'common.language': 'Забон',
  },
  ru: {
    'common.menu': 'Меню',
    'common.signOut': 'Выйти',
    'common.role.admin': 'Администратор',
    'common.role.user': 'Пользователь',
    'common.userFallback': 'Пользователь',
    'common.close': 'Закрыть',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.language': 'Язык',
  },
}

export default bundle
