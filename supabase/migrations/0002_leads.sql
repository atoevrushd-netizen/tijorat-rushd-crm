-- 0002_leads.sql
-- Фаза 1: лиды. Требование владельца — каждую регистрацию фиксировать как лид
-- (обязательно имя + телефон). Сама запись лида делается в формах
-- создания пользователя (Фаза 2) и самостоятельной регистрации (позже).

create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  phone             text not null,
  source            text,
  converted_user_id uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now()
);

-- ── Row Level Security: лиды видят и ведут только админы ─────────────────────
grant select, insert, update, delete on public.leads to authenticated, service_role;

alter table public.leads enable row level security;

create policy "leads_select_admin" on public.leads for select using (public.is_admin());
create policy "leads_insert_admin" on public.leads for insert with check (public.is_admin());
create policy "leads_update_admin" on public.leads for update using (public.is_admin());
create policy "leads_delete_admin" on public.leads for delete using (public.is_admin());
