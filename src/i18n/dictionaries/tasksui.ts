import type { Lang } from '../types'

/** UI-строки блока задач: карточка, действия админа/владельца, создание, статистика. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    // TaskItem
    'tasksui.deadline': 'мӯҳлат',
    'tasksui.confirmDeleteLink': 'Истинодро нест кунам?',
    'tasksui.deleteLink': 'Истинодро нест кардан',
    'tasksui.adminComment': 'Шарҳи маъмур:',
    'tasksui.userComment': 'Шарҳи корбар:',
    'tasksui.created': 'сохта шуд',
    'tasksui.sent': 'фиристода шуд',
    'tasksui.accepted': 'қабул шуд',
    // TaskAdminControls
    'tasksui.changeStatus': 'Тағйири вазъият…',
    'tasksui.linkPlaceholder': 'истинод ба мавод',
    'tasksui.addLink': '+ Истинод',
    'tasksui.confirmDeleteTask': 'Задачаро нест кунам? Амал бебозгашт аст.',
    'tasksui.delete': 'Нест кардан',
    // TaskOwnerControls
    'tasksui.accept': 'Қабул кардан',
    'tasksui.returnForRevision': 'Барои ислоҳ баргардонидан',
    'tasksui.whatToFix': 'Чиро ислоҳ кардан лозим аст?',
    'tasksui.sendForRevision': 'Барои ислоҳ фиристодан',
    'tasksui.error': 'Хатогӣ',
    // CreateTaskModal
    'tasksui.newTask': 'Задачаи нав',
    'tasksui.nameLabel': 'Ном *',
    'tasksui.namePlaceholder': 'Reels №1',
    'tasksui.type': 'Намуд',
    'tasksui.deadlineLabel': 'Мӯҳлат',
    'tasksui.adminCommentLabel': 'Шарҳи маъмур',
    'tasksui.createError': 'Сохтан нашуд',
    'tasksui.create': 'Сохтан',
    // MediaTab
    'tasksui.tasksCount': 'Задачаҳо',
    'tasksui.addTask': '+ Задача',
    'tasksui.noTasks': 'Ҳоло задача нест.',
    // TaskStats
    'tasksui.statTotal': 'Ҳамаи задачаҳо',
    'tasksui.statAccepted': 'Қабулшуда',
    'tasksui.statInProgress': 'Дар ҷараён',
    'tasksui.statNeedsRevision': 'Барои ислоҳ',
    'tasksui.statCompleted': 'иҷрошуда',
  },
  ru: {
    // TaskItem
    'tasksui.deadline': 'дедлайн',
    'tasksui.confirmDeleteLink': 'Удалить ссылку?',
    'tasksui.deleteLink': 'Удалить ссылку',
    'tasksui.adminComment': 'Комментарий админа:',
    'tasksui.userComment': 'Комментарий пользователя:',
    'tasksui.created': 'создано',
    'tasksui.sent': 'отправлено',
    'tasksui.accepted': 'принято',
    // TaskAdminControls
    'tasksui.changeStatus': 'Сменить статус…',
    'tasksui.linkPlaceholder': 'ссылка на материал',
    'tasksui.addLink': '+ Ссылка',
    'tasksui.confirmDeleteTask': 'Удалить задачу? Действие необратимо.',
    'tasksui.delete': 'Удалить',
    // TaskOwnerControls
    'tasksui.accept': 'Принять',
    'tasksui.returnForRevision': 'Вернуть на правку',
    'tasksui.whatToFix': 'Что поправить?',
    'tasksui.sendForRevision': 'Отправить на правку',
    'tasksui.error': 'Ошибка',
    // CreateTaskModal
    'tasksui.newTask': 'Новая задача',
    'tasksui.nameLabel': 'Название *',
    'tasksui.namePlaceholder': 'Reels №1',
    'tasksui.type': 'Тип',
    'tasksui.deadlineLabel': 'Дедлайн',
    'tasksui.adminCommentLabel': 'Комментарий администратора',
    'tasksui.createError': 'Не удалось создать',
    'tasksui.create': 'Создать',
    // MediaTab
    'tasksui.tasksCount': 'Задач',
    'tasksui.addTask': '+ Задача',
    'tasksui.noTasks': 'Задач пока нет.',
    // TaskStats
    'tasksui.statTotal': 'Всего задач',
    'tasksui.statAccepted': 'Принято',
    'tasksui.statInProgress': 'В процессе',
    'tasksui.statNeedsRevision': 'На правку',
    'tasksui.statCompleted': 'выполнено',
  },
}

export default bundle
