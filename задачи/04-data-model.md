# 04 — Модель данных (Data Model)

База: PostgreSQL через Supabase. Аутентификация — `auth.users` (встроенная таблица Supabase).
Ниже — наши таблицы и связи.

---

## Перечисления (enums)

```
user_role:    'admin' | 'user'
user_status:  'active' | 'paused' | 'archived'
task_status:  'not_started' | 'in_progress' | 'done'
              | 'sent_to_user' | 'accepted_by_user' | 'needs_revision'
acceptance:   'pending' | 'accepted' | 'rejected'
```

---

## Таблица: `profiles`
Расширяет `auth.users` (id совпадает с auth.users.id).

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid (PK, FK → auth.users) | идентификатор |
| full_name | text | имя и фамилия |
| phone | text | номер телефона |
| email | text | почта |
| photo_url | text | ссылка на фото (Supabase Storage) |
| role | user_role | admin / user |
| status | user_status | статус пользователя |
| business_direction | text | направление бизнеса |
| login | text | логин (если нужен отдельный от email) |
| admin_comment | text | комментарий администратора |
| registration_date | timestamptz | дата регистрации |
| created_at / updated_at | timestamptz | служебные |

> Пароль НЕ храним в profiles. Им управляет Supabase Auth (хэшируется).
> «Выдать пароль» = админ создаёт пользователя и задаёт начальный пароль через Auth.

---

## Таблица: `leads`
Каждая регистрация фиксируется как лид (требование владельца).

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid (PK) | |
| full_name | text | имя (обязательно) |
| phone | text | номер (обязательно) |
| source | text | откуда пришёл |
| converted_user_id | uuid (FK → profiles, nullable) | если стал пользователем |
| created_at | timestamptz | |

---

## Таблица: `tabs` (гибкая система вкладок)

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid (PK) | |
| key | text (unique) | напр. `media`, `sales`, `kpi` |
| title | text | напр. «Медиа / Контент» |
| icon | text | имя иконки |
| sort_order | int | порядок отображения |
| is_active | boolean | показывать ли вкладку |
| schema | jsonb (nullable) | описание доп. полей вкладки (на будущее) |
| created_at | timestamptz | |

Первая запись при сидинге: `key='media'`, `title='Медиа / Контент'`.

---

## Таблица: `tasks`
Универсальная модель задачи (используется вкладкой Медиа и будущими вкладками).

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | чья задача |
| tab_id | uuid (FK → tabs) | к какой вкладке |
| title | text | название задачи |
| task_type | text | напр. `reels`, `creative` (гибко) |
| status | task_status | статус выполнения |
| acceptance_status | acceptance | принятие пользователем |
| deadline | date (nullable) | дедлайн |
| admin_comment | text | комментарий админа |
| user_comment | text | комментарий пользователя |
| created_by | uuid (FK → profiles) | кто создал |
| updated_by | uuid (FK → profiles) | кто последним менял |
| created_at | timestamptz | создана |
| sent_at | timestamptz (nullable) | отправлена пользователю |
| accepted_at | timestamptz (nullable) | принята пользователем |
| updated_at | timestamptz | |

---

## Таблица: `task_links`
Ссылки на материалы задачи (может быть несколько).

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid (PK) | |
| task_id | uuid (FK → tasks) | |
| url | text | ссылка |
| label | text | подпись (Google Drive / Видео / Дизайн / Пост) |
| created_at | timestamptz | |

---

## Таблица: `achievements`

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | |
| title | text | название достижения |
| description | text | описание |
| achieved_at | date | дата |
| created_by | uuid (FK → profiles) | |
| created_at | timestamptz | |

---

## Таблица: `activity_log` (история действий)

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid (PK) | |
| actor_id | uuid (FK → profiles) | кто сделал |
| entity_type | text | `task` / `profile` / `achievement` ... |
| entity_id | uuid | id объекта |
| action | text | `created` / `status_changed` / `accepted` ... |
| details | jsonb | старое/новое значение и т.п. |
| created_at | timestamptz | когда |

---

## Безопасность (Row Level Security)

Включить RLS на всех таблицах. Политики:

- **admin** (role = 'admin'): полный доступ ко всем строкам.
- **user**: SELECT/UPDATE только строк, где `user_id = auth.uid()`
  (для задач — может менять только `acceptance_status`, `user_comment`, `accepted_at`).
- `leads` и `tabs`: чтение/запись только админам (пользователю вкладки приходят отфильтрованными).

> Реализовать через Postgres-функцию проверки роли + политики. Описать в миграциях.

---

## Связи (кратко)

```
auth.users 1───1 profiles
profiles   1───* tasks (user_id)
profiles   1───* achievements
tabs       1───* tasks (tab_id)
tasks      1───* task_links
profiles   1───* activity_log (actor_id)
```

---

## Принцип расширения

Новая вкладка (например «Продажи»):
1. Добавить запись в `tabs`.
2. Если хватает модели `tasks` — готово, задачи привязываются по `tab_id`.
3. Если нужны особые поля — хранить в `tasks` через будущее JSONB-поле `data`
   или создать отдельную таблицу для этого типа вкладки.

Так система растёт без переписывания ядра.
