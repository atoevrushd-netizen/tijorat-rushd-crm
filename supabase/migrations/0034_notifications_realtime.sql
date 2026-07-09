-- 0034_notifications_realtime.sql
-- Уведомления в реальном времени: транслируем вставки в activity_log подписчикам
-- через Supabase Realtime. RLS activity_log сохраняется и для realtime — лид
-- получает события только своей карточки, админ — все (утечки нет).

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table public.activity_log;
  end if;
end $$;
