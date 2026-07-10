-- 0037_chat.sql
-- Модуль чата (Фаза 1): личные диалоги «администратор ↔ резидент (лид)».
-- Один диалог на лида; сообщения — от лида или любого админа. RLS: админ видит
-- все диалоги, лид — только свой. Realtime по chat_messages/chat_conversations.
-- Медиа/голосовые/рассылки/заметки — отдельными миграциями следующих фаз.

-- ── Диалог (по одному на лида) ──────────────────────────────────────────────
create table if not exists public.chat_conversations (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid not null unique references public.profiles (id) on delete cascade,
  last_message       text,
  last_message_at    timestamptz,
  last_sender_id     uuid references public.profiles (id) on delete set null,
  lead_last_read_at  timestamptz,
  admin_last_read_at timestamptz,
  -- задел на будущие фазы (закрепление, архив, ответственный, без-звука)
  pinned             boolean not null default false,
  archived           boolean not null default false,
  muted              boolean not null default false,
  assigned_admin_id  uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Сообщение ───────────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender_id       uuid references public.profiles (id) on delete set null,
  body            text,
  kind            text not null default 'text',  -- 'text' (Фаза 1); далее 'file','voice','note','system'
  reply_to_id     uuid references public.chat_messages (id) on delete set null,
  edited_at       timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists chat_messages_conv_idx on public.chat_messages (conversation_id, created_at);
create index if not exists chat_conversations_last_idx on public.chat_conversations (last_message_at desc nulls last);

grant select, insert, update, delete on public.chat_conversations to authenticated, service_role;
grant select, insert, update, delete on public.chat_messages to authenticated, service_role;

-- ── После вставки сообщения: обновить сводку диалога и «прочитано» отправителя ─
create or replace function public.chat_after_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_lead uuid;
begin
  select lead_id into v_lead from public.chat_conversations where id = new.conversation_id;
  update public.chat_conversations
    set last_message    = coalesce(new.body, ''),
        last_message_at  = new.created_at,
        last_sender_id   = new.sender_id,
        updated_at       = now(),
        -- отправитель уже «прочитал» вплоть до своего сообщения
        admin_last_read_at = case when new.sender_id is distinct from v_lead
                                  then new.created_at else admin_last_read_at end,
        lead_last_read_at  = case when new.sender_id = v_lead
                                  then new.created_at else lead_last_read_at end
    where id = new.conversation_id;
  return null;
end; $$;
drop trigger if exists chat_messages_after_ins on public.chat_messages;
create trigger chat_messages_after_ins after insert on public.chat_messages
  for each row execute function public.chat_after_message();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Диалоги: админ — все, лид — только свой. Управление (update/delete) — админ.
create policy "chat_conv_select" on public.chat_conversations
  for select using (public.is_admin() or lead_id = auth.uid());
create policy "chat_conv_insert" on public.chat_conversations
  for insert with check (public.is_admin() or lead_id = auth.uid());
create policy "chat_conv_update_admin" on public.chat_conversations
  for update using (public.is_admin());
create policy "chat_conv_delete_admin" on public.chat_conversations
  for delete using (public.is_admin());

-- Сообщения: админ — все; лид — своего диалога и не «заметки». Отправлять — от себя.
create policy "chat_msg_select" on public.chat_messages
  for select using (
    public.is_admin() or (
      kind <> 'note' and exists (
        select 1 from public.chat_conversations c
        where c.id = chat_messages.conversation_id and c.lead_id = auth.uid()
      )
    )
  );
create policy "chat_msg_insert" on public.chat_messages
  for insert with check (
    sender_id = auth.uid() and (
      public.is_admin() or (
        kind = 'text' and exists (
          select 1 from public.chat_conversations c
          where c.id = chat_messages.conversation_id and c.lead_id = auth.uid()
        )
      )
    )
  );
create policy "chat_msg_update" on public.chat_messages
  for update using (sender_id = auth.uid() or public.is_admin());
create policy "chat_msg_delete_admin" on public.chat_messages
  for delete using (public.is_admin());

-- ── RPC: получить/создать диалог лида ──────────────────────────────────────
create or replace function public.ensure_conversation(p_lead uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not (public.is_admin() or p_lead = auth.uid()) then
    raise exception 'Нет доступа к диалогу';
  end if;
  if not exists (select 1 from public.profiles where id = p_lead and role = 'user') then
    raise exception 'Диалог возможен только с резидентом';
  end if;
  insert into public.chat_conversations (lead_id)
    values (p_lead) on conflict (lead_id) do nothing;
  select id into v_id from public.chat_conversations where lead_id = p_lead;
  return v_id;
end; $$;
grant execute on function public.ensure_conversation(uuid) to authenticated;

-- ── RPC: отметить диалог прочитанным (для своей стороны) ────────────────────
create or replace function public.chat_mark_read(p_conversation uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_lead uuid;
begin
  select lead_id into v_lead from public.chat_conversations where id = p_conversation;
  if v_lead is null then raise exception 'Диалог не найден'; end if;
  if public.is_admin() then
    update public.chat_conversations set admin_last_read_at = now() where id = p_conversation;
  elsif auth.uid() = v_lead then
    update public.chat_conversations set lead_last_read_at = now() where id = p_conversation;
  else
    raise exception 'Нет доступа к диалогу';
  end if;
end; $$;
grant execute on function public.chat_mark_read(uuid) to authenticated;

-- ── Представление списка диалогов (с профилем лида и счётчиком непрочитанных) ─
--    security_invoker → уважает RLS вызывающего (админ — все, лид — свой).
create or replace view public.chat_conversation_view
  with (security_invoker = true) as
select
  c.id, c.lead_id, c.last_message, c.last_message_at, c.last_sender_id,
  c.lead_last_read_at, c.admin_last_read_at, c.pinned, c.archived, c.muted,
  c.assigned_admin_id, c.created_at, c.updated_at,
  p.full_name  as lead_name,
  p.phone      as lead_phone,
  p.photo_url  as lead_photo,
  p.status     as lead_status,
  (select count(*) from public.chat_messages m
     where m.conversation_id = c.id and m.sender_id = c.lead_id and m.deleted_at is null
       and (c.admin_last_read_at is null or m.created_at > c.admin_last_read_at)
  ) as unread_for_admin,
  (select count(*) from public.chat_messages m
     where m.conversation_id = c.id and m.sender_id is distinct from c.lead_id
       and m.kind <> 'note' and m.deleted_at is null
       and (c.lead_last_read_at is null or m.created_at > c.lead_last_read_at)
  ) as unread_for_lead
from public.chat_conversations c
join public.profiles p on p.id = c.lead_id
where p.role = 'user' and p.deleted_at is null;

grant select on public.chat_conversation_view to authenticated;

-- ── Realtime ────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='chat_messages') then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='chat_conversations') then
    alter publication supabase_realtime add table public.chat_conversations;
  end if;
end $$;
