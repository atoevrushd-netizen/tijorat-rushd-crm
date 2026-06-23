import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RequireAuth, RequireRole } from '@/features/auth/guards'
import { HomeRedirect } from '@/features/auth/HomeRedirect'
import { FullPageSpinner } from '@/components/ui/FullPageSpinner'

// Ленивая загрузка разделов: код админки/кабинета грузится только после входа.
const DashboardPage = lazy(() =>
  import('@/pages/admin/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  })),
)
const UserCardPage = lazy(() =>
  import('@/pages/admin/UserCardPage').then((m) => ({ default: m.UserCardPage })),
)
const TabsManagerPage = lazy(() =>
  import('@/pages/admin/TabsManagerPage').then((m) => ({
    default: m.TabsManagerPage,
  })),
)
const UserCabinet = lazy(() =>
  import('@/pages/user/UserCabinet').then((m) => ({ default: m.UserCabinet })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

export function AppRouter() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          {/* / разводит по роли */}
          <Route path="/" element={<HomeRedirect />} />
          {/* Настройки доступны и админу, и лиду — содержимое зависит от роли */}
          <Route path="/settings" element={<SettingsPage />} />

          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/tabs" element={<TabsManagerPage />} />
            <Route path="/admin/users/:id" element={<UserCardPage />} />
          </Route>

          <Route element={<RequireRole role="user" />}>
            <Route path="/cabinet" element={<UserCabinet />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
