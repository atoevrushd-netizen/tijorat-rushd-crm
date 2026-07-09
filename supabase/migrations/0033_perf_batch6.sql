-- 0033_perf_batch6.sql
-- Батч 6 (производительность): trigram-индексы для поиска лидов, одна RPC для
-- счётчиков дашборда, триггер updated_at у app_settings, индекс activity_log.

-- 1) Поиск лидов ilike '%..%' → GIN-индексы pg_trgm (без seq scan на каждый ввод).
create extension if not exists pg_trgm;
create index if not exists profiles_fullname_trgm on public.profiles using gin (full_name gin_trgm_ops);
create index if not exists profiles_phone_trgm on public.profiles using gin (phone gin_trgm_ops);
create index if not exists profiles_login_trgm on public.profiles using gin (login gin_trgm_ops);

-- 2) Дашборд: все счётчики одним запросом (было ~10 round-trip).
--    security invoker → уважает RLS (админ видит всё; лид — только своё, не утечка).
create or replace function public.dashboard_counts()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'users_total',      (select count(*) from public.profiles where role = 'user' and deleted_at is null),
    'users_active',     (select count(*) from public.profiles where role = 'user' and deleted_at is null and status = 'active'),
    'not_started',      (select count(*) from public.tasks where status = 'not_started'),
    'in_progress',      (select count(*) from public.tasks where status = 'in_progress'),
    'done',             (select count(*) from public.tasks where status = 'done'),
    'sent_to_user',     (select count(*) from public.tasks where status = 'sent_to_user'),
    'accepted_by_user', (select count(*) from public.tasks where status = 'accepted_by_user'),
    'needs_revision',   (select count(*) from public.tasks where status = 'needs_revision')
  );
$$;
grant execute on function public.dashboard_counts() to authenticated;

-- 3) app_settings.updated_at — через триггер (как у остальных таблиц).
drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- 4) Индекс под ленту/уведомления (сортировка по времени).
create index if not exists activity_log_created_idx on public.activity_log (created_at desc);
