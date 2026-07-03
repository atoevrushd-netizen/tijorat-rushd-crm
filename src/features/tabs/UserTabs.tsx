import { useState, type ReactNode } from 'react'
import type { Tab } from '@/types'
import { useT } from '@/i18n/useT'
import { MediaTab } from '@/features/tasks/MediaTab'
import { CalendarTab } from '@/features/calendar/CalendarTab'
import { useActiveTabs } from './useTabs'

/** Универсальный рендерер вкладок карточки — строит вкладки ИЗ БД. */
export function UserTabs({ userId }: { userId: string }) {
  const { t } = useT()
  const { data: tabs, isLoading } = useActiveTabs()
  const [activeKey, setActiveKey] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Shell>
        <p className="px-4 py-6 text-sm text-ink-3">{t('userTabs.loading')}</p>
      </Shell>
    )
  }
  if (!tabs || tabs.length === 0) {
    return (
      <Shell>
        <p className="px-4 py-6 text-sm text-ink-3">{t('userTabs.empty')}</p>
      </Shell>
    )
  }

  const current = tabs.find((tab) => tab.key === activeKey) ?? tabs[0]

  return (
    <section className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap gap-1 border-b border-line p-2">
        {tabs.map((tab) => {
          const isActive = tab.key === current.key
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              className={
                isActive
                  ? 'rounded-md bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent'
                  : 'rounded-md px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink'
              }
            >
              {tab.title}
            </button>
          )
        })}
      </div>
      <div className="p-4">
        <TabContent tab={current} userId={userId} />
      </div>
    </section>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface">{children}</section>
  )
}

function TabContent({ tab, userId }: { tab: Tab; userId: string }) {
  if (tab.key === 'calendar') {
    return <CalendarTab userId={userId} tabId={tab.id} />
  }
  if (tab.key === 'media') {
    return <MediaTab userId={userId} tabId={tab.id} />
  }
  return null
}
