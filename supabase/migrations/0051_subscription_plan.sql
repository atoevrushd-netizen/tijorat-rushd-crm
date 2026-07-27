-- 0051_subscription_plan.sql — тип подписки лида как «метка»: 3 или 6 месяцев.
--   • profiles.plan_months — 3 | 6 | null. Это ярлык плана резидента. Период подписки
--     (subscription_start/end) по-прежнему задаёт админ; помесячные задачи создаёт
--     существующий триггер provision_on_subscription при изменении периода (0049).
--     Плюс: фронт при выборе плана авто-подставляет период (start = 1-е число месяца,
--     end = последний день (start + N месяцев − 1)), чего достаточно для авто-выдачи.
--   • Бэкфилл: текущие резиденты были заведены на 3-месячную программу → plan_months = 3.

alter table public.profiles
  add column if not exists plan_months smallint
    check (plan_months is null or plan_months in (3, 6));

-- Текущие резиденты (3-месячная программа) — помечаем ярлыком «3 мес».
update public.profiles
  set plan_months = 3
  where role = 'user' and plan_months is null;
