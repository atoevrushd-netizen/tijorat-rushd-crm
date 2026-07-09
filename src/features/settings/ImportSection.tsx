import { useRef, useState } from 'react'
import { ShieldCheck, Upload, AlertTriangle } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { Button } from '@/components/ui/Button'
import { confirm } from '@/lib/confirm'
import { toast, errorMessage } from '@/lib/toast'
import { Section } from './SettingsUI'
import type { BackupFile } from './exportData'
import {
  parseBackup,
  restoreBackup,
  DATA_TABLES,
  ACCOUNT_TABLES,
  type RestoreResult,
} from './importData'

/** Раздел «Восстановление из бэкапа»: выбор файла → выбор таблиц → слияние. */
export function ImportSection() {
  const { t } = useT()
  const fileRef = useRef<HTMLInputElement>(null)
  const [backup, setBackup] = useState<BackupFile | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set(DATA_TABLES))
  const [busy, setBusy] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [results, setResults] = useState<RestoreResult[] | null>(null)

  function rowCount(table: string): number {
    return backup?.counts?.[table] ?? backup?.tables?.[table]?.length ?? 0
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // позволяем выбрать тот же файл повторно
    if (!file) return
    try {
      const parsed = parseBackup(await file.text())
      setBackup(parsed)
      setSelected(new Set(DATA_TABLES))
      setResults(null)
    } catch (err) {
      const key = errorMessage(err)
      toast.error(key === 'badFile' ? t('import.badFile') : errorMessage(err))
    }
  }

  function toggle(table: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(table)) next.delete(table)
      else next.add(table)
      return next
    })
  }

  async function onRestore() {
    if (!backup) return
    const tables = [...selected]
    if (tables.length === 0) {
      toast.error(t('import.nothingSelected'))
      return
    }
    const ok = await confirm({
      title: t('settings.importTrash'),
      message: t('import.confirm').replace('{n}', String(tables.length)),
      confirmLabel: t('import.restore'),
      danger: true,
    })
    if (!ok) return

    setBusy(true)
    setResults(null)
    try {
      const res = await restoreBackup(backup, tables, (tbl) =>
        setRunning(t('import.running').replace('{table}', tbl)),
      )
      setResults(res)
      const okRows = res.reduce((a, r) => a + r.ok, 0)
      const failRows = res.reduce((a, r) => a + r.failed, 0)
      const msg = t('import.done')
        .replace('{ok}', String(okRows))
        .replace('{failed}', String(failRows))
      if (failRows > 0) toast.info(msg)
      else toast.success(msg)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
      setRunning(null)
    }
  }

  return (
    <Section icon={<ShieldCheck size={15} />} title={t('settings.importTrash')}>
      <p className="mb-3 text-[13px] text-ink-2">{t('import.desc')}</p>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
      />
      <Button
        variant="secondary"
        leftIcon={<Upload size={15} />}
        onClick={() => fileRef.current?.click()}
        disabled={busy}
      >
        {t('import.pick')}
      </Button>

      {backup && (
        <div className="mt-4 space-y-4">
          <p className="text-[12.5px] text-ink-3">
            {t('import.fileInfo')
              .replace('{date}', backup.exported_at?.slice(0, 16).replace('T', ' ') ?? '—')
              .replace('{tables}', String(Object.keys(backup.tables ?? {}).length))
              .replace(
                '{rows}',
                String(Object.values(backup.counts ?? {}).reduce((a, n) => a + n, 0)),
              )}
          </p>

          <TableGroup
            title={t('import.groupData')}
            tables={DATA_TABLES}
            selected={selected}
            onToggle={toggle}
            count={rowCount}
            disabled={busy}
          />

          <div>
            <TableGroup
              title={t('import.groupAccounts')}
              tables={ACCOUNT_TABLES}
              selected={selected}
              onToggle={toggle}
              count={rowCount}
              disabled={busy}
            />
            <p className="mt-2 flex items-start gap-1.5 text-[12px] text-warn">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {t('import.accountsWarn')}
            </p>
          </div>

          <Button onClick={onRestore} loading={busy}>
            {t('import.restore')}
          </Button>

          {running && <p className="text-[12.5px] text-ink-3">{running}</p>}

          {results && (
            <ul className="space-y-1 rounded-[12px] bg-surface-2 p-3 text-[12.5px]">
              {results
                .filter((r) => r.attempted > 0)
                .map((r) => (
                  <li key={r.table} className="flex justify-between gap-3">
                    <span className="font-mono text-ink-2">{r.table}</span>
                    <span className={r.failed > 0 ? 'text-warn' : 'text-success'}>
                      {r.ok}/{r.attempted}
                      {r.failed > 0 && r.error ? ` · ${r.error}` : ''}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </Section>
  )
}

function TableGroup({
  title,
  tables,
  selected,
  onToggle,
  count,
  disabled,
}: {
  title: string
  tables: readonly string[]
  selected: Set<string>
  onToggle: (t: string) => void
  count: (t: string) => number
  disabled: boolean
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-3">{title}</p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {tables.map((tbl) => (
          <label
            key={tbl}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-[10px] px-2.5 py-1.5 hover:bg-surface-2"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.has(tbl)}
                onChange={() => onToggle(tbl)}
                disabled={disabled}
                className="h-4 w-4 accent-accent"
              />
              <span className="font-mono text-[12.5px] text-ink-2">{tbl}</span>
            </span>
            <span className="text-[12px] text-ink-3">{count(tbl)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
