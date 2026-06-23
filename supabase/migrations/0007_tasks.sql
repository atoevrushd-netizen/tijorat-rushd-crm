-- 0007_tasks.sql
-- Задачи (вкладка «Медиа/Контент» и будущие) + ссылки на материалы.
-- Статус — единый enum из 6 состояний (по ТЗ). Принятие пользователем выражено
-- статусами sent_to_user / accepted_by_user / needs_revision.

create type task_status as enum (
  'not_started',
  'in_progress',
  'done',
  'sent_to_user',
  'accepted_by_user',
  'needs_revision'
);

create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  tab_id        uuid references public.tabs (id) on delete set null,
  title         text not null,
  task_type     text,                              -- 'reels' | 'creative' (гибко)
  status        task_status not null default 'not_started',
  deadline      date,
  admin_comment text,
  user_comment  text,
  created_by    uuid references public.profiles (id) on delete set null,
  updated_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  sent_at       timestamptz,
  accepted_at   timestamptz,
  updated_at    timestamptz not null default now()
);
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_tab_id_idx on public.tasks (tab_id);

create table public.task_links (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks (id) on delete cascade,
  url        text not null,
  label      text,
  created_at timestamptz not null default now()
);
create index task_links_task_id_idx on public.task_links (task_id);

grant select, insert, update, delete on public.tasks to authenticated, service_role;
grant select, insert, update, delete on public.task_links to authenticated, service_role;

-- Авто-таймстемпы: updated_at, sent_at, accepted_at по смене статуса.
create or replace function public.tasks_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status = 'sent_to_user'
     and old.status is distinct from 'sent_to_user' and new.sent_at is null then
    new.sent_at = now();
  end if;
  if new.status = 'accepted_by_user'
     and old.status is distinct from 'accepted_by_user' and new.accepted_at is null then
    new.accepted_at = now();
  end if;
  return new;
end; $$;
create trigger tasks_touch_trg before update on public.tasks
  for each row execute function public.tasks_touch();

-- RLS: задачи видят свой владелец и админ; вести (insert/update/delete) — только админ.
alter table public.tasks enable row level security;
create policy "tasks_select_own_or_admin" on public.tasks
  for select using (user_id = auth.uid() or public.is_admin());
create policy "tasks_insert_admin" on public.tasks for insert with check (public.is_admin());
create policy "tasks_update_admin" on public.tasks for update using (public.is_admin());
create policy "tasks_delete_admin" on public.tasks for delete using (public.is_admin());

alter table public.task_links enable row level security;
create policy "task_links_select_own_or_admin" on public.task_links
  for select using (
    exists (
      select 1 from public.tasks t
      where t.id = task_links.task_id
        and (t.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "task_links_insert_admin" on public.task_links for insert with check (public.is_admin());
create policy "task_links_update_admin" on public.task_links for update using (public.is_admin());
create policy "task_links_delete_admin" on public.task_links for delete using (public.is_admin());

-- Пользователь принимает/возвращает СВОЮ задачу и только если она ему отправлена.
create or replace function public.respond_to_task(
  p_task_id uuid,
  p_accept  boolean,
  p_comment text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_owner  uuid;
  v_status task_status;
begin
  select user_id, status into v_owner, v_status from public.tasks where id = p_task_id;
  if v_owner is null then
    raise exception 'Задача не найдена';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'Это не ваша задача';
  end if;
  if v_status <> 'sent_to_user' then
    raise exception 'Принять или вернуть можно только отправленную задачу';
  end if;

  if p_accept then
    update public.tasks
      set status = 'accepted_by_user',
          user_comment = coalesce(p_comment, user_comment)
      where id = p_task_id;
  else
    update public.tasks
      set status = 'needs_revision', user_comment = p_comment
      where id = p_task_id;
  end if;
end; $$;

revoke all on function public.respond_to_task(uuid, boolean, text) from public;
grant execute on function public.respond_to_task(uuid, boolean, text) to authenticated;
