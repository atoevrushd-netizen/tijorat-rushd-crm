import { useState, type FormEvent } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n/useT'
import {
  useAllTabs,
  useCreateTab,
  useDeleteTab,
  useUpdateTab,
} from '@/features/tabs/useTabs'

/** Простое управление вкладками (вкл/выкл, порядок, добавить/удалить). */
export function TabsManagerPage() {
  const { t } = useT()
  const { data: tabs, isLoading } = useAllTabs()
  const create = useCreateTab()
  const update = useUpdateTab()
  const remove = useDeleteTab()
  const [key, setKey] = useState('')
  const [title, setTitle] = useState('')

  function add(e: FormEvent) {
    e.preventDefault()
    if (!key.trim() || !title.trim()) return
    const nextOrder =
      (tabs && tabs.length ? Math.max(...tabs.map((x) => x.sort_order)) : 0) + 1
    create.mutate(
      { key: key.trim(), title: title.trim(), sort_order: nextOrder },
      {
        onSuccess: () => {
          setKey('')
          setTitle('')
        },
      },
    )
  }

  function move(index: number, dir: -1 | 1) {
    if (!tabs) return
    const a = tabs[index]
    const b = tabs[index + dir]
    if (!a || !b) return
    update.mutate({ id: a.id, patch: { sort_order: b.sort_order } })
    update.mutate({ id: b.id, patch: { sort_order: a.sort_order } })
  }

  return (
    <AppShell title={t('page.tabs')} nav={adminNav}>
      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Вкладки карточки</h2>
        <p className="mt-1 text-sm text-ink-2">
          Вкладки приходят из БД. Новая вкладка автоматически появляется во всех
          карточках — без переписывания кода.
        </p>

        {isLoading && <p className="mt-4 text-sm text-ink-3">Загрузка…</p>}

        {tabs && (
          <ul className="mt-4 divide-y divide-line">
            {tabs.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{t.title}</div>
                  <div className="font-mono text-[11px] text-ink-3">
                    key: {t.key} · порядок: {t.sort_order}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="px-2 text-ink-2 hover:text-ink disabled:opacity-30"
                  aria-label="Выше"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === tabs.length - 1}
                  className="px-2 text-ink-2 hover:text-ink disabled:opacity-30"
                  aria-label="Ниже"
                >
                  ↓
                </button>
                <label className="flex items-center gap-1.5 text-xs text-ink-2">
                  <input
                    type="checkbox"
                    checked={t.is_active}
                    onChange={(e) =>
                      update.mutate({
                        id: t.id,
                        patch: { is_active: e.target.checked },
                      })
                    }
                    className="accent-accent"
                  />
                  активна
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Удалить вкладку «${t.title}»? Задачи этой вкладки станут недоступны в интерфейсе.`,
                      )
                    )
                      remove.mutate(t.id)
                  }}
                  className="text-sm text-danger hover:opacity-80"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={add} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="ключ (sales, kpi)" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название вкладки" />
          <Button type="submit" loading={create.isPending}>Добавить</Button>
        </form>
        {create.isError && (
          <p className="mt-2 text-sm text-danger">
            {create.error instanceof Error ? create.error.message : 'Не удалось добавить вкладку'}
          </p>
        )}
      </section>
    </AppShell>
  )
}
