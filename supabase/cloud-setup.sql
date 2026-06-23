-- ============================================================
-- cloud-setup.sql — полная схема CRM для ОБЛАЧНОГО Supabase.
-- Сгенерировано из supabase/migrations/0001..0013 (в порядке).
-- Запуск: Supabase Dashboard → SQL Editor → New query → вставить → Run.
-- Выполнять ОДИН раз на свежем проекте.
-- ============================================================


-- ==================== supabase/migrations/0001_profiles.sql ====================
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


-- ==================== supabase/migrations/0002_leads.sql ====================
-- 0002_leads.sql
-- Фаза 1: лиды. Требование владельца — каждую регистрацию фиксировать как лид
-- (обязательно имя + телефон). Сама запись лида делается в формах
-- создания пользователя (Фаза 2) и самостоятельной регистрации (позже).

create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  phone             text not null,
  source            text,
  converted_user_id uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now()
);

-- ── Row Level Security: лиды видят и ведут только админы ─────────────────────
grant select, insert, update, delete on public.leads to authenticated, service_role;

alter table public.leads enable row level security;

create policy "leads_select_admin" on public.leads for select using (public.is_admin());
create policy "leads_insert_admin" on public.leads for insert with check (public.is_admin());
create policy "leads_update_admin" on public.leads for update using (public.is_admin());
create policy "leads_delete_admin" on public.leads for delete using (public.is_admin());


-- ==================== supabase/migrations/0003_profile_guard.sql ====================
-- 0003_profile_guard.sql
-- Защита от повышения привилегий: по RLS пользователь может править свой профиль,
-- но НЕ должен менять себе роль и статус. Это разрешено только администраторам.
--
-- Гейт «системный вызов?» делаем по auth.uid() IS NULL: у service_role (Edge Functions)
-- и postgres (миграции) нет JWT-пользователя → auth.uid() = NULL → без ограничений.
-- Это надёжнее, чем проверка current_user (которая зависит от SECURITY DEFINER/INVOKER).

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Системные вызовы (service_role, postgres) — без ограничений.
  if auth.uid() is null then
    return new;
  end if;

  -- Обычный пользователь не может менять себе роль и статус.
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Недостаточно прав для изменения роли';
    end if;
    if new.status is distinct from old.status then
      raise exception 'Недостаточно прав для изменения статуса';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();


-- ==================== supabase/migrations/0004_storage_avatars.sql ====================
-- 0004_storage_avatars.sql
-- Хранилище фото пользователей: публичный bucket `avatars`.
-- Читать может кто угодно (публичный bucket), загружать/менять/удалять — только админ.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Запись в bucket — только администраторам.
create policy "avatars_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and public.is_admin());

create policy "avatars_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

create policy "avatars_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

-- Чтение — всем (bucket публичный; политика для полноты).
create policy "avatars_public_read" on storage.objects
  for select
  using (bucket_id = 'avatars');


-- ==================== supabase/migrations/0005_achievements.sql ====================
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


-- ==================== supabase/migrations/0006_tabs.sql ====================
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


-- ==================== supabase/migrations/0007_tasks.sql ====================
-- 0007_tasks.sql
-- Задачи (вкладка «Медиа/Контент» и будущие) + ссылки на материалы.
-- Статус — единый enum из 6 состояний (по ТЗ). Принятие пользователем выражено
-- статусами sent_to_user / accepted_by_user / needs_revision.

create type task_status as enum (
  'not_started',
  'in_progress',
  'done',
  'sent_to_user',
  'accepted_by_user',
  'needs_revision'
);

create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  tab_id        uuid references public.tabs (id) on delete set null,
  title         text not null,
  task_type     text,                              -- 'reels' | 'creative' (гибко)
  status        task_status not null default 'not_started',
  deadline      date,
  admin_comment text,
  user_comment  text,
  created_by    uuid references public.profiles (id) on delete set null,
  updated_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  sent_at       timestamptz,
  accepted_at   timestamptz,
  updated_at    timestamptz not null default now()
);
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_tab_id_idx on public.tasks (tab_id);

create table public.task_links (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks (id) on delete cascade,
  url        text not null,
  label      text,
  created_at timestamptz not null default now()
);
create index task_links_task_id_idx on public.task_links (task_id);

grant select, insert, update, delete on public.tasks to authenticated, service_role;
grant select, insert, update, delete on public.task_links to authenticated, service_role;

-- Авто-таймстемпы: updated_at, sent_at, accepted_at по смене статуса.
create or replace function public.tasks_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status = 'sent_to_user'
     and old.status is distinct from 'sent_to_user' and new.sent_at is null then
    new.sent_at = now();
  end if;
  if new.status = 'accepted_by_user'
     and old.status is distinct from 'accepted_by_user' and new.accepted_at is null then
    new.accepted_at = now();
  end if;
  return new;
end; $$;
create trigger tasks_touch_trg before update on public.tasks
  for each row execute function public.tasks_touch();

-- RLS: задачи видят свой владелец и админ; вести (insert/update/delete) — только админ.
alter table public.tasks enable row level security;
create policy "tasks_select_own_or_admin" on public.tasks
  for select using (user_id = auth.uid() or public.is_admin());
create policy "tasks_insert_admin" on public.tasks for insert with check (public.is_admin());
create policy "tasks_update_admin" on public.tasks for update using (public.is_admin());
create policy "tasks_delete_admin" on public.tasks for delete using (public.is_admin());

alter table public.task_links enable row level security;
create policy "task_links_select_own_or_admin" on public.task_links
  for select using (
    exists (
      select 1 from public.tasks t
      where t.id = task_links.task_id
        and (t.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "task_links_insert_admin" on public.task_links for insert with check (public.is_admin());
create policy "task_links_update_admin" on public.task_links for update using (public.is_admin());
create policy "task_links_delete_admin" on public.task_links for delete using (public.is_admin());

-- Пользователь принимает/возвращает СВОЮ задачу и только если она ему отправлена.
create or replace function public.respond_to_task(
  p_task_id uuid,
  p_accept  boolean,
  p_comment text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_owner  uuid;
  v_status task_status;
begin
  select user_id, status into v_owner, v_status from public.tasks where id = p_task_id;
  if v_owner is null then
    raise exception 'Задача не найдена';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'Это не ваша задача';
  end if;
  if v_status <> 'sent_to_user' then
    raise exception 'Принять или вернуть можно только отправленную задачу';
  end if;

  if p_accept then
    update public.tasks
      set status = 'accepted_by_user',
          user_comment = coalesce(p_comment, user_comment)
      where id = p_task_id;
  else
    update public.tasks
      set status = 'needs_revision', user_comment = p_comment
      where id = p_task_id;
  end if;
end; $$;

revoke all on function public.respond_to_task(uuid, boolean, text) from public;
grant execute on function public.respond_to_task(uuid, boolean, text) to authenticated;


-- ==================== supabase/migrations/0008_activity_log.sql ====================
-- 0008_activity_log.sql
-- История действий: что/кто/когда. Пишется автоматически триггерами,
-- поэтому фиксируется независимо от того, какой клиент сделал изменение.

create table public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete cascade,  -- субъект (чья карточка)
  actor_id    uuid references public.profiles (id) on delete set null, -- кто сделал
  entity_type text not null,   -- 'task' | 'profile' | 'achievement'
  entity_id   uuid,
  action      text not null,   -- 'created' | 'status_changed' | ...
  details     jsonb,
  created_at  timestamptz not null default now()
);
create index activity_log_user_idx on public.activity_log (user_id, created_at desc);

grant select on public.activity_log to authenticated, service_role;
alter table public.activity_log enable row level security;

-- читать историю может субъект (свою) и админ (любую)
create policy "activity_select_own_or_admin" on public.activity_log
  for select using (user_id = auth.uid() or public.is_admin());

-- Авто-логирование задач (SECURITY DEFINER → запись от владельца, обходит RLS).
create or replace function public.log_task_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.activity_log (user_id, actor_id, entity_type, entity_id, action, details)
    values (new.user_id, auth.uid(), 'task', new.id, 'created',
            jsonb_build_object('title', new.title, 'task_type', new.task_type));
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status then
    insert into public.activity_log (user_id, actor_id, entity_type, entity_id, action, details)
    values (new.user_id, auth.uid(), 'task', new.id, 'status_changed',
            jsonb_build_object('title', new.title, 'from', old.status, 'to', new.status));
  end if;
  return null; -- AFTER-триггер
end; $$;

create trigger tasks_activity_ins after insert on public.tasks
  for each row execute function public.log_task_activity();
create trigger tasks_activity_upd after update on public.tasks
  for each row execute function public.log_task_activity();


-- ==================== supabase/migrations/0009_profile_guard_fields.sql ====================
-- 0009_profile_guard_fields.sql
-- Усиление стража профиля: обычный пользователь может менять у СЕБЯ только
-- безопасные поля (full_name, phone, photo_url). Роль, статус, login, email,
-- admin_comment, business_direction, дату регистрации — менять не может.
-- (Раньше блокировались только role и status.)
-- Системные вызовы (service_role / postgres) и админ — без ограничений.

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new; -- системные вызовы (service_role в Edge Functions, миграции)
  end if;
  if public.is_admin() then
    return new; -- администратор может всё
  end if;

  -- Обычный пользователь: запрещаем менять защищённые поля у своего профиля.
  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.login is distinct from old.login
     or new.email is distinct from old.email
     or new.admin_comment is distinct from old.admin_comment
     or new.business_direction is distinct from old.business_direction
     or new.registration_date is distinct from old.registration_date then
    raise exception 'Недостаточно прав для изменения этих полей профиля';
  end if;

  return new;
end;
$$;


-- ==================== supabase/migrations/0010_storage_avatars_self.sql ====================
-- 0010_storage_avatars_self.sql
-- Разрешаем пользователю загружать/менять/удалять ТОЛЬКО свой аватар.
-- Имя файла аватара = "<user_id>.<ext>" (см. uploadAvatar), поэтому проверяем,
-- что объект начинается с id вызывающего. Политики админа (0004) остаются — они OR-ятся.

create policy "avatars_self_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and name like (auth.uid()::text || '.%'));

create policy "avatars_self_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and name like (auth.uid()::text || '.%'));

create policy "avatars_self_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and name like (auth.uid()::text || '.%'));


-- ==================== supabase/migrations/0011_calendar.sql ====================
-- 0011_calendar.sql
-- Календарь задач в карточке. Решения владельца:
--   • задачи храним в существующей tasks (единый источник правды) — добавляем только время дня;
--   • период «подписки» (сотрудничества) лида задаёт админ вручную — новые поля в profiles;
--   • календарь — новая вкладка через гибкую систему tabs (видна и админу, и лиду).
-- Всё неразрушающе/идемпотентно: применять `supabase migration up` (НЕ db reset).

-- 1) Время выполнения задачи. День задачи — это tasks.deadline (date); здесь — время дня.
alter table public.tasks add column if not exists due_time time;

-- 2) Период подписки лида (диапазон сотрудничества). Задаёт только админ.
alter table public.profiles add column if not exists subscription_start date;
alter table public.profiles add column if not exists subscription_end   date;

-- 3) Страж профиля: дополнительно запрещаем обычному пользователю менять поля подписки.
--    (Дополняет 0009: role/status/login/email/admin_comment/business_direction/registration_date.)
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new; -- системные вызовы (service_role в Edge Functions, миграции)
  end if;
  if public.is_admin() then
    return new; -- администратор может всё
  end if;

  -- Обычный пользователь: запрещаем менять защищённые поля у своего профиля.
  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.login is distinct from old.login
     or new.email is distinct from old.email
     or new.admin_comment is distinct from old.admin_comment
     or new.business_direction is distinct from old.business_direction
     or new.registration_date is distinct from old.registration_date
     or new.subscription_start is distinct from old.subscription_start
     or new.subscription_end is distinct from old.subscription_end then
    raise exception 'Недостаточно прав для изменения этих полей профиля';
  end if;

  return new;
end;
$$;

-- 4) Вкладка «Календарь» (data-driven). sort_order 0 — показываем первой.
insert into public.tabs (key, title, icon, sort_order, is_active)
values ('calendar', 'Календарь', 'calendar', 0, true)
on conflict (key) do nothing;


-- ==================== supabase/migrations/0012_user_credentials.sql ====================
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


-- ==================== supabase/migrations/0013_user_credentials_hardening.sql ====================
-- 0013_user_credentials_hardening.sql
-- Закалка таблицы паролей по итогам ревью безопасности (находки low, не эксплойты).
--   1) FORCE RLS — политики применяются даже к роли-владельцу таблицы (defense-in-depth).
--      service_role (Edge Functions) имеет BYPASSRLS и продолжает работать.
--   2) updated_at теперь обновляется и при смене пароля (а не только при создании строки).

alter table public.user_credentials force row level security;

create trigger user_credentials_set_updated_at
  before update on public.user_credentials
  for each row execute function public.set_updated_at();

