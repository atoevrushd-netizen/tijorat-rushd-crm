import type { Lang } from '../types'

/** Страница «Настройки» и шапка личного кабинета. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'settings.subtitleAdmin': 'Параметрҳои система ва маълумот',
    'settings.subtitleUser': 'Параметрҳои ҳисоб',
    'settings.signOutAccount': 'Баромадан аз ҳисоб',
    'cabinet.editProfile': 'Тағйир додани профил',
  },
  ru: {
    'settings.subtitleAdmin': 'Параметры системы и данные',
    'settings.subtitleUser': 'Параметры аккаунта',
    'settings.signOutAccount': 'Выйти из аккаунта',
    'cabinet.editProfile': 'Изменить профиль',
  },
}

export default bundle
