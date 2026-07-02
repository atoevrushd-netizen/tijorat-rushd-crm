/** Поддерживаемые языки интерфейса. По умолчанию — таджикский. */
export type Lang = 'tg' | 'ru'

/** Порядок в переключателе (слева направо). */
export const LANGS: Lang[] = ['tg', 'ru']

/** Язык по умолчанию для новых пользователей. */
export const DEFAULT_LANG: Lang = 'tg'

/** Полное название языка (на самом языке). */
export const LANG_LABEL: Record<Lang, string> = {
  tg: 'Тоҷикӣ',
  ru: 'Русский',
}

/** Короткая метка для компактного переключателя. */
export const LANG_SHORT: Record<Lang, string> = {
  tg: 'ТҶ',
  ru: 'РУ',
}
