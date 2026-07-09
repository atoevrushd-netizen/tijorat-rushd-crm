import type { Lang } from '../types'

/** Карточка пользователя и модалки: поля, кнопки, сообщения, смена пароля. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    // Подписи полей карточки
    'usercard.fieldPhone': 'Телефон',
    'usercard.fieldLogin': 'Логин',
    'usercard.fieldPassword': 'Парол',
    'usercard.fieldRegDate': 'Санаи бақайдгирӣ',
    'usercard.fieldRole': 'Нақш',
    'usercard.fieldSubStart': 'Обуна аз',
    'usercard.fieldSubEnd': 'Обуна то',
    'usercard.fieldAdminComment': 'Шарҳи маъмур',
    'usercard.fieldFullName': 'Ном ва насаб',
    'usercard.fieldFullNameReq': 'Ном ва насаб *',
    'usercard.fieldPhoneReq': 'Телефон *',
    'usercard.fieldLoginReq': 'Логин (барои воридшавӣ) *',
    'usercard.fieldPasswordReq': 'Парол *',
    'usercard.fieldBusinessDir': 'Самти бизнес',
    'usercard.fieldStatus': 'Ҳолат',
    // Плейсхолдеры
    'usercard.fullNamePlaceholder': 'Алӣ Каримов',
    'usercard.phonePlaceholder': '+992 ...',
    'usercard.loginPlaceholder': 'масалан, malik99',
    'usercard.passwordPlaceholder': 'на кӯтоҳтар аз 6 аломат',
    'usercard.businessDirPlaceholder': 'Маркетинг',
    'usercard.newPasswordPlaceholder': 'пароли нав (на кӯтоҳтар аз 6 аломат)',
    'usercard.loginHint':
      'Бо ҳарфҳои лотинӣ: a-z, рақамҳо, нуқта, дефис (кириллӣ кор намекунад)',
    // Заголовки модалок
    'usercard.createTitle': 'Корбари нав',
    'usercard.editTitle': 'Таҳрири корбар',
    'usercard.selfEditTitle': 'Таҳрири профил',
    // Кнопки и действия
    'usercard.edit': 'Таҳрир',
    'usercard.changePassword': 'Иваз кардани парол',
    'usercard.changePasswordShort': 'Иваз кардан',
    'usercard.delete': 'Нест кардан',
    'usercard.create': 'Эҷод кардан',
    'usercard.done': 'Тайёр',
    'usercard.uploadPhoto': 'Боркунии сурат',
    'usercard.changePhoto': 'Иваз кардани сурат',
    // Поле «Пароль» — aria-labels и пустое значение
    'usercard.showPassword': 'Нишон додани парол',
    'usercard.hidePassword': 'Пинҳон кардани парол',
    'usercard.copyPassword': 'Нусхабардории парол',
    'usercard.passwordEmpty': '— (тавассути «Иваз кардани парол» таъин кунед)',
    // Сообщения и ошибки
    'usercard.notFound': 'Корбар ёфт нашуд.',
    'usercard.toList': 'Ба рӯйхат',
    'usercard.noDirection': 'Самт нишон дода нашудааст',
    'usercard.deleteConfirm':
      'Ҳазфи «{name}»? Лид ба «Сабад» меравад — онро барқарор кардан мумкин аст.',
    'usercard.userFallbackGenitive': 'корбар',
    'usercard.userFallback': 'корбар',
    'usercard.loginError':
      'Логин — бо ҳарфҳои лотинӣ (a-z, рақамҳо), ҳадди ақал 3 аломат. Масалан: malik99',
    'usercard.passwordMinError': 'Парол — на кӯтоҳтар аз 6 аломат',
    'usercard.phoneError': 'Телефон бояд бо +992 сар шавад',
    'usercard.genPassword': 'Эҷоди парол',
    'usercard.passwordCopied': 'Парол нусхабардорӣ шуд',
    'usercard.passwordGenHint': 'Тугмаро пахш кунед — пароли боэътимод эҷод мешавад',
    'usercard.createError': 'Эҷоди корбар муяссар нашуд',
    'usercard.saveError': 'Сабт кардан муяссар нашуд',
    'usercard.pwdChanged':
      'Пароли «{name}» иваз шуд. Пароли навро ба корбар супоред.',
    'usercard.pwdSetHint':
      'Барои «{name}» пароли нав таъин кунед. Он фавран дар корти корбар намоён мешавад.',
    'usercard.pwdError': 'Иваз кардани парол муяссар нашуд',
  },
  ru: {
    // Подписи полей карточки
    'usercard.fieldPhone': 'Телефон',
    'usercard.fieldLogin': 'Логин',
    'usercard.fieldPassword': 'Пароль',
    'usercard.fieldRegDate': 'Дата регистрации',
    'usercard.fieldRole': 'Роль',
    'usercard.fieldSubStart': 'Подписка с',
    'usercard.fieldSubEnd': 'Подписка по',
    'usercard.fieldAdminComment': 'Комментарий администратора',
    'usercard.fieldFullName': 'Имя и фамилия',
    'usercard.fieldFullNameReq': 'Имя и фамилия *',
    'usercard.fieldPhoneReq': 'Телефон *',
    'usercard.fieldLoginReq': 'Логин (для входа) *',
    'usercard.fieldPasswordReq': 'Пароль *',
    'usercard.fieldBusinessDir': 'Направление бизнеса',
    'usercard.fieldStatus': 'Статус',
    // Плейсхолдеры
    'usercard.fullNamePlaceholder': 'Иван Иванов',
    'usercard.phonePlaceholder': '+992 ...',
    'usercard.loginPlaceholder': 'например, malik99',
    'usercard.passwordPlaceholder': 'не короче 6 символов',
    'usercard.businessDirPlaceholder': 'Маркетинг',
    'usercard.newPasswordPlaceholder': 'новый пароль (не короче 6 символов)',
    'usercard.loginHint':
      'Латиницей: a-z, цифры, точка, дефис (кириллица не подойдёт)',
    // Заголовки модалок
    'usercard.createTitle': 'Новый пользователь',
    'usercard.editTitle': 'Редактировать пользователя',
    'usercard.selfEditTitle': 'Изменить профиль',
    // Кнопки и действия
    'usercard.edit': 'Редактировать',
    'usercard.changePassword': 'Сменить пароль',
    'usercard.changePasswordShort': 'Сменить',
    'usercard.delete': 'Удалить',
    'usercard.create': 'Создать',
    'usercard.done': 'Готово',
    'usercard.uploadPhoto': 'Загрузить фото',
    'usercard.changePhoto': 'Изменить фото',
    // Поле «Пароль» — aria-labels и пустое значение
    'usercard.showPassword': 'Показать пароль',
    'usercard.hidePassword': 'Скрыть пароль',
    'usercard.copyPassword': 'Скопировать пароль',
    'usercard.passwordEmpty': '— (задайте через «Сменить пароль»)',
    // Сообщения и ошибки
    'usercard.notFound': 'Пользователь не найден.',
    'usercard.toList': 'К списку',
    'usercard.noDirection': 'Направление не указано',
    'usercard.deleteConfirm':
      'Удалить «{name}»? Лид уйдёт в «Корзину» — его можно восстановить.',
    'usercard.userFallbackGenitive': 'пользователя',
    'usercard.userFallback': 'пользователь',
    'usercard.loginError':
      'Логин — латиницей (буквы a-z, цифры), минимум 3 символа. Например: malik99',
    'usercard.passwordMinError': 'Пароль — не короче 6 символов',
    'usercard.phoneError': 'Телефон должен начинаться с +992',
    'usercard.genPassword': 'Сгенерировать пароль',
    'usercard.passwordCopied': 'Пароль скопирован',
    'usercard.passwordGenHint': 'Нажмите кнопку — сгенерируется надёжный пароль',
    'usercard.createError': 'Не удалось создать пользователя',
    'usercard.saveError': 'Не удалось сохранить',
    'usercard.pwdChanged':
      'Пароль для «{name}» изменён. Передайте новый пароль пользователю.',
    'usercard.pwdSetHint':
      'Задайте новый пароль для «{name}». Он сразу отобразится в карточке пользователя.',
    'usercard.pwdError': 'Не удалось сменить пароль',
  },
}

export default bundle
