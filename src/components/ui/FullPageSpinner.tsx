import { Spinner } from './Spinner'

/** Полноэкранный индикатор загрузки (на фоне приложения). */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <Spinner size={32} />
    </div>
  )
}
