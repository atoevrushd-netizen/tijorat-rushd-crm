-- 0020_task_templates.sql
-- Автовыдача заданий новым лидам.
-- Анкета (survey_questions) и «Разбор» (razbor_sections) — ОБЩИЕ, появляются у каждого
-- лида автоматически. А задачи индивидуальны, поэтому вводим шаблон + триггер:
-- при создании лида (profiles.role = 'user') ему копируются все шаблонные задачи.

create table public.task_templates (
  id         uuid primary key default gen_random_uuid(),
  tab_key    text not null,           -- 'calendar' | 'media'
  title      text not null,
  task_type  text,                    -- 'other' | 'reels' | 'creative'
  deadline   date,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.task_templates to authenticated, service_role;
alter table public.task_templates enable row level security;

-- Шаблон читают все авторизованные; редактирует только админ.
create policy "task_tpl_select_auth" on public.task_templates
  for select to authenticated using (true);
create policy "task_tpl_insert_admin" on public.task_templates
  for insert with check (public.is_admin());
create policy "task_tpl_update_admin" on public.task_templates
  for update using (public.is_admin());
create policy "task_tpl_delete_admin" on public.task_templates
  for delete using (public.is_admin());

-- При создании лида — выдать ему все шаблонные задания (security definer → в обход RLS).
create or replace function public.provision_lead_tasks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'user' then
    insert into public.tasks (user_id, tab_id, title, task_type, deadline, status)
    select new.id, tb.id, tt.title, tt.task_type, tt.deadline, 'not_started'
    from public.task_templates tt
    join public.tabs tb on tb.key = tt.tab_key;
  end if;
  return new;
end $$;

create trigger provision_lead_tasks
  after insert on public.profiles
  for each row execute function public.provision_lead_tasks();
