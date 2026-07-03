-- 0023_developer_enum.sql
-- Третья роль — «Разработчик» (супер-доступ). Значение enum добавляем ОТДЕЛЬНОЙ
-- миграцией: новое значение enum нельзя использовать в той же транзакции, где оно создано.
alter type user_role add value if not exists 'developer';
