import { Button } from '@/components/ui/Button'
import { useAuth } from './useAuth'

/** Пользователь авторизован, но профиль/роль не загрузились или не настроены. */
export function NoProfileScreen() {
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
      <p className="text-lg font-bold text-ink">Профиль недоступен</p>
      <p className="mt-2 max-w-md text-sm text-ink-2">
        Вы вошли, но профиль не загрузился или ещё не настроен. Обновите страницу
        или обратитесь к администратору.
      </p>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => window.location.reload()}>Обновить</Button>
        <Button variant="secondary" onClick={() => void signOut()}>
          Выйти
        </Button>
      </div>
    </div>
  )
}
