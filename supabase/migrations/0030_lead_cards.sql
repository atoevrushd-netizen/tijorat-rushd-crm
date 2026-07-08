-- 0030_lead_cards.sql
-- «Карточка данных» лида (бизнес-карта): личные, бизнес- и финансовые поля,
-- которые лид заполняет сам в своём кабинете (вкладка «Мои данные»).
-- Все поля — text (свободный ввод: суммы, ниши, точки А/Б и т.п.).

create table public.lead_cards (
  user_id       uuid primary key references public.profiles (id) on delete cascade,
  age           text,   -- возраст
  job_status    text,   -- статус / должность
  start_date    text,   -- дата старта
  buddy         text,   -- бадди / напарник
  niche         text,   -- ниша
  point_a       text,   -- точка А
  point_b       text,   -- точка Б
  artifact      text,   -- артефакт
  debt_was      text,   -- долг был
  debt_left     text,   -- долг осталось
  earned_total  text,   -- заработано итого
  plan_month    text,   -- план на месяц
  fact_month    text,   -- факт за месяц
  company_name  text,   -- название компании
  avg_check     text,   -- средний чек
  margin        text,   -- маржа
  pqb           text,   -- P*Q=B
  updated_at    timestamptz not null default now()
);

grant select, insert, update on public.lead_cards to authenticated, service_role;
alter table public.lead_cards enable row level security;

-- Читают/пишут: владелец карточки (свою) и админ/разработчик (любую).
create policy "lead_cards_select_own_or_admin" on public.lead_cards
  for select using (user_id = auth.uid() or public.is_admin());
create policy "lead_cards_insert_own_or_admin" on public.lead_cards
  for insert with check (user_id = auth.uid() or public.is_admin());
create policy "lead_cards_update_own_or_admin" on public.lead_cards
  for update using (user_id = auth.uid() or public.is_admin());

-- updated_at при изменении.
create or replace function public.lead_cards_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger lead_cards_touch
  before update on public.lead_cards
  for each row execute function public.lead_cards_touch();
