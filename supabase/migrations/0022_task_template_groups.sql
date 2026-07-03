-- 0022_task_template_groups.sql
-- Управляемые автозадачи: группы-версии + глобальные настройки (вкл/выкл, активная группа).
-- Триггер выдаёт новому лиду задачи из АКТИВНОЙ группы, только если автовыдача включена.

-- Группы (версии) автозадач.
create table public.task_template_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.task_template_groups to authenticated, service_role;
alter table public.task_template_groups enable row level security;
create policy "ttg_select_auth" on public.task_template_groups for select to authenticated using (true);
create policy "ttg_insert_admin" on public.task_template_groups for insert with check (public.is_admin());
create policy "ttg_update_admin" on public.task_template_groups for update using (public.is_admin());
create policy "ttg_delete_admin" on public.task_template_groups for delete using (public.is_admin());

-- Дефолтная группа + перенос уже существующих 90 шаблонов в неё.
insert into public.task_template_groups (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Основная программа')
on conflict (id) do nothing;

alter table public.task_templates
  add column if not exists group_id uuid references public.task_template_groups (id) on delete cascade;
update public.task_templates set group_id = '11111111-1111-1111-1111-111111111111' where group_id is null;
alter table public.task_templates alter column group_id set not null;
create index if not exists task_templates_group_idx on public.task_templates (group_id);

-- Глобальные настройки (одна строка).
create table public.app_settings (
  id                 int primary key default 1 check (id = 1),
  auto_tasks_enabled boolean not null default true,
  active_group_id    uuid references public.task_template_groups (id) on delete set null,
  updated_at         timestamptz not null default now()
);
grant select, insert, update on public.app_settings to authenticated, service_role;
alter table public.app_settings enable row level security;
create policy "settings_select_auth" on public.app_settings for select to authenticated using (true);
create policy "settings_insert_admin" on public.app_settings for insert with check (public.is_admin());
create policy "settings_update_admin" on public.app_settings for update using (public.is_admin());

insert into public.app_settings (id, auto_tasks_enabled, active_group_id)
values (1, true, '11111111-1111-1111-1111-111111111111')
on conflict (id) do nothing;

-- Триггер: выдать лиду задачи из активной группы, если автовыдача включена.
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
    insert into public.tasks (user_id, tab_id, title, task_type, deadline, status)
    select new.id, tb.id, tt.title, tt.task_type, tt.deadline, 'not_started'
    from public.task_templates tt
    join public.tabs tb on tb.key = tt.tab_key
    where tt.group_id = s.active_group_id;
  end if;
  return new;
end $$;
