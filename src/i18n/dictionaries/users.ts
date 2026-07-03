import type { Lang } from '../types'

/** Список пользователей и «Корзина». */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'users.create': '+ Эҷоди корбари нав',
    'users.searchPlaceholder': 'Ҷустуҷӯ: ном, телефон, логин, email',
    'users.trash': 'Сабад',
    'users.toActive': 'Ба фаъолон',
    'users.loadError': 'Боркунии корбарон муяссар нашуд',
    'users.trashEmpty': 'Сабад холӣ аст',
    'users.restore': 'Барқарор кардан',
    'users.deleteForever': 'Тамоман нест кардан',
    'users.deleteForeverConfirm':
      'Ин лидро ТАМОМАН нест кунам? Амал бебозгашт аст — ҳисоб ва ҳамаи маълумоташ (задачаҳо, ҷавобҳо, парол) нест мешаванд.',
    'users.deletedAt': 'нест карда шуд',
    'users.backToList': '← Ба рӯйхат',
  },
  ru: {
    'users.create': '+ Создать пользователя',
    'users.searchPlaceholder': 'Поиск: имя, телефон, логин, email',
    'users.trash': 'Корзина',
    'users.toActive': 'К активным',
    'users.loadError': 'Не удалось загрузить пользователей',
    'users.trashEmpty': 'Корзина пуста',
    'users.restore': 'Восстановить',
    'users.deleteForever': 'Удалить навсегда',
    'users.deleteForeverConfirm':
      'Удалить этого лида НАВСЕГДА? Действие необратимо — аккаунт и все его данные (задачи, ответы, пароль) будут стёрты.',
    'users.deletedAt': 'удалён',
    'users.backToList': '← К списку',
  },
}

export default bundle
