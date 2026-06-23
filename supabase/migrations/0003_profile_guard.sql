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
