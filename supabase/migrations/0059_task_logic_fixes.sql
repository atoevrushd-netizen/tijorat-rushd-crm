-- 0059_task_logic_fixes.sql — фиксы логики задач по свежему аудиту.
--   #1 regenerate_monthly_tasks («Создать задачи по подписке») пропускал месяц,
--      если в нём лежала хоть одна РУЧНАЯ задача (предикат без created_by is null),
--      и месяц оставался без авто-набора. Выравниваем с триггером 0057.
--   #2 Сдвиг СТАРТА подписки переиндексирует месяцы программы («Месяц 1» уезжает),
--      но уже созданные месяцы сохраняли состав под старым индексом. Теперь смена
--      месяца старта → полная пересборка (как смена плана); сдвиг только конца —
--      по-прежнему мягко (обрезать/дозаполнить).
--   #3 Очистка дат подписки (обе → null) снимала защиту, но задачи оставались, а обе
--      кнопки становились недоступны. Теперь авто-задачи убираются вместе с датами
--      (ручные — остаются).
--   #4 dashboard_counts считал задачи резидентов из «Корзины» — фильтруем по владельцу.

-- ── #1 ──────────────────────────────────────────────────────────────────────
create or replace function public.regenerate_monthly_tasks(p_lead uuid)
returns int language plpgsql security definer set search_path = public as $$
declare v_tab uuid; v_start date; v_end date; v_m date; v_total int := 0;
begin
  if not public.is_admin() then raise exception 'Только администратор/разработчик'; end if;
  select subscription_start, subscription_end into v_start, v_end
    from public.profiles where id = p_lead and role = 'user';
  if v_start is null or v_end is null then
    raise exception 'У резидента не задан период подписки';
  end if;
  select id into v_tab from public.tabs where key = 'calendar';
  v_m := date_trunc('month', v_start)::date;
  while v_m <= date_trunc('month', v_end)::date loop
    -- Дозаполняем только месяцы БЕЗ авто-задач (ручные задачи месяц не «занимают»).
    if not exists (
      select 1 from public.tasks
      where user_id = p_lead and period_month = v_m and created_by is null
    ) then
      v_total := v_total + public.provision_month(p_lead, v_tab, v_m);
    end if;
    v_m := (v_m + interval '1 month')::date;
  end loop;
  return v_total;
end $$;
revoke all on function public.regenerate_monthly_tasks(uuid) from public;
grant execute on function public.regenerate_monthly_tasks(uuid) to authenticated;

-- ── #2 + #3 ─────────────────────────────────────────────────────────────────
create or replace function public.provision_on_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tab uuid; v_m date; v_end date; s record;
  v_enabled boolean; v_rebuild boolean; v_dates_changed boolean;
begin
  if new.role <> 'user' then return new; end if;

  -- #3: даты сняты (были заданы) → убираем авто-задачи; ручные и «дневные» остаются.
  if (new.subscription_start is null or new.subscription_end is null)
     and (old.subscription_start is not null and old.subscription_end is not null) then
    delete from public.tasks
      where user_id = new.id and period_month is not null and created_by is null;
    return new;
  end if;
  if new.subscription_start is null or new.subscription_end is null then return new; end if;

  -- Полная пересборка: смена эффективного плана (null == 3) ИЛИ смена месяца старта
  -- (переиндексация «Месяц N» — состав месяцев зависит от индекса).
  v_rebuild := coalesce(new.plan_months, 3) is distinct from coalesce(old.plan_months, 3)
            or date_trunc('month', new.subscription_start)
               is distinct from date_trunc('month', old.subscription_start);
  v_dates_changed := new.subscription_start is distinct from old.subscription_start
                  or new.subscription_end   is distinct from old.subscription_end;
  if not v_rebuild and not v_dates_changed then return new; end if;

  v_m   := date_trunc('month', new.subscription_start)::date;
  v_end := date_trunc('month', new.subscription_end)::date;
  if v_end < v_m then
    raise exception 'Дата окончания подписки раньше даты начала — проверьте даты';
  end if;

  select auto_tasks_enabled into s from public.app_settings where id = 1;
  v_enabled := coalesce(s.auto_tasks_enabled, true);
  select id into v_tab from public.tabs where key = 'calendar';

  if v_rebuild then
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
    -- Сдвинули только конец: обрезать хвост / дозаполнить пустые месяцы.
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

-- ── #4 ──────────────────────────────────────────────────────────────────────
create or replace function public.dashboard_counts()
returns jsonb language sql stable security invoker set search_path = public as $$
  with t as (
    select t.status from public.tasks t
    join public.profiles p on p.id = t.user_id
    where t.period_month is not null and p.role = 'user' and p.deleted_at is null
  )
  select jsonb_build_object(
    'users_total',      (select count(*) from public.profiles where role = 'user' and deleted_at is null),
    'users_active',     (select count(*) from public.profiles where role = 'user' and deleted_at is null and status = 'active'),
    'users_paid',       (select count(*) from public.profiles where role = 'user' and deleted_at is null and paid_at is not null),
    'not_started',      (select count(*) from t where status = 'not_started'),
    'in_progress',      (select count(*) from t where status = 'in_progress'),
    'submitted',        (select count(*) from t where status = 'submitted'),
    'done',             (select count(*) from t where status = 'done'),
    'sent_to_user',     (select count(*) from t where status = 'sent_to_user'),
    'accepted_by_user', (select count(*) from t where status = 'accepted_by_user'),
    'needs_revision',   (select count(*) from t where status = 'needs_revision')
  );
$$;
grant execute on function public.dashboard_counts() to authenticated;
