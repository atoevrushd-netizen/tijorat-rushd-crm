import type { Lang } from '../types'

/** Сводка задач резидента (TaskStats): подписи кольца и KPI-плиток.
 *  statAccepted = «выполнено» (в помесячной модели галочку ставит админ; старого
 *  флоу «принято резидентом» больше нет). */
const bundle: Record<Lang, Record<string, string>> = {
  tg: {
    'tasksui.statTotal': 'Ҳамаи задачаҳо',
    'tasksui.statAccepted': 'Иҷрошуда',
    'tasksui.statInProgress': 'Дар ҷараён',
    'tasksui.statNeedsRevision': 'Барои ислоҳ',
    'tasksui.statCompleted': 'иҷрошуда',
  },
  ru: {
    'tasksui.statTotal': 'Всего задач',
    'tasksui.statAccepted': 'Выполнено',
    'tasksui.statInProgress': 'В процессе',
    'tasksui.statNeedsRevision': 'На правку',
    'tasksui.statCompleted': 'выполнено',
  },
}

export default bundle
