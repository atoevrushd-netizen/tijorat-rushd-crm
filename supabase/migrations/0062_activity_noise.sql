-- 0062_activity_noise.sql — не заливать историю/уведомления авто-выдачей (аудит v3, L9/L29).
-- Каждая выдача/пересборка писала в activity_log по строке НА ЗАДАЧУ (37–131 строк),
-- и колокольчик резидента/лента карточки тонули в «Создана задача …».
-- Теперь provision_month помечает сессию флагом (set_config), триггер log_task_activity
-- при флаге пропускает по-задачные INSERT-события, а provision_month в конце пишет
-- ОДНО агрегированное событие 'tasks_provisioned' {n, month} на месяц.

create or replace function public.provision_month(p_lead uuid, p_tab uuid, p_month date)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_plan int; v_start date; v_idx int;
  r record; i int; n int := 0; v_ru text; v_tg text;
begin
  select coalesce(plan_months, 3), date_trunc('month', coalesce(subscription_start, p_month))::date
    into v_plan, v_start
    from public.profiles where id = p_lead;
  if v_plan is null then v_plan := 3; end if;
  v_idx := ((extract(year from p_month)::int * 12 + extract(month from p_month)::int)
          - (extract(year from v_start)::int * 12 + extract(month from v_start)::int)) + 1;
  if v_idx < 1 then v_idx := 1; end if;

  -- Флаг «массовая выдача» на время транзакции (is_local = true → сам сбросится).
  perform set_config('app.provisioning', 'on', true);

  for r in select typ, ru, tg, cnt from public.monthly_set(v_plan, v_idx) loop
    for i in 1..r.cnt loop
      if r.cnt > 1 then v_ru := r.ru || ' №' || i; v_tg := r.tg || ' №' || i;
      else v_ru := r.ru; v_tg := r.tg; end if;
      insert into public.tasks
        (user_id, tab_id, title, title_ru, title_tg, task_type, period_month, status)
      values (p_lead, p_tab, v_ru, v_ru, v_tg, r.typ, p_month, 'not_started');
      n := n + 1;
    end loop;
  end loop;

  perform set_config('app.provisioning', 'off', true);

  -- Одно событие на месяц вместо n штук.
  if n > 0 then
    insert into public.activity_log (user_id, actor_id, entity_type, entity_id, action, details)
    values (p_lead, auth.uid(), 'task', null, 'tasks_provisioned',
            jsonb_build_object('n', n, 'month', to_char(p_month, 'YYYY-MM')));
  end if;
  return n;
end $$;
revoke all on function public.provision_month(uuid, uuid, date) from public;
revoke all on function public.provision_month(uuid, uuid, date) from authenticated;

create or replace function public.log_task_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    -- Внутри массовой выдачи по-задачно не логируем (см. provision_month).
    if current_setting('app.provisioning', true) = 'on' then return null; end if;
    insert into public.activity_log (user_id, actor_id, entity_type, entity_id, action, details)
    values (new.user_id, auth.uid(), 'task', new.id, 'created',
            jsonb_build_object('title', new.title, 'title_ru', new.title_ru,
                               'title_tg', new.title_tg, 'task_type', new.task_type));
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status then
    insert into public.activity_log (user_id, actor_id, entity_type, entity_id, action, details)
    values (new.user_id, auth.uid(), 'task', new.id, 'status_changed',
            jsonb_build_object('title', new.title, 'title_ru', new.title_ru,
                               'title_tg', new.title_tg, 'from', old.status, 'to', new.status));
  end if;
  return null;
end $$;

-- Прибираем уже накопленный шум: схлопываем старые по-задачные 'created' от авто-выдачи
-- (без actor — их писали триггеры от имени системы) в агрегаты не будем задним числом,
-- просто удаляем — они не несут ценности (по одной строке на каждую из ~1600 задач).
delete from public.activity_log
  where entity_type = 'task' and action = 'created'
    and entity_id in (select id from public.tasks where period_month is not null and created_by is null);
