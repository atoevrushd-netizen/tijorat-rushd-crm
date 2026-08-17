-- 0061_profile_column_privacy.sql — админ-поля профиля недоступны резиденту (аудит v3, M1).
-- RLS фильтрует СТРОКИ, а не колонки: резидент мог прямым GET к REST вытянуть свои
-- admin_comment (внутренняя заметка админа о нём!), plan_months и paid_at.
-- Решение — колоночные привилегии: у роли authenticated отзываем SELECT на эти три
-- колонки, а админам отдаём их через SECURITY DEFINER view с тем же RLS-смыслом.
--
-- Что видит кто:
--   • резидент (таблица profiles):    всё, КРОМЕ admin_comment / plan_months / paid_at
--   • админ (view profiles_admin):     всё, включая эти три (RLS: is_admin())
-- Фронт админа читает profiles_admin вместо profiles (listUsers/getUser/search/dashboard/chat).
-- subscription_start/end резидент видит легитимно (экран «Настройки» → период подписки).

-- 1) Отзываем общий SELECT и выдаём поколоночно (все, кроме приватных).
revoke select on public.profiles from authenticated;
grant select (
  id, full_name, phone, email, photo_url, role, status, business_direction, login,
  subscription_start, subscription_end, registration_date, created_at, updated_at,
  deleted_at, deactivated_at
) on public.profiles to authenticated;

-- 2) Админский view: полная строка. security_invoker=off (по умолчанию) — читает как
--    владелец (postgres), поэтому колоночный revoke его не касается; строки фильтруем
--    сами: только админ/разработчик видит через него что-либо.
create or replace view public.profiles_admin as
  select p.*
  from public.profiles p
  where public.is_admin();
grant select on public.profiles_admin to authenticated;

-- 3) UPDATE админ-полей резидентом и так запрещён (guard_profile_update — белый список);
--    колоночные привилегии на UPDATE не трогаем: админ пишет в profiles напрямую.

-- 4) dashboard_counts — SECURITY INVOKER и читает paid_at: после отзыва колонки у
--    authenticated упал бы. Переводим подсчёт по профилям на profiles_admin (у админа
--    даёт те же строки; у не-админа — 0, что и правильно).
create or replace function public.dashboard_counts()
returns jsonb language sql stable security invoker set search_path = public as $$
  with t as (
    select t.status from public.tasks t
    join public.profiles_admin p on p.id = t.user_id
    where t.period_month is not null and p.role = 'user' and p.deleted_at is null
  )
  select jsonb_build_object(
    'users_total',      (select count(*) from public.profiles_admin where role = 'user' and deleted_at is null),
    'users_active',     (select count(*) from public.profiles_admin where role = 'user' and deleted_at is null and status = 'active'),
    'users_paid',       (select count(*) from public.profiles_admin where role = 'user' and deleted_at is null and paid_at is not null),
    'not_started',      (select count(*) from t where status = 'not_started'),
    'in_progress',      (select count(*) from t where status = 'in_progress'),
    'submitted',        (select count(*) from t where status = 'submitted'),
    'done',             (select count(*) from t where status = 'done'),
    'sent_to_user',     (select count(*) from t where status = 'sent_to_user'),
    'accepted_by_user', (select count(*) from t where status = 'accepted_by_user'),
    'needs_revision',   (select count(*) from t where status = 'needs_revision')
  );
$$;
grant execute on function public.dashboard_counts() to authenticated;
