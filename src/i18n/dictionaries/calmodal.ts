import type { Lang } from '../types'

/** Модалки задач календаря: создание и редактирование (только админ). */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    // Общие поля обеих модалок
    'calmodal.nameLabel': 'Ном *',
    'calmodal.typeLabel': 'Навъ',
    'calmodal.timeLabel': 'Вақт',
    'calmodal.commentLabel': 'Шарҳ',
    // Модалка создания
    'calmodal.createTitle': 'Задача барои',
    'calmodal.namePlaceholder': 'Reels гирифтан',
    'calmodal.createError': 'Сохтан муяссар нашуд',
    'calmodal.createBtn': 'Сохтан',
    // Модалка редактирования
    'calmodal.editTitle': 'Таҳрири задача',
    'calmodal.statusLabel': 'Ҳолат',
    'calmodal.dayLabel': 'Рӯз',
    'calmodal.saveError': 'Сабт кардан муяссар нашуд',
  },
  ru: {
    // Общие поля обеих модалок
    'calmodal.nameLabel': 'Название *',
    'calmodal.typeLabel': 'Тип',
    'calmodal.timeLabel': 'Время',
    'calmodal.commentLabel': 'Комментарий',
    // Модалка создания
    'calmodal.createTitle': 'Задача на',
    'calmodal.namePlaceholder': 'Снять Reels',
    'calmodal.createError': 'Не удалось создать',
    'calmodal.createBtn': 'Создать',
    // Модалка редактирования
    'calmodal.editTitle': 'Редактировать задачу',
    'calmodal.statusLabel': 'Статус',
    'calmodal.dayLabel': 'День',
    'calmodal.saveError': 'Не удалось сохранить',
  },
}

export default bundle
