-- Бейдж «стажёр / штатный» из демо-дизайна (вкладка «Сотрудники», ячейки extended)
alter table employees
  add column if not exists employment_kind text not null default 'staff'
  check (employment_kind in ('staff', 'trainee'));
