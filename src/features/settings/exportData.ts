import { supabase } from '@/lib/supabase'

/**
 * Бэкап всех данных CRM в один JSON-файл (для скачивания).
 * Читается под админом — RLS разрешает админу видеть все нужные таблицы.
 * Главная защита «не потерять лидов»: админ может в любой момент сохранить копию.
 */

/** Таблицы в бэкапе. Порядок важен для будущего импорта (FK-зависимости). */
export const BACKUP_TABLES = [
  'profiles',
  'leads',
  'tabs',
  'tasks',
  'task_links',
  'achievements',
  'activity_log',
  'user_credentials',
  // Анкеты (A/B) и «Разбор» — ответы лидов; без них бэкап был неполным.
  'survey_questions',
  'survey_answers',
  'razbor_sections',
  'razbor_answers',
  // Автозадачи и глобальные настройки.
  'task_template_groups',
  'task_templates',
  'app_settings',
] as const

export type BackupFile = {
  app: 'tijorat-rushd-crm'
  version: 1
  exported_at: string
  counts: Record<string, number>
  tables: Record<string, unknown[]>
}

/** Прочитать все таблицы и собрать объект бэкапа. */
export async function buildBackup(): Promise<BackupFile> {
  const tables: Record<string, unknown[]> = {}
  const counts: Record<string, number> = {}
  const CHUNK = 1000 // PostgREST по умолчанию режет ответ — читаем постранично до конца
  for (const t of BACKUP_TABLES) {
    const rows: unknown[] = []
    for (let from = 0; ; from += CHUNK) {
      const { data, error } = await supabase
        .from(t)
        .select('*')
        .range(from, from + CHUNK - 1)
      if (error) throw new Error(`Не удалось прочитать «${t}»: ${error.message}`)
      const batch = data ?? []
      rows.push(...batch)
      if (batch.length < CHUNK) break // дочитали все строки таблицы
    }
    tables[t] = rows
    counts[t] = rows.length
  }
  return {
    app: 'tijorat-rushd-crm',
    version: 1,
    exported_at: new Date().toISOString(),
    counts,
    tables,
  }
}

/** Скачать бэкап как файл tijorat-backup-YYYY-MM-DD.json. */
export function downloadBackup(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tijorat-backup-${backup.exported_at.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
