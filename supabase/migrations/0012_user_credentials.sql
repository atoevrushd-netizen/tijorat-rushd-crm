-- 0012_user_credentials.sql
-- По требованию владельца: администратор видит выданные пароли ОТКРЫТО.
-- Supabase Auth хранит только bcrypt-хэш (расшифровать нельзя), поэтому пароль
-- дублируется здесь в открытом виде при создании пользователя и смене пароля.
--
-- ВНИМАНИЕ (безопасность): пароли в открытом виде — сознательный компромисс для
-- ВНУТРЕННЕЙ CRM, где админ сам выдаёт логин/пароль. Читать может ТОЛЬКО админ (RLS).
-- При переезде в облако учесть риск утечки БД. Заполняют Edge Functions (service_role).

create table if not exists public.user_credentials (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  password   text not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.user_credentials to authenticated, service_role;
alter table public.user_credentials enable row level security;

-- Читать и вести — ТОЛЬКО администратор. Обычный пользователь не видит даже свой пароль здесь.
create policy "creds_select_admin" on public.user_credentials
  for select using (public.is_admin());
create policy "creds_insert_admin" on public.user_credentials
  for insert with check (public.is_admin());
create policy "creds_update_admin" on public.user_credentials
  for update using (public.is_admin());
create policy "creds_delete_admin" on public.user_credentials
  for delete using (public.is_admin());
