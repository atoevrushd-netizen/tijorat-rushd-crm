-- 0008_activity_log.sql
-- История действий: что/кто/когда. Пишется автоматически триггерами,
-- поэтому фиксируется независимо от того, какой клиент сделал изменение.

create table public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete cascade,  -- субъект (чья карточка)
  actor_id    uuid references public.profiles (id) on delete set null, -- кто сделал
  entity_type text not null,   -- 'task' | 'profile' | 'achievement'
  entity_id   uuid,
  action      text not null,   -- 'created' | 'status_changed' | ...
  details     jsonb,
  created_at  timestamptz not null default now()
);
create index activity_log_user_idx on public.activity_log (user_id, created_at desc);

grant select on public.activity_log to authenticated, service_role;
alter table public.activity_log enable row level security;

-- читать историю может субъект (свою) и админ (любую)
create policy "activity_select_own_or_admin" on public.activity_log
  for select using (user_id = auth.uid() or public.is_admin());

-- Авто-логирование задач (SECURITY DEFINER → запись от владельца, обходит RLS).
create or replace function public.log_task_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.activity_log (user_id, actor_id, entity_type, entity_id, action, details)
    values (new.user_id, auth.uid(), 'task', new.id, 'created',
            jsonb_build_object('title', new.title, 'task_type', new.task_type));
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status then
    insert into public.activity_log (user_id, actor_id, entity_type, entity_id, action, details)
    values (new.user_id, auth.uid(), 'task', new.id, 'status_changed',
            jsonb_build_object('title', new.title, 'from', old.status, 'to', new.status));
  end if;
  return null; -- AFTER-триггер
end; $$;

create trigger tasks_activity_ins after insert on public.tasks
  for each row execute function public.log_task_activity();
create trigger tasks_activity_upd after update on public.tasks
  for each row execute function public.log_task_activity();
