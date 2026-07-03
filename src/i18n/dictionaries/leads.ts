import type { Lang } from '../types'

/** Раздел «Лиды»: воронка, таблица, источники. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'leads.total': 'Ҳамаи лидҳо',
    'leads.converted': 'Табдил ёфт',
    'leads.notConverted': 'Табдил наёфт',
    'leads.rate': 'Конверсия',
    'leads.bySource': 'Аз рӯи манбаъ',
    'leads.colName': 'Ном',
    'leads.colPhone': 'Телефон',
    'leads.colSource': 'Манбаъ',
    'leads.colCreated': 'Сана',
    'leads.colStatus': 'Ҳолат',
    'leads.statusConverted': 'Корбар',
    'leads.statusNew': 'Нав',
    'leads.empty': 'Ҳоло лид нест.',
    'leads.loadError': 'Боркунии лидҳо муяссар нашуд',
    'leads.exportCsv': 'Содирот CSV',
    'leads.exported': 'Содир шуд',
    'leads.source.admin_created': 'Аз ҷониби маъмур',
    'leads.source.self': 'Худ сабти ном',
    'leads.source.unknown': 'Номаълум',
  },
  ru: {
    'leads.total': 'Всего лидов',
    'leads.converted': 'Конвертировано',
    'leads.notConverted': 'Не конвертировано',
    'leads.rate': 'Конверсия',
    'leads.bySource': 'По источникам',
    'leads.colName': 'ФИО',
    'leads.colPhone': 'Телефон',
    'leads.colSource': 'Источник',
    'leads.colCreated': 'Дата',
    'leads.colStatus': 'Статус',
    'leads.statusConverted': 'Пользователь',
    'leads.statusNew': 'Новый',
    'leads.empty': 'Пока нет лидов.',
    'leads.loadError': 'Не удалось загрузить лиды',
    'leads.exportCsv': 'Экспорт CSV',
    'leads.exported': 'Экспортировано',
    'leads.source.admin_created': 'Создан админом',
    'leads.source.self': 'Самрегистрация',
    'leads.source.unknown': 'Не указан',
  },
}

export default bundle
