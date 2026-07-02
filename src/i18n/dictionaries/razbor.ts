import type { Lang } from '../types'

/** Вкладка «Разбор» (таҳлили ҷаласаҳои коучӣ). */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'nav.razbor': 'Таҳлил',
    'page.razbor': 'Таҳлил',
    'razbor.hint': 'Таҳлили ҷаласаҳои коучӣ: ҳисобот, саволҳо ва ҷавобҳои шумо.',
    'razbor.report': 'Ҳисобот оид ба вазифаҳо',
    'razbor.questions': 'Саволҳо ва дархостҳо',
    'razbor.answers': 'Ҷавобҳо ба саволҳо',
    'razbor.tasks': 'Гирифтани вазифаҳо',
    'razbor.answerPlaceholder': 'Дар ин ҷо нависед…',
    'razbor.loadError': 'Таҳлилҳо бор карда нашуданд',
    'razbor.empty': 'Ҳоло таҳлилҳо нестанд',
  },
  ru: {
    'nav.razbor': 'Разбор',
    'page.razbor': 'Разбор',
    'razbor.hint': 'Разбор коуч-сессий: отчёт, вопросы и ваши ответы.',
    'razbor.report': 'Отчёт по заданиям',
    'razbor.questions': 'Вопросы и запросы',
    'razbor.answers': 'Ответы на вопросы',
    'razbor.tasks': 'Получить задания',
    'razbor.answerPlaceholder': 'Напишите здесь…',
    'razbor.loadError': 'Не удалось загрузить разборы',
    'razbor.empty': 'Разборов пока нет',
  },
}

export default bundle
