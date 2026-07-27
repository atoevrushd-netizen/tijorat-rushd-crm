-- 0048_monthly_program.sql
-- Переход на ПОМЕСЯЧНУЮ модель задач (вместо распределения по дням) + деактивация резидента.
--   • tasks.period_month — месяц задачи (1-е число месяца); дни больше не используем.
--   • Новый набор ~20 задач на КАЖДЫЙ месяц периода подписки резидента.
--   • Авто-выдача переделана: цикл по месяцам подписки (без offset_days/шаблонов).
--   • Чекбоксы только у админа: у резидента отзываем право менять статус своей задачи.
--   • Деактивация: profiles.deactivated_at + RPC (админ/разработчик).
--   • Старые задачи НЕ трогаем (только бэкфилл period_month из deadline — чтобы попали в помесячный вид).

-- ── 1) Месяц задачи ─────────────────────────────────────────────────────────
-- period_month заполняется ТОЛЬКО у новых помесячных задач. Старые дневные задачи
-- остаются с period_month = null: их сохраняем в БД, но в новом помесячном виде не
-- показываем (он фильтрует по period_month). Так «старое оставим», а вид чистый.
alter table public.tasks add column if not exists period_month date;
create index if not exists tasks_period_month_idx on public.tasks (user_id, period_month);

-- ── 2) Деактивация резидента ────────────────────────────────────────────────
alter table public.profiles add column if not exists deactivated_at timestamptz;

-- Включить/выключить резидента (только админ/разработчик — is_admin() включает developer).
create or replace function public.set_resident_active(p_lead uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Только администратор/разработчик'; end if;
  update public.profiles
    set deactivated_at = case when p_active then null else now() end
    where id = p_lead and role = 'user';
  if not found then raise exception 'Резидент не найден'; end if;
end $$;
revoke all on function public.set_resident_active(uuid, boolean) from public;
grant execute on function public.set_resident_active(uuid, boolean) to authenticated;

-- ── 3) Набор задач одного месяца (фиксированные категории и количества) ─────
create or replace function public.provision_month(p_lead uuid, p_tab uuid, p_month date)
returns int language plpgsql security definer set search_path = public as $$
declare r record; i int; n int := 0; v_ru text; v_tg text;
begin
  for r in select * from (values
    ('Рилс',                      'Рилс',                    'reels',      5),
    ('Креатив',                   'Креатив',                 'creative',   5),
    ('Бонусный урок',             'Дарси иловагӣ',           'bonus',      3),
    ('Основной урок',             'Дарси асосӣ',             'lesson',     1),
    ('Мастермайнд',               'Мастермайнд',             'mastermind', 1),
    ('Бизнес-ужин',               'Хӯроки корӣ',             'dinner',     4),
    ('Внутренний анализ бизнеса', 'Таҳлили дохилии тиҷорат', 'analysis',   1),
    ('Футбол',                    'Футбол',                  'football',   1)
  ) as t(ru, tg, typ, cnt)
  loop
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

-- ── 4) (Пере)генерация помесячных наборов по подписке (идемпотентно) ────────
-- Пропускаем месяцы, где у лида УЖЕ есть задачи (не задваиваем и не трогаем старые дневные).
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
    if not exists (select 1 from public.tasks where user_id = p_lead and period_month = v_m) then
      v_total := v_total + public.provision_month(p_lead, v_tab, v_m);
    end if;
    v_m := (v_m + interval '1 month')::date;
  end loop;
  return v_total;
end $$;
revoke all on function public.regenerate_monthly_tasks(uuid) from public;
grant execute on function public.regenerate_monthly_tasks(uuid) to authenticated;

-- ── 5) Авто-выдача при создании лида: помесячно по подписке (если она задана) ─
create or replace function public.provision_lead_tasks()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tab uuid; v_m date; v_end date; s record;
begin
  if new.role <> 'user' then return new; end if;
  select auto_tasks_enabled into s from public.app_settings where id = 1;
  if not coalesce(s.auto_tasks_enabled, true) then return new; end if;
  -- Без периода подписки не генерируем: админ задаст период и нажмёт «Создать задачи».
  if new.subscription_start is null or new.subscription_end is null then return new; end if;
  select id into v_tab from public.tabs where key = 'calendar';
  v_m   := date_trunc('month', new.subscription_start)::date;
  v_end := date_trunc('month', new.subscription_end)::date;
  while v_m <= v_end loop
    perform public.provision_month(new.id, v_tab, v_m);
    v_m := (v_m + interval '1 month')::date;
  end loop;
  return new;
end $$;

-- ── 6) Чекбоксы только у админа: резидент больше не может менять статус задачи ─
-- (RLS на tasks и так разрешает UPDATE только админу; эти RPC давали резиденту
--  обходной путь «сдал»/«принять» — отзываем их у обычных пользователей.)
revoke execute on function public.set_task_submitted(uuid, boolean) from authenticated;
revoke execute on function public.respond_to_task(uuid, boolean, text) from authenticated;
