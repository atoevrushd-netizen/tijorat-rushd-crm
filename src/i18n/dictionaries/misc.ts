import type { Lang } from '../types'

/**
 * Разрозненные пользовательские строки: настройки, достижения, история
 * активности, менеджер вкладок, экраны 404 / «нет профиля», рендерер вкладок.
 */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    // Общие
    'misc.loading': 'Боркунӣ…',
    'misc.add': 'Илова кардан',
    'misc.delete': 'Нест кардан',

    // Настройки
    'settings.adminProfile': 'Профили маъмур',
    'settings.profile': 'Профил',
    'settings.edit': 'Тағйир додан',
    'settings.name': 'Ном',
    'settings.login': 'Логин',
    'settings.fullName': 'Ном ва насаб',
    'settings.phone': 'Телефон',
    'settings.businessDirection': 'Самти бизнес',
    'settings.account': 'Аккаунт',
    'settings.status': 'Ҳолат',
    'settings.subscriptionPeriod': 'Давраи обуна',
    'settings.theme': 'Мавзӯи намоиш',
    'settings.themeLight': 'Равшан',
    'settings.themeDark': 'Торик',
    'settings.themeSystem': 'Системавӣ',
    'settings.changePassword': 'Тағйири парол',
    'settings.oldPassword': 'Пароли кӯҳна',
    'settings.newPassword': 'Пароли нав',
    'settings.confirmPassword': 'Такрори пароли нав',
    'settings.savePassword': 'Тағйир додан',
    'settings.pwdChanged': 'Парол иваз шуд',
    'settings.pwdMinError': 'Пароли нав — на кӯтоҳтар аз 6 аломат',
    'settings.pwdMismatch': 'Паролҳо мувофиқат намекунанд',
    'settings.pwdError': 'Тағйири парол муяссар нашуд',
    'settings.dataBackups': 'Маълумот ва нусхаҳои захиравӣ',
    'settings.backupDesc1': 'Нусхаи захиравӣ ',
    'settings.backupDescAll': 'ҳамаи',
    'settings.backupDesc2':
      ' маълумоти CRM-ро дар як файл нигоҳ медорад: лидҳо, корбарон, задачаҳо, вкладкаҳо, дастовардҳо, таърихи амалҳо ва паролҳо. Онро зеркашӣ кунед ва дар ҷои боэътимод нигоҳ доред — то лидҳо ва маълумоташон гум нашаванд.',
    'settings.createBackup': 'Нусхаи захиравӣ сохтан',
    'settings.backupDone':
      'Нусхаи захиравӣ сохта ва зеркашӣ шуд: лидҳо {leads}, корбарон {profiles}, задачаҳо {tasks}; ҳамагӣ навиштаҷот {total}.',
    'settings.backupFail': 'Сохтани нусхаи захиравӣ муяссар нашуд',
    'settings.backupWarn':
      '⚠️ Нусхаи захиравиро мунтазам ва пеш аз тағйироти оммавӣ созед. Дар файл паролҳо ҳастанд — онро ҳамчун сир нигоҳ доред.',
    'settings.importTrash': 'Воридот ва Сабад',
    'settings.importTrashDesc':
      'Барқарорсозӣ аз нусхаи захиравӣ (муттаҳидсозии бехатар — чизе нест намекунад) ва «Сабад»-и лидҳои нестшуда бо имкони барқарорсозӣ — қадами навбатӣ омода мешавад.',

    // Достижения
    'ach.title': 'Дастовардҳо',
    'ach.empty': 'Ҳоло дастовард нест.',
    'ach.deleteAria': 'Нест кардани дастовард',
    'ach.deleteConfirm': 'Дастовард нест карда шавад?',
    'ach.newPlaceholder': 'Дастоварди нав',
    'ach.addFail': 'Илова кардан муяссар нашуд',

    // История активности
    'activity.title': 'Таърихи фаъолият',
    'activity.empty': 'Ҳоло рӯйдод нест.',
    'activity.taskCreated': 'Задачаи «{title}» сохта шуд',
    'activity.taskStatusChanged': 'Ҳолати задачаи «{title}»: {from} → {to}',

    // Уведомления (колокольчик)
    'notif.title': 'Огоҳиҳо',
    'notif.empty': 'Ҳоло огоҳӣ нест.',

    // Менеджер вкладок
    'tabsMgr.cardTabs': 'Вкладкаҳои корт',
    'tabsMgr.desc':
      'Вкладкаҳо аз БД меоянд. Вкладкаи нав ба таври худкор дар ҳамаи кортҳо пайдо мешавад — бе аз нав навиштани код.',
    'tabsMgr.order': 'тартиб',
    'tabsMgr.moveUp': 'Болотар',
    'tabsMgr.moveDown': 'Поёнтар',
    'tabsMgr.active': 'фаъол',
    'tabsMgr.deleteConfirm':
      'Вкладкаи «{title}» нест карда шавад? Задачаҳои ин вкладка дар интерфейс дастнорас мешаванд.',
    'tabsMgr.keyPlaceholder': 'калид (sales, kpi)',
    'tabsMgr.titlePlaceholder': 'Номи вкладка',
    'tabsMgr.addFail': 'Илова кардани вкладка муяссар нашуд',

    // 404
    'notFound.text': 'Саҳифа ёфт нашуд',
    'notFound.home': 'Ба саҳифаи асосӣ',
    'notFound.login': 'Воридшавӣ',

    // Нет профиля
    'noProfile.title': 'Профил дастнорас аст',
    'noProfile.desc':
      'Шумо ворид шудед, аммо профил бор нашуд ё ҳанӯз танзим нашудааст. Саҳифаро нав кунед ё ба маъмур муроҷиат кунед.',
    'noProfile.refresh': 'Нав кардан',

    // Рендерер вкладок пользователя
    'userTabs.loading': 'Боркунии вкладкаҳо…',
    'userTabs.empty': 'Вкладкаҳои фаъол нестанд.',

    // Панель разработчика
    'devPage.inTrash': '(дар сабад)',
  },
  ru: {
    // Общие
    'misc.loading': 'Загрузка…',
    'misc.add': 'Добавить',
    'misc.delete': 'Удалить',

    // Настройки
    'settings.adminProfile': 'Профиль администратора',
    'settings.profile': 'Профиль',
    'settings.edit': 'Изменить',
    'settings.name': 'Имя',
    'settings.login': 'Логин',
    'settings.fullName': 'Имя и фамилия',
    'settings.phone': 'Телефон',
    'settings.businessDirection': 'Направление бизнеса',
    'settings.account': 'Аккаунт',
    'settings.status': 'Статус',
    'settings.subscriptionPeriod': 'Период подписки',
    'settings.theme': 'Тема оформления',
    'settings.themeLight': 'Светлая',
    'settings.themeDark': 'Тёмная',
    'settings.themeSystem': 'Системная',
    'settings.changePassword': 'Смена пароля',
    'settings.oldPassword': 'Старый пароль',
    'settings.newPassword': 'Новый пароль',
    'settings.confirmPassword': 'Повторите новый пароль',
    'settings.savePassword': 'Сменить',
    'settings.pwdChanged': 'Пароль изменён',
    'settings.pwdMinError': 'Новый пароль — не короче 6 символов',
    'settings.pwdMismatch': 'Пароли не совпадают',
    'settings.pwdError': 'Не удалось сменить пароль',
    'settings.dataBackups': 'Данные и бэкапы',
    'settings.backupDesc1': 'Бэкап сохраняет ',
    'settings.backupDescAll': 'все',
    'settings.backupDesc2':
      ' данные CRM в один файл: лиды, пользователи, задачи, вкладки, достижения, история действий и пароли. Скачайте его и храните в надёжном месте — так лиды и их данные не потеряются.',
    'settings.createBackup': 'Создать бэкап',
    'settings.backupDone':
      'Бэкап создан и скачан: лидов {leads}, пользователей {profiles}, задач {tasks}; всего записей {total}.',
    'settings.backupFail': 'Не удалось создать бэкап',
    'settings.backupWarn':
      '⚠️ Делайте бэкап регулярно и перед массовыми изменениями. В файле есть пароли — храните его как секрет.',
    'settings.importTrash': 'Импорт и Корзина',
    'settings.importTrashDesc':
      'Восстановление из бэкапа (безопасное слияние — ничего не удаляет) и «Корзина» удалённых лидов с возможностью восстановления — готовлю следующим шагом.',

    // Достижения
    'ach.title': 'Достижения',
    'ach.empty': 'Пока нет достижений.',
    'ach.deleteAria': 'Удалить достижение',
    'ach.deleteConfirm': 'Удалить достижение?',
    'ach.newPlaceholder': 'Новое достижение',
    'ach.addFail': 'Не удалось добавить',

    // История активности
    'activity.title': 'История активности',
    'activity.empty': 'Пока нет событий.',
    'activity.taskCreated': 'Создана задача «{title}»',
    'activity.taskStatusChanged': 'Статус задачи «{title}»: {from} → {to}',

    // Уведомления (колокольчик)
    'notif.title': 'Уведомления',
    'notif.empty': 'Пока нет уведомлений.',

    // Менеджер вкладок
    'tabsMgr.cardTabs': 'Вкладки карточки',
    'tabsMgr.desc':
      'Вкладки приходят из БД. Новая вкладка автоматически появляется во всех карточках — без переписывания кода.',
    'tabsMgr.order': 'порядок',
    'tabsMgr.moveUp': 'Выше',
    'tabsMgr.moveDown': 'Ниже',
    'tabsMgr.active': 'активна',
    'tabsMgr.deleteConfirm':
      'Удалить вкладку «{title}»? Задачи этой вкладки станут недоступны в интерфейсе.',
    'tabsMgr.keyPlaceholder': 'ключ (sales, kpi)',
    'tabsMgr.titlePlaceholder': 'Название вкладки',
    'tabsMgr.addFail': 'Не удалось добавить вкладку',

    // 404
    'notFound.text': 'Страница не найдена',
    'notFound.home': 'На главную',
    'notFound.login': 'Вход',

    // Нет профиля
    'noProfile.title': 'Профиль недоступен',
    'noProfile.desc':
      'Вы вошли, но профиль не загрузился или ещё не настроен. Обновите страницу или обратитесь к администратору.',
    'noProfile.refresh': 'Обновить',

    // Рендерер вкладок пользователя
    'userTabs.loading': 'Загрузка вкладок…',
    'userTabs.empty': 'Нет активных вкладок.',

    // Панель разработчика
    'devPage.inTrash': '(в корзине)',
  },
}

export default bundle
