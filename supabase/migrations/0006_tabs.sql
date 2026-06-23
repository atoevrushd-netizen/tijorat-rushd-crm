-- 0006_tabs.sql
-- Гибкая система вкладок: вкладки карточки хранятся ДАННЫМИ, а не кодом.
-- Добавить новую вкладку = добавить строку (без переписывания приложения).

create table public.tabs (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,          -- 'media', 'sales', 'kpi', ...
  title       text not null,                 -- 'Медиа / Контент'
  icon        text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  schema      jsonb,                          -- описание доп. полей вкладки (на будущее)
  created_at  timestamptz not null default now()
);

grant select, insert, update, delete on public.tabs to authenticated, service_role;
alter table public.tabs enable row level security;

-- читать вкладки могут все авторизованные; управлять — только админ
create policy "tabs_select_auth" on public.tabs
  for select to authenticated using (true);
create policy "tabs_insert_admin" on public.tabs
  for insert with check (public.is_admin());
create policy "tabs_update_admin" on public.tabs
  for update using (public.is_admin());
create policy "tabs_delete_admin" on public.tabs
  for delete using (public.is_admin());

-- Первая вкладка (см. ТЗ): «Медиа / Контент».
insert into public.tabs (key, title, icon, sort_order, is_active)
values ('media', 'Медиа / Контент', 'media', 1, true)
on conflict (key) do nothing;
