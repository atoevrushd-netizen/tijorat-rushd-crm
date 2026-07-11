-- 0043_chat_broadcasts.sql
-- Массовые рассылки: рассылка + получатели; каждое сообщение кладётся в личный
-- диалог адресата (так резидент его получает), плюс отметка broadcast_id.
-- Управление и статистика — только у админов (RLS admin-only).

create table if not exists public.chat_broadcasts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references public.profiles (id) on delete set null,
  body            text not null,
  audience        text not null,             -- 'all' | 'active' | 'inactive' | 'selected'
  recipient_count int  not null default 0,
  status          text not null default 'sending',  -- 'sending' | 'done' | 'partial'
  created_at      timestamptz not null default now()
);

create table if not exists public.chat_broadcast_recipients (
  id           uuid primary key default gen_random_uuid(),
  broadcast_id uuid not null references public.chat_broadcasts (id) on delete cascade,
  lead_id      uuid not null references public.profiles (id) on delete cascade,
  message_id   uuid references public.chat_messages (id) on delete set null,
  status       text not null,               -- 'delivered' | 'error'
  created_at   timestamptz not null default now()
);
create index if not exists chat_bcr_bid_idx on public.chat_broadcast_recipients (broadcast_id);

alter table public.chat_messages add column if not exists broadcast_id uuid
  references public.chat_broadcasts (id) on delete set null;

grant select, insert, update, delete on public.chat_broadcasts to authenticated, service_role;
grant select, insert, update, delete on public.chat_broadcast_recipients to authenticated, service_role;

alter table public.chat_broadcasts enable row level security;
alter table public.chat_broadcast_recipients enable row level security;
create policy "bc_admin_all" on public.chat_broadcasts
  for all using (public.is_admin()) with check (public.is_admin());
create policy "bcr_admin_all" on public.chat_broadcast_recipients
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Кол-во получателей аудитории (для предпросмотра) ────────────────────────
create or replace function public.broadcast_audience_count(p_audience text, p_lead_ids uuid[])
returns int language sql stable security invoker set search_path = public as $$
  select count(*)::int from public.profiles p
  where p.role = 'user' and p.deleted_at is null
    and (
      p_audience = 'all'
      or (p_audience = 'active' and p.status = 'active')
      or (p_audience = 'inactive' and p.status <> 'active')
      or (p_audience = 'selected' and p.id = any(coalesce(p_lead_ids, '{}'::uuid[])))
    );
$$;
grant execute on function public.broadcast_audience_count(text, uuid[]) to authenticated;

-- ── Отправить рассылку (веером по личным диалогам). Только админ. ────────────
create or replace function public.send_broadcast(p_audience text, p_lead_ids uuid[], p_body text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_bid uuid; v_lead uuid; v_conv uuid; v_msg uuid; v_ok int := 0; v_err int := 0;
begin
  if not public.is_admin() then raise exception 'Только администратор'; end if;
  if p_body is null or length(trim(p_body)) = 0 then raise exception 'Пустое сообщение'; end if;

  insert into public.chat_broadcasts (author_id, body, audience, status)
    values (auth.uid(), p_body, p_audience, 'sending') returning id into v_bid;

  for v_lead in
    select p.id from public.profiles p
    where p.role = 'user' and p.deleted_at is null
      and (
        p_audience = 'all'
        or (p_audience = 'active' and p.status = 'active')
        or (p_audience = 'inactive' and p.status <> 'active')
        or (p_audience = 'selected' and p.id = any(coalesce(p_lead_ids, '{}'::uuid[])))
      )
  loop
    begin
      insert into public.chat_conversations (lead_id) values (v_lead)
        on conflict (lead_id) do nothing;
      select id into v_conv from public.chat_conversations where lead_id = v_lead;
      insert into public.chat_messages (conversation_id, sender_id, body, kind, broadcast_id)
        values (v_conv, auth.uid(), p_body, 'text', v_bid) returning id into v_msg;
      insert into public.chat_broadcast_recipients (broadcast_id, lead_id, message_id, status)
        values (v_bid, v_lead, v_msg, 'delivered');
      v_ok := v_ok + 1;
    exception when others then
      insert into public.chat_broadcast_recipients (broadcast_id, lead_id, message_id, status)
        values (v_bid, v_lead, null, 'error');
      v_err := v_err + 1;
    end;
  end loop;

  update public.chat_broadcasts
    set recipient_count = v_ok + v_err,
        status = case when v_err > 0 then 'partial' else 'done' end
    where id = v_bid;
  return jsonb_build_object('id', v_bid, 'delivered', v_ok, 'errors', v_err);
end; $$;
grant execute on function public.send_broadcast(text, uuid[], text) to authenticated;

-- ── Повторная отправка тем, кому не доставлено (status='error'). ─────────────
create or replace function public.resend_broadcast(p_broadcast uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_rec record; v_conv uuid; v_msg uuid; v_body text; v_ok int := 0; v_err int := 0;
begin
  if not public.is_admin() then raise exception 'Только администратор'; end if;
  select body into v_body from public.chat_broadcasts where id = p_broadcast;
  if v_body is null then raise exception 'Рассылка не найдена'; end if;

  for v_rec in
    select r.id, r.lead_id from public.chat_broadcast_recipients r
    join public.profiles p on p.id = r.lead_id
    where r.broadcast_id = p_broadcast and r.status = 'error'
      and p.deleted_at is null and p.role = 'user'
  loop
    begin
      insert into public.chat_conversations (lead_id) values (v_rec.lead_id)
        on conflict (lead_id) do nothing;
      select id into v_conv from public.chat_conversations where lead_id = v_rec.lead_id;
      insert into public.chat_messages (conversation_id, sender_id, body, kind, broadcast_id)
        values (v_conv, auth.uid(), v_body, 'text', p_broadcast) returning id into v_msg;
      update public.chat_broadcast_recipients
        set message_id = v_msg, status = 'delivered' where id = v_rec.id;
      v_ok := v_ok + 1;
    exception when others then
      v_err := v_err + 1;
    end;
  end loop;

  update public.chat_broadcasts
    set status = case when v_err > 0 then 'partial' else 'done' end
    where id = p_broadcast;
  return jsonb_build_object('resent', v_ok, 'errors', v_err);
end; $$;
grant execute on function public.resend_broadcast(uuid) to authenticated;

-- ── Представление истории рассылок со статистикой (admin через RLS). ─────────
create or replace view public.chat_broadcast_view with (security_invoker = true) as
select
  b.id, b.author_id, b.body, b.audience, b.recipient_count, b.status, b.created_at,
  au.full_name as author_name,
  (select count(*) from public.chat_broadcast_recipients r
     where r.broadcast_id = b.id and r.status = 'delivered') as delivered,
  (select count(*) from public.chat_broadcast_recipients r
     where r.broadcast_id = b.id and r.status = 'error') as errors,
  (select count(*) from public.chat_broadcast_recipients r
     join public.chat_messages m on m.id = r.message_id
     join public.chat_conversations c on c.id = m.conversation_id
     where r.broadcast_id = b.id and c.lead_last_read_at is not null
       and c.lead_last_read_at >= m.created_at) as read_count
from public.chat_broadcasts b
left join public.profiles au on au.id = b.author_id;

grant select on public.chat_broadcast_view to authenticated;
