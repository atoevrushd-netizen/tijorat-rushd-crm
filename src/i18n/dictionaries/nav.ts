import type { Lang } from '../types'

/** Пункты навигации и заголовки разделов. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'nav.dashboard': 'Дашборд',
    'nav.users': 'Корбарон',
    'nav.tabs': 'Бахшҳо',
    'nav.settings': 'Танзимот',
    'nav.myCabinet': 'Кабинети ман',
    'page.users': 'Корбарон',
    'page.dashboard': 'Дашборд',
    'page.tabs': 'Идораи бахшҳо',
    'page.userCard': 'Кортаи корбар',
    'page.settings': 'Танзимот',
    'page.cabinet': 'Кабинети шахсӣ',
    'page.notFound': 'Саҳифа ёфт нашуд',
  },
  ru: {
    'nav.dashboard': 'Дашборд',
    'nav.users': 'Пользователи',
    'nav.tabs': 'Вкладки',
    'nav.settings': 'Настройки',
    'nav.myCabinet': 'Мой кабинет',
    'page.users': 'Пользователи',
    'page.dashboard': 'Дашборд',
    'page.tabs': 'Управление вкладками',
    'page.userCard': 'Карточка пользователя',
    'page.settings': 'Настройки',
    'page.cabinet': 'Личный кабинет',
    'page.notFound': 'Страница не найдена',
  },
}

export default bundle
