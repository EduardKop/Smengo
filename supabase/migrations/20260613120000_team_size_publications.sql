-- ─────────────────────────────────────────────────────────
-- Правка 7: team_size на онбординге + публикация графика по месяцам.
--
-- schedule_publications — журнал публикаций (org + месяц + кто/когда +
-- выбор нотификации; сама рассылка подключится отдельной правкой).
-- schedule_change_marks — метка «в месяце были правки»: обновляется
-- SECURITY DEFINER-триггером на schedule_entries (insert/update/delete).
-- Вариант max(updated_at) по entries отвергнут: не ловит удаления.
-- ─────────────────────────────────────────────────────────

alter table organizations add column if not exists team_size text;
grant update (team_size) on organizations to authenticated;

-- ── Публикации графика (org + месяц) ─────────────────────
create table if not exists schedule_publications (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  month        date not null, -- первое число месяца
  published_by uuid not null references profiles(id),
  notify       boolean not null default false,
  published_at timestamptz not null default now()
);

create index if not exists idx_publications_org_month
  on schedule_publications (org_id, month, published_at desc);

alter table schedule_publications enable row level security;

drop policy if exists pub_select on schedule_publications;
create policy pub_select on schedule_publications
  for select using (org_id in (select auth_org_ids()));

drop policy if exists pub_insert on schedule_publications;
create policy pub_insert on schedule_publications
  for insert with check (
    auth_has_role(org_id, array['owner','admin','manager']::user_role[])
    and published_by = (select auth.uid())
  );

-- ── Метки «в месяце были правки» ──────────────────────────
create table if not exists schedule_change_marks (
  org_id         uuid not null references organizations(id) on delete cascade,
  month          date not null,
  last_change_at timestamptz not null default now(),
  primary key (org_id, month)
);

alter table schedule_change_marks enable row level security;

drop policy if exists marks_select on schedule_change_marks;
create policy marks_select on schedule_change_marks
  for select using (org_id in (select auth_org_ids()));
-- insert/update/delete политики намеренно отсутствуют: пишет только
-- SECURITY DEFINER-функция триггера, прямые записи клиентов RLS отвергает.

create or replace function touch_schedule_change_mark()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  r := coalesce(new, old);
  insert into schedule_change_marks (org_id, month, last_change_at)
  values (r.org_id, date_trunc('month', r.entry_date)::date, now())
  on conflict (org_id, month) do update set last_change_at = now();
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_schedule_change_mark on schedule_entries;
create trigger trg_schedule_change_mark
  after insert or update or delete on schedule_entries
  for each row execute function touch_schedule_change_mark();
