-- 0025_guard_subscription_deleted.sql
-- Фикс регрессии из 0024: при переписывании guard потерялась защита полей
-- subscription_start/end (0011) и deleted_at (0014). Без неё лид мог через API
-- продлить себе подписку или выставить/снять deleted_at (спрятаться/самовосстановиться).
-- Возвращаем эти поля в защищённый список (роль по-прежнему меняет только разработчик).

create or replace function public.guard_profile_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then
    return new; -- системные вызовы (service_role, миграции)
  end if;

  -- Смену роли разрешаем только разработчику.
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
     or new.subscription_start is distinct from old.subscription_start
     or new.subscription_end is distinct from old.subscription_end
     or new.deleted_at is distinct from old.deleted_at
     or new.registration_date is distinct from old.registration_date then
    raise exception 'Недостаточно прав для изменения этих полей профиля';
  end if;

  return new;
end $$;
