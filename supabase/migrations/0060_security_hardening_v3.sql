-- 0060_security_hardening_v3.sql — по полному аудиту v3 (безопасность + целостность).
--   H1  Любой админ мог прочитать открытый пароль РАЗРАБОТЧИКА/другого админа из
--       user_credentials и войти под ним → эскалация. Открытые пароли — только для
--       резидентов (role='user'); строки привилегированных аккаунтов удаляем и больше
--       не даём создавать. Обычный админ читает только пароли резидентов.
--   H2  Охрана профилей была только на UPDATE: админ мог DELETE+INSERT профиль с
--       role='developer' (или удалить разработчика). Ограничиваем INSERT/DELETE:
--       обычный админ — только строки role='user'; привилегированные — только разработчик.
--   M2  Очистка ОДНОЙ даты подписки удаляла все авто-задачи (0059 использовал OR).
--       Теперь снос — только когда сняты ОБЕ; одна снятая — no-op (задачи ждут окно).
--   M6  Пересылка сообщения (forwarded_from_msg) помечала диалог прочитанным у админа.
--   L1  is_active() не покрывал storage.objects и chat_conversations.
--   L2  Лид мог напрямую INSERT в chat_conversations (сеять админские колонки).
--   L3  Смена конца подписки при выключенной авто-выдаче не обрезала хвост.

-- ── H1: открытые пароли только у резидентов ────────────────────────────────
delete from public.user_credentials c
  using public.profiles p
  where p.id = c.user_id and p.role <> 'user';

drop policy if exists "creds_select_admin" on public.user_credentials;
drop policy if exists "creds_insert_admin" on public.user_credentials;
drop policy if exists "creds_update_admin" on public.user_credentials;
drop policy if exists "creds_delete_admin" on public.user_credentials;
-- Строка допустима, только если её владелец — резидент.
create policy "creds_select_admin" on public.user_credentials for select
  using (public.is_admin() and exists (select 1 from public.profiles p where p.id = user_id and p.role = 'user'));
create policy "creds_insert_admin" on public.user_credentials for insert
  with check (public.is_admin() and exists (select 1 from public.profiles p where p.id = user_id and p.role = 'user'));
create policy "creds_update_admin" on public.user_credentials for update
  using (public.is_admin() and exists (select 1 from public.profiles p where p.id = user_id and p.role = 'user'));
create policy "creds_delete_admin" on public.user_credentials for delete
  using (public.is_admin());
-- Страховка на уровне строки (service_role в edge-функциях обходит RLS): триггер
-- запрещает открытый пароль для не-резидента при любом пути записи.
create or replace function public.guard_credentials_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from public.profiles p where p.id = new.user_id and p.role <> 'user') then
    raise exception 'Открытый пароль хранится только для резидентов';
  end if;
  return new;
end $$;
drop trigger if exists user_credentials_guard_role on public.user_credentials;
create trigger user_credentials_guard_role
  before insert or update on public.user_credentials
  for each row execute function public.guard_credentials_role();

-- ── H2: INSERT/DELETE профилей — обычный админ только резидентов ─────────────
drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin" on public.profiles for insert
  with check (public.is_developer() or (public.is_admin() and role = 'user'));
drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles for delete
  using (public.is_developer() or (public.is_admin() and role = 'user'));

-- ── L2: диалоги создаёт только админ (лид — через ensure_conversation RPC) ────
drop policy if exists "chat_conv_insert" on public.chat_conversations;
create policy "chat_conv_insert" on public.chat_conversations for insert
  with check (public.is_admin());

-- ── L1: is_active() на storage.objects и chat_conversations ─────────────────
drop policy if exists storage_active_ins on storage.objects;
create policy storage_active_ins on storage.objects as restrictive for insert to authenticated with check (public.is_active());
drop policy if exists storage_active_upd on storage.objects;
create policy storage_active_upd on storage.objects as restrictive for update to authenticated using (public.is_active());
drop policy if exists storage_active_del on storage.objects;
create policy storage_active_del on storage.objects as restrictive for delete to authenticated using (public.is_active());
drop policy if exists chat_conv_active_ins on public.chat_conversations;
create policy chat_conv_active_ins on public.chat_conversations as restrictive for insert to authenticated with check (public.is_active());
drop policy if exists chat_conv_active_upd on public.chat_conversations;
create policy chat_conv_active_upd on public.chat_conversations as restrictive for update to authenticated using (public.is_active());

-- ── M6: пересланное сообщение не «читает» диалог за админа ──────────────────
create or replace function public.chat_after_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_lead uuid;
begin
  select lead_id into v_lead from public.chat_conversations where id = new.conversation_id;
  update public.chat_conversations
    set last_message = case
          when new.kind = 'file'  then '📎 ' || coalesce(nullif(new.body, ''), new.attachment_name, 'файл')
          when new.kind = 'voice' then '🎙 ' || coalesce(nullif(new.body, ''), 'голосовое сообщение')
          else coalesce(new.body, '') end,
        last_message_at  = new.created_at,
        last_sender_id   = new.sender_id,
        updated_at       = now(),
        -- прочитанным диалог помечает только сообщение, которое админ НАПИСАЛ в нём сам
        -- (не рассылка и не пересылка)
        admin_last_read_at = case when new.sender_id is distinct from v_lead
                                   and new.broadcast_id is null
                                   and new.forwarded_from_msg is null
                                  then new.created_at else admin_last_read_at end,
        lead_last_read_at  = case when new.sender_id = v_lead
                                  then new.created_at else lead_last_read_at end
    where id = new.conversation_id;
  return null;
end; $$;

-- ── M2 + L3: триггер подписки — снос только при ОБЕИХ снятых датах; обрезка
--            хвоста не зависит от auto_tasks_enabled ─────────────────────────
create or replace function public.provision_on_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tab uuid; v_m date; v_end date; s record;
  v_enabled boolean; v_rebuild boolean; v_dates_changed boolean;
begin
  if new.role <> 'user' then return new; end if;

  -- Сняты ОБЕ даты (были заданы) → авто-задачи убираем; ручные и «дневные» остаются.
  if new.subscription_start is null and new.subscription_end is null
     and (old.subscription_start is not null or old.subscription_end is not null) then
    delete from public.tasks
      where user_id = new.id and period_month is not null and created_by is null;
    return new;
  end if;
  -- Одна из дат пуста → окна нет, ничего не трогаем (задачи ждут полное окно).
  if new.subscription_start is null or new.subscription_end is null then return new; end if;

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
    -- Обрезка хвоста — всегда (это не «выдача»); дозаполнение — только при включённой авто-выдаче.
    delete from public.tasks
      where user_id = new.id and period_month is not null and created_by is null
        and (period_month < v_m or period_month > v_end);
    if not v_enabled then return new; end if;
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
