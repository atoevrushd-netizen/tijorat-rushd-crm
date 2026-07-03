import type { Lang } from '../types'

/** Вкладка «Календарь» (сетка месяца + задачи дня). */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'cal.prevMonth': 'Моҳи гузашта',
    'cal.nextMonth': 'Моҳи оянда',
    'cal.subscription': 'Давраи обуна',
    'cal.tasksN': 'задачаҳо',
    'cal.noTasks': 'задача нест',
    'cal.addBtn': 'Задача',
    'cal.emptyDay': 'Барои ин рӯз задача нест.',
    'cal.emptyDayAdmin': ' Барои илова тугмаи «Задача»-ро пахш кунед.',
    'cal.markDone': 'Иҷрошуда қайд кардан',
    'cal.unmarkDone': 'Аз «иҷрошуда» гирифтан',
    'cal.editTask': 'Задачаро таҳрир кардан',
    'cal.deleteTask': 'Задачаро нест кардан',
    'cal.deleteTaskConfirm': 'Задачаро нест кунам? Амал бебозгашт аст.',
  },
  ru: {
    'cal.prevMonth': 'Предыдущий месяц',
    'cal.nextMonth': 'Следующий месяц',
    'cal.subscription': 'Период подписки',
    'cal.tasksN': 'задач',
    'cal.noTasks': 'нет задач',
    'cal.addBtn': 'Задача',
    'cal.emptyDay': 'На этот день задач нет.',
    'cal.emptyDayAdmin': ' Нажмите «Задача», чтобы добавить.',
    'cal.markDone': 'Отметить выполненной',
    'cal.unmarkDone': 'Снять «выполнено»',
    'cal.editTask': 'Редактировать задачу',
    'cal.deleteTask': 'Удалить задачу',
    'cal.deleteTaskConfirm': 'Удалить задачу? Действие необратимо.',
  },
}

export default bundle
