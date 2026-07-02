import type { Lang } from '../types'

/** Страница «Настройки» и шапка личного кабинета. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'settings.subtitleAdmin': 'Танзимоти система ва маълумот',
    'settings.subtitleUser': 'Танзимоти ҳисоб',
    'settings.signOutAccount': 'Аз ҳисоб баромадан',
    'cabinet.editProfile': 'Профилро тағйир додан',
  },
  ru: {
    'settings.subtitleAdmin': 'Параметры системы и данные',
    'settings.subtitleUser': 'Параметры аккаунта',
    'settings.signOutAccount': 'Выйти из аккаунта',
    'cabinet.editProfile': 'Изменить профиль',
  },
}

export default bundle
