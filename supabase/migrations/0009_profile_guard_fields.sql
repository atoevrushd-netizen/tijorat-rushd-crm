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
