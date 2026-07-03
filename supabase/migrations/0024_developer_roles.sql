-- 0024_developer_roles.sql
-- Разработчик = супер-админ: наследует все права админа (is_admin включает 'developer'),
-- плюс единственный, кто может менять роли. Гибкие флаги приложения (app_settings.flags).

-- Админские права — у admin И developer.
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'developer')
  );
$$;

-- Разработчик (супер-доступ, управление ролями).
create or replace function public.is_developer()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'developer'
  );
$$;

-- Guard: роль меняет ТОЛЬКО разработчик; остальное — как раньше (админ всё, лид только своё безопасное).
create or replace function public.guard_profile_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then
    return new; -- системные вызовы (service_role, миграции)
  end if;

  -- Смену роли разрешаем только разработчику (защита от эскалации привилегий).
  if new.role is distinct from old.role and not public.is_developer() then
    raise exception 'Роль может менять только разработчик';
  end if;

  if public.is_admin() then
    return new; -- админ/разработчик — остальное можно
  end if;

  -- Обычный пользователь: запрещаем менять защищённые поля своего профиля.
  if new.status is distinct from old.status
     or new.login is distinct from old.login
     or new.email is distinct from old.email
     or new.admin_comment is distinct from old.admin_comment
     or new.business_direction is distinct from old.business_direction
     or new.registration_date is distinct from old.registration_date then
    raise exception 'Недостаточно прав для изменения этих полей профиля';
  end if;

  return new;
end $$;

-- Гибкие флаги приложения (управляет разработчик).
alter table public.app_settings add column if not exists flags jsonb not null default '{}'::jsonb;
