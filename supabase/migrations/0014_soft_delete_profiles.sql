-- 0014_soft_delete_profiles.sql
-- Мягкое удаление лидов/пользователей: колонка deleted_at.
-- Списки показывают только активных (deleted_at is null); удалённые уходят в «Корзину»
-- и восстанавливаются обнулением deleted_at. Данные при удалении не теряются.

alter table public.profiles add column if not exists deleted_at timestamptz;
create index if not exists profiles_deleted_at_idx on public.profiles (deleted_at);

-- Страж профиля: обычный пользователь не может менять deleted_at (и ранее защищённые поля).
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

  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.login is distinct from old.login
     or new.email is distinct from old.email
     or new.admin_comment is distinct from old.admin_comment
     or new.business_direction is distinct from old.business_direction
     or new.registration_date is distinct from old.registration_date
     or new.subscription_start is distinct from old.subscription_start
     or new.subscription_end is distinct from old.subscription_end
     or new.deleted_at is distinct from old.deleted_at then
    raise exception 'Недостаточно прав для изменения этих полей профиля';
  end if;

  return new;
end;
$$;
