import type { Lang } from '../types'

/** Страница входа. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'auth.subtitle': 'Воридшавӣ ба система',
    'auth.login': 'Логин',
    'auth.password': 'Парол',
    'auth.loginPlaceholder': 'логини шумо',
    'auth.submit': 'Ворид шудан',
    'auth.error': 'Ворид шудан муяссар нашуд',
  },
  ru: {
    'auth.subtitle': 'Вход в систему',
    'auth.login': 'Логин',
    'auth.password': 'Пароль',
    'auth.loginPlaceholder': 'ваш логин',
    'auth.submit': 'Войти',
    'auth.error': 'Не удалось войти',
  },
}

export default bundle
