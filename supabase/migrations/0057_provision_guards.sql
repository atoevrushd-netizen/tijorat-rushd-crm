-- 0057_provision_guards.sql — охрана пересборки задач (по адверс-ревью 0056).
--   #1 Перепутанные даты (конец < начала) раньше ТИХО удаляли все авто-задачи:
--      предикат «вне окна» становился истинным для всех месяцев, а цикл выдачи
--      не выполнялся ни разу. Теперь такое сохранение падает с понятной ошибкой
--      (транзакция откатывается — ничего не удаляется и не сохраняется)
--      + CHECK-ограничение на profiles.
--   #2 «Без метки» ↔ «3 месяца» — это ОДИН и тот же эффективный план
--      (provision_month берёт coalesce(plan_months,3)): пересборка была бы
--      пустой тратой прогресса. Сравниваем эффективные планы.
--   #3 Смена плана при выключенной авто-выдаче: если у лида уже есть авто-задачи,
--      пересобираем всё равно (это сверка состава, а не новая выдача) — иначе
--      бейдж плана и календарь расходились бы без какого-либо сигнала.

-- ── CHECK: конец подписки не раньше начала ──────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_subscription_order' and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_subscription_order
      check (subscription_start is null or subscription_end is null
             or subscription_end >= subscription_start);
  end if;
end $$;

-- ── Триггер с охраной ───────────────────────────────────────────────────────
create or replace function public.provision_on_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tab uuid; v_m date; v_end date; s record;
  v_enabled boolean; v_plan_changed boolean; v_dates_changed boolean;
begin
  if new.role <> 'user' then return new; end if;
  if new.subscription_start is null or new.subscription_end is null then return new; end if;

  -- Эффективный план: null == 3 (см. provision_month/monthly_set, 0053).
  v_plan_changed  := coalesce(new.plan_months, 3) is distinct from coalesce(old.plan_months, 3);
  v_dates_changed := new.subscription_start is distinct from old.subscription_start
                  or new.subscription_end   is distinct from old.subscription_end;
  if not v_plan_changed and not v_dates_changed then return new; end if;

  v_m   := date_trunc('month', new.subscription_start)::date;
  v_end := date_trunc('month', new.subscription_end)::date;
  -- Перепутанные даты: падаем громко, НИЧЕГО не удаляя (транзакция откатится).
  if v_end < v_m then
    raise exception 'Дата окончания подписки раньше даты начала — проверьте даты';
  end if;

  select auto_tasks_enabled into s from public.app_settings where id = 1;
  v_enabled := coalesce(s.auto_tasks_enabled, true);

  select id into v_tab from public.tabs where key = 'calendar';

  if v_plan_changed then
    -- При выключенной авто-выдаче пересобираем только если авто-задачи уже есть
    -- (сверка состава под новый план); новых лидов без задач не трогаем.
    if not v_enabled and not exists (
      select 1 from public.tasks
      where user_id = new.id and period_month is not null and created_by is null
    ) then
      return new;
    end if;
    delete from public.tasks
      where user_id = new.id and period_month is not null and created_by is null;
    while v_m <= v_end loop
      perform public.provision_month(new.id, v_tab, v_m);
      v_m := (v_m + interval '1 month')::date;
    end loop;
  else
    if not v_enabled then return new; end if;
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
