-- 0001_profiles.sql
-- Фаза 1: профили пользователей, роли/статусы, безопасность (RLS).
-- Запускать один раз на чистом проекте Supabase (SQL Editor или supabase db push).

-- ── Перечисления ──────────────────────────────────────────────────────────
create type user_role as enum ('admin', 'user');
create type user_status as enum ('active', 'paused', 'archived');

-- ── Таблица профилей (расширяет встроенную auth.users) ──────────────────────
create table public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text,
  phone              text,
  email              text,
  photo_url          text,
  role               user_role   not null default 'user',
  status             user_status not null default 'active',
  business_direction text,
  login              text unique,
  admin_comment      text,
  registration_date  timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Хелпер: является ли текущий пользователь админом ────────────────────────
-- SECURITY DEFINER → выполняется от владельца (обходит RLS), поэтому при
-- использовании внутри политик profiles НЕТ бесконечной рекурсии.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Авто-создание профиля при регистрации нового пользователя ───────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Авто-обновление updated_at ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Привилегии на таблицу для API-ролей (RLS ниже ограничивает доступ к строкам).
grant select, insert, update, delete on public.profiles to authenticated, service_role;

alter table public.profiles enable row level security;

-- читать: своё или (если админ) всё
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- обновлять: своё или (если админ) всё
-- (ограничение полей, которые может менять обычный пользователь, делаем в Фазе 2/5)
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- создавать/удалять профили напрямую — только админ
-- (триггер handle_new_user работает как SECURITY DEFINER и обходит эту политику)
create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.is_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin());
