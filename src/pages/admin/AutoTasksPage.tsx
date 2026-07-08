import { useEffect, useState, type FormEvent } from 'react'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useT } from '@/i18n/useT'
import { TemplateRow } from '@/features/autotasks/TemplateRow'
import {
  useCreateGroup,
  useCreateTemplate,
  useDeleteGroup,
  useDeleteTemplate,
  useDuplicateGroup,
  useGroups,
  useSettings,
  useTemplates,
  useUpdateSettings,
  useUpdateTemplate,
} from '@/features/autotasks/useAutoTasks'

/** iOS-переключатель. */
function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-success' : 'bg-surface-3',
      )}
    >
      <span
        className={cn(
          'absolute left-[2px] top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform duration-200 ease-ios',
          checked && 'translate-x-[20px]',
        )}
      />
    </button>
  )
}

export function AutoTasksPage() {
  const { t } = useT()
  const settingsQ = useSettings()
  const groupsQ = useGroups()
  const updateSettings = useUpdateSettings()
  const createGroup = useCreateGroup()
  const duplicateGroup = useDuplicateGroup()
  const deleteGroup = useDeleteGroup()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!editingId && settingsQ.data?.active_group_id) {
      setEditingId(settingsQ.data.active_group_id)
    }
  }, [editingId, settingsQ.data])

  useEffect(() => {
    const groups = groupsQ.data
    if (groups && editingId && !groups.find((g) => g.id === editingId)) {
      setEditingId(groups[0]?.id ?? null)
    }
  }, [groupsQ.data, editingId])

  const templatesQ = useTemplates(editingId)
  const createTemplate = useCreateTemplate(editingId ?? '')
  const updateTemplate = useUpdateTemplate(editingId ?? '')
  const deleteTemplate = useDeleteTemplate(editingId ?? '')

  const settings = settingsQ.data
  const groups = groupsQ.data ?? []
  const activeId = settings?.active_group_id ?? null
  const editingGroup = groups.find((g) => g.id === editingId) ?? null
  const templates = templatesQ.data ?? []

  function addGroup() {
    const name = newName.trim()
    if (!name) return
    createGroup.mutate(name, {
      onSuccess: (g) => {
        setEditingId(g.id)
        setNewName('')
        toast.success(t('common.created'))
      },
    })
  }

  function duplicate() {
    if (!editingGroup) return
    duplicateGroup.mutate(
      { sourceId: editingGroup.id, name: `${editingGroup.name} (копия)` },
      {
        onSuccess: (g) => {
          setEditingId(g.id)
          toast.success(t('common.created'))
        },
      },
    )
  }

  async function removeGroup() {
    if (!editingGroup) return
    const ok = await confirm({
      message: t('at.confirmDeleteGroup'),
      danger: true,
      confirmLabel: t('at.deleteGroup'),
    })
    if (ok) {
      deleteGroup.mutate(editingGroup.id, {
        onSuccess: () => toast.success(t('common.deleted')),
      })
    }
  }

  return (
    <AppShell title={t('page.autotasks')} subtitle={t('at.hint')}>
      {settingsQ.isLoading || groupsQ.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-[18px]" />
          <Skeleton className="h-24 w-full rounded-[18px]" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Тумблер вкл/выкл */}
          <section className="flex items-center justify-between gap-4 rounded-[18px] border border-line bg-surface p-5 shadow-sh1">
            <div className="min-w-0">
              <div className="font-semibold text-ink">{t('at.enabled')}</div>
              <div className="mt-0.5 text-[13px] text-ink-3">
                {settings?.auto_tasks_enabled ? t('at.enabledOn') : t('at.enabledOff')}
              </div>
            </div>
            <Switch
              checked={!!settings?.auto_tasks_enabled}
              onChange={(v) =>
                updateSettings.mutate(
                  { auto_tasks_enabled: v },
                  { onSuccess: () => toast.success(t('common.saved')) },
                )
              }
            />
          </section>

          {/* Группы */}
          <section className="space-y-3 rounded-[18px] border border-line bg-surface p-5 shadow-sh1">
            <div className="text-[15px] font-bold text-ink">{t('at.groups')}</div>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setEditingId(g.id)}
                  className={cn(
                    'rounded-[12px] px-3.5 py-1.5 text-[13px] font-medium transition-all',
                    editingId === g.id
                      ? 'bg-accent-grad text-on-accent shadow-glow'
                      : 'bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink',
                  )}
                >
                  {g.name}
                  {g.id === activeId && (
                    <span className="ml-1.5 opacity-80">• {t('at.active')}</span>
                  )}
                </button>
              ))}
            </div>

            {editingGroup && (
              <div className="flex flex-wrap gap-2">
                {editingGroup.id !== activeId && (
                  <Button
                    size="sm"
                    onClick={() =>
                      updateSettings.mutate(
                        { active_group_id: editingGroup.id },
                        { onSuccess: () => toast.success(t('common.saved')) },
                      )
                    }
                  >
                    {t('at.makeActive')}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Copy size={14} />}
                  loading={duplicateGroup.isPending}
                  onClick={duplicate}
                >
                  {t('at.duplicate')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<Trash2 size={14} />}
                  onClick={removeGroup}
                >
                  {t('at.deleteGroup')}
                </Button>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('at.newGroupName')}
                className="input-box flex-1"
              />
              <Button variant="secondary" leftIcon={<Plus size={15} />} onClick={addGroup}>
                {t('at.create')}
              </Button>
            </div>
          </section>

          {/* Задачи группы */}
          {editingGroup && (
            <section className="space-y-3 rounded-[18px] border border-line bg-surface p-5 shadow-sh1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[15px] font-bold text-ink">
                  {t('at.tasksOf')} «{editingGroup.name}»
                </div>
                <div className="font-mono text-[12px] text-ink-3">
                  {templates.length} {t('at.count')}
                </div>
              </div>

              <AddTaskForm
                onAdd={(v) =>
                  createTemplate.mutate(
                    { ...v, sort_order: templates.length + 1 },
                    { onSuccess: () => toast.success(t('common.saved')) },
                  )
                }
              />

              {templatesQ.isLoading ? (
                <Skeleton className="h-40 w-full rounded-[12px]" />
              ) : templates.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-3">{t('at.empty')}</p>
              ) : (
                <div className="space-y-2">
                  {templates.map((tpl) => (
                    <TemplateRow
                      key={tpl.id}
                      template={tpl}
                      onSave={(patch) =>
                        updateTemplate.mutate(
                          { id: tpl.id, patch },
                          { onSuccess: () => toast.success(t('common.saved')) },
                        )
                      }
                      onDelete={() =>
                        deleteTemplate.mutate(tpl.id, {
                          onSuccess: () => toast.success(t('common.deleted')),
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </AppShell>
  )
}

/** Форма добавления новой задачи в группу. */
function AddTaskForm({
  onAdd,
}: {
  onAdd: (v: {
    tab_key: string
    title: string
    task_type: string | null
    deadline: string | null
  }) => void
}) {
  const { t } = useT()
  const [title, setTitle] = useState('')
  const [tab, setTab] = useState('calendar')
  const [type, setType] = useState('other')
  const [date, setDate] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ tab_key: tab, title: title.trim(), task_type: type, deadline: date || null })
    setTitle('')
    setDate('')
  }

  const sel = 'rounded-[10px] border border-line bg-surface px-2 py-2 text-[13px] text-ink outline-none focus:border-accent'

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-[12px] border border-dashed border-line-strong p-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('at.title')}
        className="min-w-[140px] flex-1 rounded-[10px] border border-line bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
      />
      <select value={tab} onChange={(e) => setTab(e.target.value)} className={sel}>
        <option value="calendar">{t('at.tabCalendar')}</option>
        <option value="media">{t('at.tabMedia')}</option>
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)} className={sel}>
        <option value="other">{t('at.typeOther')}</option>
        <option value="reels">{t('at.typeReels')}</option>
        <option value="creative">{t('at.typeCreative')}</option>
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={sel} />
      <Button size="sm" type="submit" leftIcon={<Plus size={15} />}>
        {t('at.addTask')}
      </Button>
    </form>
  )
}
