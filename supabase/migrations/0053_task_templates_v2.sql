-- 0053_task_templates_v2.sql
-- Наборы задач v2 (по ТЗ владельца): РАЗНЫЕ для 3- и 6-месячных, зависят от номера месяца.
-- Заменяет фиксированный 21-задачный набор из 0048. provision_month сохраняет сигнатуру
-- (uuid, uuid, date) — поэтому все триггеры и regenerate_monthly_tasks продолжают работать,
-- но теперь берут состав из monthly_set(plan, month_index).

-- ── Композиция одного месяца: (тип, ru, tg, количество) для плана и номера месяца ──
create or replace function public.monthly_set(p_plan int, p_idx int)
returns table(typ text, ru text, tg text, cnt int)
language plpgsql immutable as $$
begin
  if p_plan = 6 then
    -- Базовый набор 6-месячных — повторяется КАЖДЫЙ месяц (1..6):
    return query select * from (values
      ('reels'::text,      'Рилс'::text,                       'Рилс'::text,                        5),
      ('creative',         'Креатив',                          'Креатив',                           5),
      ('lesson',           'Обязательный урок',                'Дарси ҳатмӣ',                       1),
      ('bonus',            'Бонусный урок',                    'Дарси иловагӣ',                     3),
      ('mastermind',       'Мастермайнд',                      'Мастермайнд',                       1),
      ('dinner',           'Бизнес-ужин',                      'Хӯроки корӣ',                       4),
      ('analysis',         'Внутренний анализ бизнеса',        'Таҳлили дохилии тиҷорат',           1),
      ('football',         'Футбол',                           'Футбол',                            1)
    ) as t(typ, ru, tg, cnt);
    if p_idx = 1 then
      -- Только 1-й месяц: упаковка + настройка таргета
      return query select * from (values
        ('packaging'::text, 'Упаковка и анализ Inst и FB'::text, 'Бастабандӣ ва таҳлили Inst ва FB'::text, 1),
        ('targeting',       'Настройка таргета ADS',             'Танзими таргети ADS',                    1)
      ) as t(typ, ru, tg, cnt);
    elsif p_idx = 2 then
      -- Только 2-й месяц 6-месячных: CRM + скрипты + обучение скриптам (без «отдела продаж»)
      return query select * from (values
        ('crm'::text,        'Создание CRM'::text,      'Сохтани CRM'::text,      1),
        ('sales_script',     'Создание скриптов',       'Сохтани скриптҳо',       1),
        ('script_training',  'Обучение скриптам',       'Омӯзиши скриптҳо',       1)
      ) as t(typ, ru, tg, cnt);
    end if;
  else
    -- План 3 (и по умолчанию для null): reels/creative/football каждый месяц.
    return query select * from (values
      ('reels'::text, 'Рилс'::text,    'Рилс'::text,    3),
      ('creative',    'Креатив',       'Креатив',       3),
      ('football',    'Футбол',        'Футбол',        1)
    ) as t(typ, ru, tg, cnt);
    -- Обязательные уроки и бизнес-ужины: по 3 в месяцы 1-2, по 2 в месяце 3+ (итого по 8).
    return query select 'lesson'::text, 'Обязательный урок'::text, 'Дарси ҳатмӣ'::text,
                        (case when p_idx >= 3 then 2 else 3 end);
    return query select 'dinner'::text, 'Бизнес-ужин'::text, 'Хӯроки корӣ'::text,
                        (case when p_idx >= 3 then 2 else 3 end);
    if p_idx = 1 then
      -- Только 1-й месяц: упаковка + настройка таргета
      return query select * from (values
        ('packaging'::text, 'Упаковка и анализ Inst и FB'::text, 'Бастабандӣ ва таҳлили Inst ва FB'::text, 1),
        ('targeting',       'Настройка таргета ADS',             'Танзими таргети ADS',                    1)
      ) as t(typ, ru, tg, cnt);
    end if;
  end if;
end $$;

-- ── Провизия месяца: состав из monthly_set по плану лида и номеру месяца от старта ──
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
  -- номер месяца программы (1-based) = разница календарных месяцев от старта подписки
  v_idx := ((extract(year from p_month)::int * 12 + extract(month from p_month)::int)
          - (extract(year from v_start)::int * 12 + extract(month from v_start)::int)) + 1;
  if v_idx < 1 then v_idx := 1; end if;

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
  return n;
end $$;

-- Прямой вызов provision_month у клиентов по-прежнему запрещён (см. 0049).
revoke all on function public.provision_month(uuid, uuid, date) from public;
revoke all on function public.provision_month(uuid, uuid, date) from authenticated;
