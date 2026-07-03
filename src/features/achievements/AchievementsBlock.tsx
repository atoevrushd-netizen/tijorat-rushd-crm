import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import {
  useAchievements,
  useAddAchievement,
  useDeleteAchievement,
} from './useAchievements'

/** Блок достижений: просмотр — по правам, добавление — админу. */
export function AchievementsBlock({ userId }: { userId: string }) {
  const { t } = useT()
  const { role, profile } = useAuth()
  const isAdmin = role === 'admin'
  const { data: items, isLoading } = useAchievements(userId)
  const add = useAddAchievement(userId)
  const del = useDeleteAchievement(userId)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    add.mutate(
      {
        user_id: userId,
        title: title.trim(),
        achieved_at: date || undefined,
        created_by: profile?.id ?? null,
      },
      {
        onSuccess: () => {
          setTitle('')
          setDate('')
          toast.success(t('common.created'))
        },
      },
    )
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <h2 className="text-base font-bold text-ink">{t('ach.title')}</h2>

      {isLoading && <p className="mt-2 text-sm text-ink-3">{t('misc.loading')}</p>}
      {items && items.length === 0 && (
        <p className="mt-2 text-sm text-ink-3">{t('ach.empty')}</p>
      )}
      {items && items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium text-ink">{a.title}</div>
                {a.description && (
                  <div className="text-xs text-ink-2">{a.description}</div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-xs text-ink-3">
                  {formatDate(a.achieved_at)}
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    aria-label={t('ach.deleteAria')}
                    onClick={async () => {
                      const ok = await confirm({
                        message: t('ach.deleteConfirm'),
                        danger: true,
                        confirmLabel: t('misc.delete'),
                      })
                      if (ok)
                        del.mutate(a.id, {
                          onSuccess: () => toast.success(t('common.deleted')),
                        })
                    }}
                    className="text-ink-3 transition-colors hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isAdmin && (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('ach.newPlaceholder')}
            />
          </div>
          <div className="sm:w-44">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button type="submit" loading={add.isPending}>
            {t('misc.add')}
          </Button>
        </form>
      )}
      {add.isError && (
        <p className="mt-2 text-sm text-danger">
          {add.error instanceof Error ? add.error.message : t('ach.addFail')}
        </p>
      )}
    </section>
  )
}
