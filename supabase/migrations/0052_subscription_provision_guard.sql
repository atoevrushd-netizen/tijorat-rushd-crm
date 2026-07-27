-- 0052_subscription_provision_guard.sql — по итогам аудита.
--   provision_on_subscription (0049) не проверял app_settings.auto_tasks_enabled,
--   в отличие от INSERT-триггера provision_lead_tasks (0048). Из-за этого при
--   ВЫКЛЮЧЕННОЙ авто-выдаче изменение периода подписки всё равно создавало задачи.
--   Добавляем ту же охрану (ручная кнопка «Создать задачи по подписке» —
--   regenerate_monthly_tasks — намеренно работает всегда и здесь не затрагивается).

create or replace function public.provision_on_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tab uuid; v_m date; v_end date; s record;
begin
  if new.role <> 'user' then return new; end if;
  if new.subscription_start is null or new.subscription_end is null then return new; end if;
  -- только когда период реально изменился (впервые задан или сдвинут)
  if new.subscription_start is not distinct from old.subscription_start
     and new.subscription_end is not distinct from old.subscription_end then
    return new;
  end if;
  -- уважаем глобальный выключатель авто-выдачи (как и provision_lead_tasks)
  select auto_tasks_enabled into s from public.app_settings where id = 1;
  if not coalesce(s.auto_tasks_enabled, true) then return new; end if;
  select id into v_tab from public.tabs where key = 'calendar';
  v_m := date_trunc('month', new.subscription_start)::date;
  v_end := date_trunc('month', new.subscription_end)::date;
  while v_m <= v_end loop
    if not exists (select 1 from public.tasks where user_id = new.id and period_month = v_m) then
      perform public.provision_month(new.id, v_tab, v_m);
    end if;
    v_m := (v_m + interval '1 month')::date;
  end loop;
  return new;
end $$;
