-- 0049_monthly_hardening.sql — по итогам адверсариального ревью 0048.
--  #4 (безопасность): provision_month — SECURITY DEFINER без охраны, любой резидент
--     мог вызвать его как RPC и вставить задачи в чужой месяц. Отзываем прямой вызов
--     у клиентов; внутренние вызовы (regenerate_monthly_tasks, триггеры) идут от владельца
--     функции и сохраняют доступ.
--  #6 (пробел): при СОЗДАНИИ лида подписки ещё нет → задачи не создаются, а INSERT-триггер
--     больше не срабатывает. Добавляем AFTER UPDATE-триггер: как только админ задаёт/меняет
--     период подписки — автоматически до-создаём помесячные наборы (идемпотентно).

revoke all on function public.provision_month(uuid, uuid, date) from public;
revoke all on function public.provision_month(uuid, uuid, date) from authenticated;

create or replace function public.provision_on_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tab uuid; v_m date; v_end date;
begin
  if new.role <> 'user' then return new; end if;
  if new.subscription_start is null or new.subscription_end is null then return new; end if;
  -- только когда период реально изменился (впервые задан или сдвинут)
  if new.subscription_start is not distinct from old.subscription_start
     and new.subscription_end is not distinct from old.subscription_end then
    return new;
  end if;
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

drop trigger if exists provision_on_subscription on public.profiles;
create trigger provision_on_subscription
  after update of subscription_start, subscription_end on public.profiles
  for each row execute function public.provision_on_subscription();
