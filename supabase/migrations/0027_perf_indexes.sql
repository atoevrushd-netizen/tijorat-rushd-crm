-- 0027_perf_indexes.sql
-- Индексы под самые частые запросы (аудит производительности).

-- Список лидов и «недавние» на дашборде: role='user' AND deleted_at IS NULL ORDER BY registration_date DESC.
create index if not exists profiles_active_leads_idx
  on public.profiles (registration_date desc)
  where deleted_at is null and role = 'user';

-- «Последние задачи» на дашборде: ORDER BY updated_at DESC.
create index if not exists tasks_updated_at_idx on public.tasks (updated_at desc);

-- Счётчики задач по статусам (дашборд).
create index if not exists tasks_status_idx on public.tasks (status);

-- Фильтр задач вкладки: user_id + tab_id.
create index if not exists tasks_user_tab_idx on public.tasks (user_id, tab_id);
