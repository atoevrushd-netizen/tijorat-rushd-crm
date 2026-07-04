-- 0029_task_i18n.sql
-- Двуязычные заголовки задач (ru + tg). Как у анкет/разбора: показываем язык
-- интерфейса, с откатом на исходный title. Существующие тексты переведены вручную;
-- новые задачи будут переводиться автоматически (Edge Function translate + Claude).

-- 1) Колонки перевода (nullable → старый код и вставки без них работают).
alter table public.tasks           add column if not exists title_ru text;
alter table public.tasks           add column if not exists title_tg text;
alter table public.task_templates  add column if not exists title_ru text;
alter table public.task_templates  add column if not exists title_tg text;

-- 2) Ручной перевод существующих таджикских заданий (title_tg = исходник, title_ru = перевод).
update public.tasks set title_ru = 'Онбординг + полный аудит 10 бизнесов (SWOT, ниша, цель)',                                     title_tg = title where title = 'Онбординг + аудити пурраи 10 тиҷорат (SWOT, ниша, мақсад)';
update public.tasks set title_ru = 'Стратегия маркетинга, позиционирование, портрет клиента (ЦА), анализ конкурентов',           title_tg = title where title = 'Стратегияи маркетинг, позиционирование, портрети мизоҷ (ЦА), таҳлили рақибон';
update public.tasks set title_ru = 'Контент-план на 6 месяцев + сценарии первых 5 рилс + визуальная концепция бренда',            title_tg = title where title = 'Контент-плани 6-моҳа + сценарияи 5 рилси аввал + консепсияи визуалии бренд';
update public.tasks set title_ru = 'Общий урок №1 «Основы системного бизнеса» + Живой урок №1 (Таджикистан)',                     title_tg = title where title = 'Дарси умумии №1 «Асосҳои тиҷорати системавӣ» + Дарси зиндаи №1 (Тоҷикистон)';
update public.tasks set title_ru = 'Начало упаковки IG/FB + выбор платформы CRM',                                                 title_tg = title where title = 'Оғози упаковкаи IG/FB + интихоби платформаи CRM';
update public.tasks set title_ru = 'Производство 5 рилс + 5 креативов, контент для веб-сайта',                                     title_tg = title where title = 'Истеҳсоли 5 рилс + 5 креатив, контенти вебсайт';
update public.tasks set title_ru = 'Настройка CRM (этап 1) + черновик скрипта продаж',                                            title_tg = title where title = 'Танзими CRM (марҳилаи 1) + драфти скрипти фурӯш';
update public.tasks set title_ru = 'Завершение упаковки IG/FB, начало создания веб-сайта',                                        title_tg = title where title = 'Анҷоми упаковкаи IG/FB, оғози сохтани вебсайт';
update public.tasks set title_ru = 'Общий урок №2 + Живой урок №2 (Таджикистан)',                                                 title_tg = title where title = 'Дарси умумии №2 + Дарси зиндаи №2 (Тоҷикистон)';
update public.tasks set title_ru = 'Прототип и структура веб-сайта',                                                              title_tg = title where title = 'Прототип ва структураи вебсайт';
update public.tasks set title_ru = 'Завершение и публикация веб-сайта',                                                           title_tg = title where title = 'Анҷом ва нашри вебсайт';
update public.tasks set title_ru = 'Настройка и запуск таргета (платная реклама)',                                                title_tg = title where title = 'Танзим ва оғози таргет (рекламаи пулакӣ)';
update public.tasks set title_ru = 'Завершение скрипта продаж + первый тест',                                                     title_tg = title where title = 'Анҷоми скрипти фурӯш + тести аввал';
update public.tasks set title_ru = 'Общий урок №3 + Живой урок №3 (Таджикистан)',                                                 title_tg = title where title = 'Дарси умумии №3 + Дарси зиндаи №3 (Тоҷикистон)';
update public.tasks set title_ru = 'Полная установка CRM + импорт лидов',                                                         title_tg = title where title = 'Насби пурраи CRM + ворид кардани лидҳо';
update public.tasks set title_ru = 'Обучение отдела продаж работе с CRM + внедрение скрипта',                                      title_tg = title where title = 'Омӯзиши шуъбаи фурӯш бо CRM + татбиқи скрипт';
update public.tasks set title_ru = 'Производство 5 рилс + 5 креативов, оптимизация таргета',                                       title_tg = title where title = 'Истеҳсоли 5 рилс + 5 креатив, оптимизатсияи таргет';
update public.tasks set title_ru = 'Общий урок №4 + Живой урок №4 (за рубежом)',                                                  title_tg = title where title = 'Дарси умумии №4 + Дарси зиндаи №4 (хориҷи кишвар)';
update public.tasks set title_ru = 'Увеличение рекламного бюджета на выигрышные креативы',                                        title_tg = title where title = 'Зиёд кардани буҷети реклама ба креативҳои бурднок';
update public.tasks set title_ru = 'Производство 5 рилс + 5 креативов',                                                           title_tg = title where title = 'Истеҳсоли 5 рилс + 5 креатив';
update public.tasks set title_ru = 'Анализ аналитики + оптимизация воронки продаж',                                               title_tg = title where title = 'Таҳлили аналитика + оптимизатсияи воронкаи фурӯш';
update public.tasks set title_ru = 'Автоматизация процессов в CRM',                                                               title_tg = title where title = 'Автоматизатсияи равандҳо дар CRM';
update public.tasks set title_ru = 'Общий урок №5 + Живой урок №5 (за рубежом)',                                                  title_tg = title where title = 'Дарси умумии №5 + Дарси зиндаи №5 (хориҷи кишвар)';
update public.tasks set title_ru = 'Производство последних 5 рилс + 5 креативов',                                                 title_tg = title where title = 'Истеҳсоли 5 рилси охирин + 5 креатив';
update public.tasks set title_ru = 'Полная документация системы (регламенты)',                                                    title_tg = title where title = 'Ҳуҷҷатгузории пурраи система (регламентҳо)';
update public.tasks set title_ru = 'Передача системы предпринимателю / его команде',                                             title_tg = title where title = 'Супоридани система ба соҳибкор/тими ӯ';
update public.tasks set title_ru = 'Подведение итогов, финальный отчёт, дальнейший план',                                         title_tg = title where title = 'Ҷамъбасти натиҷа, ҳисоботи ниҳоӣ, нақшаи минбаъда';
update public.tasks set title_ru = 'Общий урок №6 + Живой урок №6 (за рубежом)',                                                  title_tg = title where title = 'Дарси умумии №6 + Дарси зиндаи №6 (хориҷи кишвар)';
update public.tasks set title_ru = 'Контроль конверсии + улучшение скрипта',                                                      title_tg = title where title = 'Назорати конверсия + такмили скрипт';

-- 3) Остальные задачи (нумерованные «Креатив/Рилс №N» и пр.) — нейтральны: оба языка = исходник.
update public.tasks
  set title_ru = coalesce(title_ru, title),
      title_tg = coalesce(title_tg, title)
  where title_ru is null or title_tg is null;

-- 4) Шаблоны автозадач (все нумерованные) — оба языка = исходник.
update public.task_templates
  set title_ru = coalesce(title_ru, title),
      title_tg = coalesce(title_tg, title)
  where title_ru is null or title_tg is null;

-- 5) Триггер автовыдачи: копируем и переводы шаблона (с откатом на title).
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
    insert into public.tasks (user_id, tab_id, title, title_ru, title_tg, task_type, deadline, status)
    select new.id, tb.id, tt.title,
           coalesce(tt.title_ru, tt.title), coalesce(tt.title_tg, tt.title),
           tt.task_type, tt.deadline, 'not_started'
    from public.task_templates tt
    join public.tabs tb on tb.key = tt.tab_key
    where tt.group_id = s.active_group_id;
  end if;
  return new;
end $$;
