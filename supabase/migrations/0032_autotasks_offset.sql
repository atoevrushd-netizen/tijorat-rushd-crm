-- 0032_autotasks_offset.sql
-- Батч 3: автозадачи по СМЕЩЕНИЮ от старта лида + двуязычные заголовки в истории.
-- Проблема: шаблоны хранили АБСОЛЮТНУЮ дату дедлайна → новые лиды получали
-- устаревшие сроки. Решение: offset_days (через сколько дней ОТ СТАРТА появляется задача),
-- а триггер считает deadline = старт_лида + offset_days.

-- 1) Колонка смещения + backfill из существующих абсолютных дат (относительно
--    самого раннего дедлайна в группе — сохраняем относительный график).
alter table public.task_templates add column if not exists offset_days int;

update public.task_templates tt
  set offset_days = (tt.deadline - g.min_dl)
  from (
    select group_id, min(deadline) as min_dl
    from public.task_templates
    where deadline is not null
    group by group_id
  ) g
  where tt.group_id = g.group_id
    and tt.deadline is not null
    and tt.offset_days is null;

-- 2) Триггер автовыдачи: deadline = старт лида (или дата создания) + offset_days.
--    Плюс переносим двуязычные заголовки шаблона (title_ru/title_tg из 0029).
create or replace function public.provision_lead_tasks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare s record;
begin
  if new.role <> 'user' then
    return new;
  end if;
  select auto_tasks_enabled, active_group_id into s from public.app_settings where id = 1;
  if coalesce(s.auto_tasks_enabled, false) and s.active_group_id is not null then
    insert into public.tasks
      (user_id, tab_id, title, title_ru, title_tg, task_type, deadline, status)
    select
      new.id, tb.id, tt.title,
      coalesce(tt.title_ru, tt.title), coalesce(tt.title_tg, tt.title),
      tt.task_type,
      case
        when tt.offset_days is not null
          then coalesce(new.subscription_start::date, current_date) + tt.offset_days
        else tt.deadline
      end,
      'not_started'
    from public.task_templates tt
    join public.tabs tb on tb.key = tt.tab_key
    where tt.group_id = s.active_group_id;
  end if;
  return new;
end $$;

-- 3) Лог истории: сохраняем оба заголовка (title_ru/title_tg), чтобы лента и
--    уведомления показывали задачу на языке интерфейса (старые записи — как были).
create or replace function public.log_task_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
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
  return null; -- AFTER-триггер
end $$;
