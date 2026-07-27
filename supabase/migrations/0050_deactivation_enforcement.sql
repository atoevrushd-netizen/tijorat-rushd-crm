-- 0050_deactivation_enforcement.sql
-- Серверная блокировка деактивированного резидента (ревью #5): фронт-гейт мало —
-- с валидным JWT резидент мог бы писать напрямую через API. Добавляем RESTRICTIVE-
-- политики is_active() на все таблицы, куда пишет резидент. RESTRICTIVE = И-условие
-- поверх существующих политик: активным резидентам и админам ничего не меняет
-- (is_active() у них true), а деактивированным запрещает INSERT/UPDATE.

create or replace function public.is_active()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or not exists (
    select 1 from public.profiles
    where id = auth.uid() and deactivated_at is not null
  );
$$;
grant execute on function public.is_active() to authenticated;

-- Хелпер-макрос вручную (SQL не поддерживает циклы в DDL здесь): по таблице на команду.
drop policy if exists lead_cards_active_ins on public.lead_cards;
create policy lead_cards_active_ins on public.lead_cards as restrictive for insert to authenticated with check (public.is_active());
drop policy if exists lead_cards_active_upd on public.lead_cards;
create policy lead_cards_active_upd on public.lead_cards as restrictive for update to authenticated using (public.is_active());

drop policy if exists survey_a_active_ins on public.survey_answers;
create policy survey_a_active_ins on public.survey_answers as restrictive for insert to authenticated with check (public.is_active());
drop policy if exists survey_a_active_upd on public.survey_answers;
create policy survey_a_active_upd on public.survey_answers as restrictive for update to authenticated using (public.is_active());

drop policy if exists razbor_a_active_ins on public.razbor_answers;
create policy razbor_a_active_ins on public.razbor_answers as restrictive for insert to authenticated with check (public.is_active());
drop policy if exists razbor_a_active_upd on public.razbor_answers;
create policy razbor_a_active_upd on public.razbor_answers as restrictive for update to authenticated using (public.is_active());

drop policy if exists chat_msg_active_ins on public.chat_messages;
create policy chat_msg_active_ins on public.chat_messages as restrictive for insert to authenticated with check (public.is_active());
drop policy if exists chat_msg_active_upd on public.chat_messages;
create policy chat_msg_active_upd on public.chat_messages as restrictive for update to authenticated using (public.is_active());

-- Профиль: деактивированный не может менять и своё (имя/фото). Админ — может (is_active() true).
drop policy if exists profiles_active_upd on public.profiles;
create policy profiles_active_upd on public.profiles as restrictive for update to authenticated using (public.is_active());
