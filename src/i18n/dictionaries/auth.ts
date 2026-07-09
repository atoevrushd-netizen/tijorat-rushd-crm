import type { Lang } from '../types'

/** Страница входа. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'auth.subtitle': 'Воридшавӣ ба система',
    'auth.welcome': 'Хуш омадед',
    'auth.login': 'Логин',
    'auth.password': 'Парол',
    'auth.loginPlaceholder': 'логини шумо',
    'auth.submit': 'Ворид шудан',
    'auth.signingIn': 'Воридшавӣ…',
    'auth.error': 'Ворид шудан муяссар нашуд',
    'auth.errInvalid': 'Логин ё парол нодуруст аст',
    'auth.errNetwork': 'Алоқа бо сервер нест. Интернетро санҷед',
    'auth.errRateLimit': 'Кӯшишҳо аз ҳад зиёданд. Каме сабр кунед',
    'auth.forgot': 'Паролро фаромӯш кардед? Ба маъмур муроҷиат кунед',
    'auth.showPassword': 'Намоиши парол',
    'auth.hidePassword': 'Пинҳон кардани парол',
    'auth.tagline': 'CRM барои идораи лидҳо ва вазифаҳо',
  },
  ru: {
    'auth.subtitle': 'Вход в систему',
    'auth.welcome': 'Добро пожаловать',
    'auth.login': 'Логин',
    'auth.password': 'Пароль',
    'auth.loginPlaceholder': 'ваш логин',
    'auth.submit': 'Войти',
    'auth.signingIn': 'Вход…',
    'auth.error': 'Не удалось войти',
    'auth.errInvalid': 'Неверный логин или пароль',
    'auth.errNetwork': 'Нет связи с сервером. Проверьте интернет',
    'auth.errRateLimit': 'Слишком много попыток. Подождите немного',
    'auth.forgot': 'Забыли пароль? Обратитесь к администратору',
    'auth.showPassword': 'Показать пароль',
    'auth.hidePassword': 'Скрыть пароль',
    'auth.tagline': 'CRM для управления лидами и задачами',
  },
}

export default bundle
