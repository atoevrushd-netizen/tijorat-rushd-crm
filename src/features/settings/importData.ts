import { supabase } from '@/lib/supabase'
import { BACKUP_TABLES, type BackupFile } from './exportData'

/**
 * Восстановление из бэкапа — НЕразрушающее слияние (upsert по первичному ключу).
 * Ничего не удаляется: строки с совпадающим ключом обновляются, остальные вставляются.
 * onConflict не указываем — PostgREST берёт первичный ключ таблицы (у lead_cards /
 * user_credentials это user_id, у остальных — id).
 */

/** Таблицы «данные» — восстанавливать безопасно (по умолчанию включены). */
export const DATA_TABLES = [
  'lead_cards',
  'tabs',
  'tasks',
  'task_links',
  'achievements',
  'survey_questions',
  'survey_answers',
  'razbor_sections',
  'razbor_answers',
  'task_template_groups',
  'task_templates',
  'app_settings',
] as const

/** Таблицы «аккаунты и система» — по умолчанию выключены (риск/часто блокирует RLS). */
export const ACCOUNT_TABLES = ['profiles', 'leads', 'user_credentials', 'activity_log'] as const

export type RestoreResult = {
  table: string
  attempted: number
  ok: number
  failed: number
  error?: string
}

/** Разобрать и проверить файл бэкапа. Бросает понятную ошибку, если формат чужой. */
export function parseBackup(text: string): BackupFile {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('badFile')
  }
  const b = json as Partial<BackupFile>
  if (!b || b.app !== 'tijorat-rushd-crm' || !b.tables || typeof b.tables !== 'object') {
    throw new Error('badFile')
  }
  return b as BackupFile
}

/** Восстановить одну таблицу. Чанк упал → пробуем построчно, чтобы не потерять годные строки. */
async function restoreTable(table: string, rows: Record<string, unknown>[]): Promise<RestoreResult> {
  if (rows.length === 0) return { table, attempted: 0, ok: 0, failed: 0 }
  const CHUNK = 500
  let ok = 0
  let failed = 0
  let firstError: string | undefined
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK)
    const { error } = await supabase.from(table).upsert(batch)
    if (!error) {
      ok += batch.length
      continue
    }
    for (const row of batch) {
      const { error: rowErr } = await supabase.from(table).upsert(row)
      if (rowErr) {
        failed++
        firstError ??= rowErr.message
      } else {
        ok++
      }
    }
  }
  return { table, attempted: rows.length, ok, failed, error: firstError }
}

/**
 * Восстановить выбранные таблицы из бэкапа в порядке FK-зависимостей (как в BACKUP_TABLES).
 * onProgress вызывается перед обработкой каждой таблицы (для индикатора).
 */
export async function restoreBackup(
  backup: BackupFile,
  selected: readonly string[],
  onProgress?: (table: string) => void,
): Promise<RestoreResult[]> {
  const set = new Set(selected)
  const results: RestoreResult[] = []
  for (const table of BACKUP_TABLES) {
    if (!set.has(table)) continue
    onProgress?.(table)
    const rows = (backup.tables[table] ?? []) as Record<string, unknown>[]
    results.push(await restoreTable(table, rows))
  }
  return results
}
