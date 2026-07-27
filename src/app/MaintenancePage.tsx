import { Clock3 } from 'lucide-react'

/**
 * Экран «сайт на паузе». Полностью самодостаточен: НЕ подключает Supabase, роутер,
 * провайдеры или i18n — показывается вместо всего приложения, когда PAUSED = true в App.tsx.
 * Данные (облако Supabase) при этом не затрагиваются. Тексты двуязычные (ru + tg),
 * фиксированный светлый вид на океановом градиенте (не зависит от темы).
 */
export function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#3db6f8] via-[#2e7cf6] to-[#2563eb] px-4 py-10 text-center">
      <div className="w-full max-w-[440px] rounded-[28px] border border-white/40 bg-white/15 p-8 shadow-[0_24px_70px_-20px_rgba(12,38,86,0.55)] ring-1 ring-inset ring-white/25 backdrop-blur-xl sm:p-10">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/20 ring-1 ring-white/40">
          <Clock3 size={34} className="text-white" />
        </span>
        <h1 className="text-[22px] font-extrabold tracking-tight text-white">Tijorat &amp; Rushd CRM</h1>

        <p className="mt-4 text-[16px] font-bold text-white">Сайт временно на паузе</p>
        <p className="mt-1 text-[14px] leading-relaxed text-white/85">
          Идут технические работы — мы скоро вернёмся. Спасибо за терпение.
        </p>

        <div className="my-6 h-px w-full bg-white/25" />

        <p className="text-[15px] font-bold text-white">Сомона муваққатан дар танаффус</p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-white/85">
          Корҳои техникӣ идома доранд — ба зудӣ бармегардем. Ташаккур барои сабр.
        </p>
      </div>
    </main>
  )
}
