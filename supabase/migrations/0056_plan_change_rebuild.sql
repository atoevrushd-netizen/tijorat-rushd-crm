-- 0056_plan_change_rebuild.sql — смена плана пересобирает помесячные задачи.
-- БАГ: при переключении плана 6→3 (и вообще при смене плана/усечении периода)
-- старый триггер provision_on_subscription только ДОЗАПОЛНЯЛ пустые месяцы:
-- задачи месяцев за пределами нового окна оставались, состав месяцев не менялся —
-- «кружки месяцев» продолжали показывать 6 месяцев со старым набором.
-- ФИКС:
--   • смена plan_months → полная пересборка авто-задач (как rebuild_monthly_tasks);
--   • сдвиг/усечение периода → авто-задачи вне нового окна удаляются, пустые
--     месяцы дозаполняются;
--   • ручные задачи (created_by задан) и старые «дневные» (period_month null)
--     не трогаем никогда.
create or replace function public.provision_on_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tab uuid; v_m date; v_end date; s record;
  v_plan_changed boolean; v_dates_changed boolean;
begin
  if new.role <> 'user' then return new; end if;
  select auto_tasks_enabled into s from public.app_settings where id = 1;
  if not coalesce(s.auto_tasks_enabled, true) then return new; end if;
  if new.subscription_start is null or new.subscription_end is null then return new; end if;

  v_plan_changed  := new.plan_months is distinct from old.plan_months;
  v_dates_changed := new.subscription_start is distinct from old.subscription_start
                  or new.subscription_end   is distinct from old.subscription_end;
  if not v_plan_changed and not v_dates_changed then return new; end if;

  select id into v_tab from public.tabs where key = 'calendar';
  v_m   := date_trunc('month', new.subscription_start)::date;
  v_end := date_trunc('month', new.subscription_end)::date;

  if v_plan_changed then
    -- Состав месяцев зависит от плана → пересобираем авто-задачи целиком.
    delete from public.tasks
      where user_id = new.id and period_month is not null and created_by is null;
    while v_m <= v_end loop
      perform public.provision_month(new.id, v_tab, v_m);
      v_m := (v_m + interval '1 month')::date;
    end loop;
  else
    -- Только период: чистим авто-задачи вне нового окна, дозаполняем пустые месяцы.
    delete from public.tasks
      where user_id = new.id and period_month is not null and created_by is null
        and (period_month < v_m or period_month > v_end);
    while v_m <= v_end loop
      if not exists (
        select 1 from public.tasks
        where user_id = new.id and period_month = v_m and created_by is null
      ) then
        perform public.provision_month(new.id, v_tab, v_m);
      end if;
      v_m := (v_m + interval '1 month')::date;
    end loop;
  end if;
  return new;
end $$;

-- Триггер теперь слушает и plan_months (раньше — только даты подписки).
drop trigger if exists provision_on_subscription on public.profiles;
create trigger provision_on_subscription
  after update of subscription_start, subscription_end, plan_months on public.profiles
  for each row execute function public.provision_on_subscription();
