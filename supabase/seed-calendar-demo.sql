-- Демо-данные календаря для локальной разработки (идемпотентно).
-- Заполняет тест-аккаунт student1@tijorat.local: период подписки + задачи на текущий месяц.
-- Запуск: docker exec -i <db_container> psql -U postgres -d postgres < supabase/seed-calendar-demo.sql
do $$
declare
  v_uid uuid;
  v_tab uuid;
begin
  select id into v_uid from public.profiles where email = 'student1@tijorat.local' limit 1;
  select id into v_tab from public.tabs where key = 'calendar' limit 1;
  if v_uid is null or v_tab is null then
    raise notice 'student1 или вкладка calendar не найдены — пропуск';
    return;
  end if;

  -- Период подписки: с начала текущего месяца на ~3 месяца вперёд.
  update public.profiles
    set subscription_start = date_trunc('month', current_date)::date,
        subscription_end   = (date_trunc('month', current_date) + interval '3 months' - interval '1 day')::date
    where id = v_uid;

  -- Демо-задачи только если у пользователя ещё нет задач на вкладке «Календарь».
  if not exists (select 1 from public.tasks where user_id = v_uid and tab_id = v_tab) then
    insert into public.tasks (user_id, tab_id, title, task_type, deadline, due_time, status) values
      (v_uid, v_tab, 'Снять Reels',       'reels',    current_date,      '09:00', 'sent_to_user'),
      (v_uid, v_tab, 'Креатив для поста', 'creative', current_date + 2,  '14:00', 'in_progress'),
      (v_uid, v_tab, 'Снять Reels №2',    'reels',    current_date + 4,  '11:00', 'not_started'),
      (v_uid, v_tab, 'Монтаж видео',      'other',    current_date + 4,  '16:30', 'not_started'),
      (v_uid, v_tab, 'Снять Reels №3',    'reels',    current_date + 7,  '10:00', 'not_started');
    raise notice 'демо-задачи добавлены';
  else
    raise notice 'у student1 уже есть задачи календаря — пропуск';
  end if;
end $$;
