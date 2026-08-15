import type { Lang } from '../types'

/** Вкладка «Календарь» — помесячный вид («путь по месяцам»). */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'cal.markDone': 'Иҷрошуда қайд кардан',
    'cal.unmarkDone': 'Аз «иҷрошуда» гирифтан',
    'cal.otherCategory': 'Дигар',
    'cal.doneLabel': 'Иҷро шуд',
    'cal.notDoneLabel': 'Ҳанӯз иҷро нашуд',
    'cal.monthEmpty': 'Барои ин моҳ задача нест',
    'cal.monthEmptyAdmin': 'Давраи обунаро таъин кунед ва «Задачаҳо аз рӯи обуна»-ро дар корти резидент пахш кунед.',
    'cal.monthShort': 'Моҳ',
    'cal.tasksWord': 'вазифа',
    'cal.monthDone': 'Моҳ пурра иҷро шуд',
    'cal.monthFuture': 'Ҳанӯз оғоз нашудааст',
    'cal.daysLeft': 'Боқӣ {n} рӯз',
    'cal.lastDay': 'Рӯзи охирин',
    'cal.monthPast': 'Моҳ ба охир расид',
  },
  ru: {
    'cal.markDone': 'Отметить выполненной',
    'cal.unmarkDone': 'Снять «выполнено»',
    'cal.otherCategory': 'Прочее',
    'cal.doneLabel': 'Выполнено',
    'cal.notDoneLabel': 'Ещё не выполнено',
    'cal.monthEmpty': 'На этот месяц задач нет',
    'cal.monthEmptyAdmin': 'Задайте период подписки и нажмите «Создать задачи по подписке» в карточке резидента.',
    'cal.monthShort': 'Месяц',
    'cal.tasksWord': 'задач',
    'cal.monthDone': 'Месяц полностью выполнен',
    'cal.monthFuture': 'Ещё не начался',
    'cal.daysLeft': 'Осталось {n} дн.',
    'cal.lastDay': 'Последний день',
    'cal.monthPast': 'Месяц завершён',
  },
}

export default bundle
