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
