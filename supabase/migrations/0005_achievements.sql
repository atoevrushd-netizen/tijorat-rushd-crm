-- 0005_achievements.sql
-- Достижения пользователя (блок в карточке). Добавляет администратор,
-- пользователь видит свои.

create table public.achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text,
  achieved_at date,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index achievements_user_id_idx on public.achievements (user_id);

grant select, insert, update, delete on public.achievements to authenticated, service_role;
alter table public.achievements enable row level security;

-- читать: свои достижения или (админ) все
create policy "achievements_select_own_or_admin" on public.achievements
  for select using (user_id = auth.uid() or public.is_admin());

-- добавлять/менять/удалять — только администратор
create policy "achievements_insert_admin" on public.achievements
  for insert with check (public.is_admin());
create policy "achievements_update_admin" on public.achievements
  for update using (public.is_admin());
create policy "achievements_delete_admin" on public.achievements
  for delete using (public.is_admin());
