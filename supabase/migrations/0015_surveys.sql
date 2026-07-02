-- 0015_surveys.sql
-- Опросы лидов: банк вопросов (8 разделов) и ответы по типам A/B.
--   A — на входе (диагностика, когда лид только пришёл на курс);
--   B — после курса (что изменилось). Вопросы одни и те же — можно сравнивать «до/после».
-- Тексты двуязычные (ru + tg); показываем tg, если задан, иначе ru.

create table public.survey_questions (
  id               uuid primary key default gen_random_uuid(),
  section_order    int  not null,                 -- порядок раздела (1..8)
  section_key      text not null,                 -- стабильный ключ раздела ('goal', 'sales', ...)
  section_title_ru text not null,
  section_title_tg text,
  question_order   int  not null,                 -- порядок вопроса внутри раздела
  text_ru          text not null,
  text_tg          text,
  created_at       timestamptz not null default now(),
  unique (section_order, question_order)          -- слот вопроса → идемпотентный засев
);
create index survey_questions_order_idx
  on public.survey_questions (section_order, question_order);

create table public.survey_answers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  survey_type text not null check (survey_type in ('A', 'B')),
  question_id uuid not null references public.survey_questions (id) on delete cascade,
  answer      text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, survey_type, question_id)
);
create index survey_answers_user_idx on public.survey_answers (user_id, survey_type);

grant select, insert, update, delete on public.survey_questions to authenticated, service_role;
grant select, insert, update, delete on public.survey_answers   to authenticated, service_role;

alter table public.survey_questions enable row level security;
alter table public.survey_answers   enable row level security;

-- Вопросы читают все авторизованные; изменяет только админ.
create policy "survey_q_select_auth" on public.survey_questions
  for select to authenticated using (true);
create policy "survey_q_insert_admin" on public.survey_questions
  for insert with check (public.is_admin());
create policy "survey_q_update_admin" on public.survey_questions
  for update using (public.is_admin());
create policy "survey_q_delete_admin" on public.survey_questions
  for delete using (public.is_admin());

-- Ответы: видят все авторизованные (лиды видят ответы друг друга, админ — всех).
-- Пишет каждый только свои ответы; админ — любые. Удаляет только админ.
create policy "survey_a_select_auth" on public.survey_answers
  for select to authenticated using (true);
create policy "survey_a_insert_own_or_admin" on public.survey_answers
  for insert with check (user_id = auth.uid() or public.is_admin());
create policy "survey_a_update_own_or_admin" on public.survey_answers
  for update using (user_id = auth.uid() or public.is_admin());
create policy "survey_a_delete_admin" on public.survey_answers
  for delete using (public.is_admin());

-- Обновляем updated_at при изменении ответа.
create or replace function public.survey_answers_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger survey_answers_touch
  before update on public.survey_answers
  for each row execute function public.survey_answers_touch();

-- Страница «ответы всех»: лидам нужно видеть имена друг друга, но НЕ телефоны/
-- пароли/комментарии. Вьюха отдаёт только безопасные поля (id/имя/фото) и, будучи
-- security_invoker=false, читает профили от имени владельца (в обход RLS profiles).
create view public.survey_people
  with (security_invoker = false) as
  select id, full_name, photo_url
  from public.profiles
  where deleted_at is null and role = 'user';

grant select on public.survey_people to authenticated, service_role;
