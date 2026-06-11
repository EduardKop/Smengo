-- ─────────────────────────────────────────────────────────
-- Employee card fields + optional shift times
--
-- * employees: contact / dates fields backing the employee card
--   (phone, telegram, email, birth_date, hired_on, note)
-- * status_types: optional default shift window (e.g. day 09:00–17:00)
-- * schedule_entries: optional per-entry override of the window
--   (night shifts cross midnight → no start<end constraint)
-- * schedule_entries: created_by/updated_by stamped server-side,
--   not trusted from the client
-- ─────────────────────────────────────────────────────────

-- ── employees: card fields ───────────────────────────────

alter table employees
  add column if not exists phone      text,
  add column if not exists telegram   text,
  add column if not exists email      text,
  add column if not exists birth_date date,
  add column if not exists hired_on   date,
  add column if not exists note       text;

-- ── status_types: default shift window ───────────────────

alter table status_types
  add column if not exists start_time time,
  add column if not exists end_time   time;

-- ── schedule_entries: per-day override + actor stamps ────

alter table schedule_entries
  add column if not exists start_time time,
  add column if not exists end_time   time,
  add column if not exists updated_by uuid references auth.users(id);

create or replace function set_schedule_entry_actor()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
  elsif tg_op = 'UPDATE' then
    new.updated_by := coalesce(auth.uid(), new.updated_by);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sched_actor on schedule_entries;
create trigger trg_sched_actor
  before insert or update on schedule_entries
  for each row execute function set_schedule_entry_actor();
