-- 0018_razbor.sql
-- «Разбор» (таҳлили ҷаласаҳои коучӣ). По образцу опросов:
--   razbor_sections — общий контент разборов (заголовок + отчёт + вопросы), read-only для лида;
--   razbor_answers  — ответы лида (два поля на разбор: 'answers' и 'tasks').
-- Тексты двуязычные (ru + tg). Приватность как в опросах: лид видит свои, админ — все.

create table public.razbor_sections (
  id           uuid primary key default gen_random_uuid(),
  sort_order   int  not null unique,
  title_ru     text not null,
  title_tg     text not null,
  report_ru    text not null default '',   -- «Отчёт по заданиям» (показывается)
  report_tg    text not null default '',
  questions_ru text not null default '',   -- «Вопросы и запросы» (показывается)
  questions_tg text not null default '',
  created_at   timestamptz not null default now()
);

create table public.razbor_answers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  section_id  uuid not null references public.razbor_sections (id) on delete cascade,
  field       text not null check (field in ('answers', 'tasks')),  -- «Ответы» / «Получить задания»
  answer      text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, section_id, field)
);
create index razbor_answers_user_idx on public.razbor_answers (user_id);

grant select, insert, update, delete on public.razbor_sections to authenticated, service_role;
grant select, insert, update, delete on public.razbor_answers  to authenticated, service_role;

alter table public.razbor_sections enable row level security;
alter table public.razbor_answers  enable row level security;

-- Контент разборов читают все авторизованные; изменяет только админ.
create policy "razbor_s_select_auth" on public.razbor_sections
  for select to authenticated using (true);
create policy "razbor_s_insert_admin" on public.razbor_sections
  for insert with check (public.is_admin());
create policy "razbor_s_update_admin" on public.razbor_sections
  for update using (public.is_admin());
create policy "razbor_s_delete_admin" on public.razbor_sections
  for delete using (public.is_admin());

-- Ответы: лид видит/пишет только свои; админ — любые. Удаляет только админ.
create policy "razbor_a_select_own_or_admin" on public.razbor_answers
  for select using (user_id = auth.uid() or public.is_admin());
create policy "razbor_a_insert_own_or_admin" on public.razbor_answers
  for insert with check (user_id = auth.uid() or public.is_admin());
create policy "razbor_a_update_own_or_admin" on public.razbor_answers
  for update using (user_id = auth.uid() or public.is_admin());
create policy "razbor_a_delete_admin" on public.razbor_answers
  for delete using (public.is_admin());

-- updated_at при изменении (переиспользуем функцию из опросов).
create trigger razbor_answers_touch
  before update on public.razbor_answers
  for each row execute function public.survey_answers_touch();
