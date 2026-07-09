import type { Lang } from '../types'

/** Онбординг нового лида: приветствие + чек-лист первых шагов. */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'onb.welcome': 'Хуш омадед',
    'onb.intro': 'Биёед кабинети шуморо дар як дақиқа танзим кунем.',
    'onb.step1Title': 'Маълумоти худро пур кунед',
    'onb.step1Sub': 'Синну сол, ниша, молия — кортаи бизнеси шумо',
    'onb.step2Title': 'Анкетаро гузаред',
    'onb.step2Sub': 'Ташхиси A — дар бораи бизнеси худ нақл кунед',
    'onb.step3Title': 'Вазифаҳои шумо',
    'onb.step3Sub': 'Нақшаро бинед ва иҷрошударо қайд кунед',
    'onb.start': 'Оғоз кардан',
    'onb.later': 'Баъдтар',
    'leadcard.progress': 'пур шудааст {n} аз {total}',
  },
  ru: {
    'onb.welcome': 'Добро пожаловать',
    'onb.intro': 'Давайте настроим ваш кабинет за пару минут.',
    'onb.step1Title': 'Заполните свои данные',
    'onb.step1Sub': 'Возраст, ниша, финансы — ваша бизнес-карта',
    'onb.step2Title': 'Пройдите анкету',
    'onb.step2Sub': 'Диагностика A — расскажите о своём бизнесе',
    'onb.step3Title': 'Ваши задачи',
    'onb.step3Sub': 'Смотрите план и отмечайте выполнение',
    'onb.start': 'Начать',
    'onb.later': 'Позже',
    'leadcard.progress': 'заполнено {n} из {total}',
  },
}

export default bundle
