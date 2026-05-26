-- ─────────────────────────────────────────────────────────
-- §2.2 ENUM TYPES
-- ─────────────────────────────────────────────────────────

do $$ begin
  create type user_role as enum ('owner', 'admin', 'manager', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('trialing', 'active', 'past_due', 'paused', 'canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('start', 'team', 'business');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────
-- §2.3 TABLES
-- ─────────────────────────────────────────────────────────

-- ORGANIZATIONS (tenant)
create table if not exists organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  billing_email   text not null,
  default_locale  text not null default 'ru',
  timezone        text not null default 'Europe/Kyiv',
  plan            plan_tier not null default 'start',
  trial_ends_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- PROFILES (1:1 with auth.users)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_url   text,
  locale       text default 'ru',
  created_at   timestamptz not null default now()
);

-- MEMBERSHIPS (user ↔ organization + role)
create table if not exists memberships (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        user_role not null default 'manager',
  created_at  timestamptz not null default now(),
  unique (org_id, user_id)
);

-- DEPARTMENTS
create table if not exists departments (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  parent_id   uuid references departments(id) on delete set null,
  name        text not null,
  geo         text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- MANAGER_DEPARTMENTS (manager role visibility)
create table if not exists manager_departments (
  membership_id uuid not null references memberships(id) on delete cascade,
  department_id uuid not null references departments(id) on delete cascade,
  primary key (membership_id, department_id)
);

-- EMPLOYEES (not auth users in MVP)
create table if not exists employees (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  dept_id     uuid references departments(id) on delete set null,
  full_name   text not null,
  position    text,
  sort_order  int not null default 0,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- STATUS_TYPES (system + custom shift statuses)
create table if not exists status_types (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid references organizations(id) on delete cascade,
  code              text not null,
  label             jsonb not null,
  color             text not null,
  counts_as_present boolean not null default true,
  is_system         boolean not null default false,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

-- SCHEDULE_ENTRIES (core: one status per employee per day)
create table if not exists schedule_entries (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  employee_id   uuid not null references employees(id) on delete cascade,
  entry_date    date not null,
  status_id     uuid not null references status_types(id),
  note          text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (employee_id, entry_date)
);

-- ALERT_CONFIGS (coverage alerts per department)
create table if not exists alert_configs (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  department_id   uuid not null references departments(id) on delete cascade,
  min_present     int not null default 1,
  notify_user_ids uuid[] not null default '{}',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- SUBSCRIPTIONS (Paddle billing)
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null references organizations(id) on delete cascade,
  plan                   plan_tier not null,
  status                 subscription_status not null,
  paddle_customer_id     text,
  paddle_subscription_id text unique,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- WEBHOOK_EVENTS (Paddle idempotency)
create table if not exists webhook_events (
  id           text primary key,
  type         text not null,
  payload      jsonb not null,
  processed_at timestamptz not null default now()
);

-- INVITATIONS (invite managers)
create table if not exists invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  email       text not null,
  role        user_role not null default 'manager',
  token       text unique not null,
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────
-- §2.4 INDEXES
-- ─────────────────────────────────────────────────────────

create index if not exists idx_memberships_org       on memberships(org_id);
create index if not exists idx_memberships_user      on memberships(user_id);
create index if not exists idx_departments_org       on departments(org_id);
create index if not exists idx_departments_parent    on departments(parent_id);
create index if not exists idx_employees_org         on employees(org_id);
create index if not exists idx_employees_dept        on employees(dept_id);
create index if not exists idx_alert_configs_dept    on alert_configs(department_id);
create index if not exists idx_subscriptions_org     on subscriptions(org_id);

create index if not exists idx_schedule_org_date
  on schedule_entries(org_id, entry_date);

create index if not exists idx_schedule_employee_date
  on schedule_entries(employee_id, entry_date);

create index if not exists idx_employees_active
  on employees(org_id) where deleted_at is null;

create index if not exists idx_status_types_org
  on status_types(org_id) where org_id is not null;

-- Unique: one system code globally (org_id IS NULL), one per org otherwise
create unique index if not exists idx_status_types_system_code
  on status_types(code) where org_id is null;

create unique index if not exists idx_status_types_org_code
  on status_types(org_id, code) where org_id is not null;

-- ─────────────────────────────────────────────────────────
-- §2.5 ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────

create or replace function auth_org_ids()
returns setof uuid
language sql stable security definer
as $$
  select org_id from memberships where user_id = auth.uid();
$$;

create or replace function visible_department_ids()
returns setof uuid
language sql stable security definer
as $$
  select d.id from departments d
  join memberships m on m.org_id = d.org_id
  where m.user_id = auth.uid() and m.role in ('owner', 'admin')

  union

  select md.department_id from manager_departments md
  join memberships m on m.id = md.membership_id
  where m.user_id = auth.uid();
$$;

-- Enable RLS
alter table organizations       enable row level security;
alter table profiles            enable row level security;
alter table memberships         enable row level security;
alter table departments         enable row level security;
alter table manager_departments enable row level security;
alter table employees           enable row level security;
alter table schedule_entries    enable row level security;
alter table status_types        enable row level security;
alter table alert_configs       enable row level security;
alter table subscriptions       enable row level security;
alter table webhook_events      enable row level security;
alter table invitations         enable row level security;

-- Drop policies before recreating (idempotent)
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- ORGANIZATIONS
create policy org_select on organizations
  for select using (id in (select auth_org_ids()));

-- PROFILES
create policy profile_select on profiles
  for select using (id = auth.uid());

create policy profile_update on profiles
  for update using (id = auth.uid());

-- MEMBERSHIPS
create policy mem_select on memberships
  for select using (org_id in (select auth_org_ids()));

-- DEPARTMENTS
create policy dept_select on departments
  for select using (id in (select visible_department_ids()));

-- MANAGER_DEPARTMENTS
create policy mgr_dept_select on manager_departments
  for select using (
    department_id in (select visible_department_ids())
  );

-- EMPLOYEES
create policy emp_select on employees
  for select using (
    org_id in (select auth_org_ids())
    and (dept_id is null or dept_id in (select visible_department_ids()))
  );

create policy emp_write on employees
  for all using (
    org_id in (select auth_org_ids())
    and dept_id in (select visible_department_ids())
  );

-- SCHEDULE_ENTRIES
create policy sched_select on schedule_entries
  for select using (
    org_id in (select auth_org_ids())
    and employee_id in (
      select e.id from employees e
      where e.dept_id in (select visible_department_ids())
    )
  );

create policy sched_write on schedule_entries
  for all using (
    org_id in (select auth_org_ids())
    and employee_id in (
      select e.id from employees e
      where e.dept_id in (select visible_department_ids())
    )
  );

-- STATUS_TYPES
create policy status_select on status_types
  for select using (org_id is null or org_id in (select auth_org_ids()));

create policy status_write on status_types
  for all using (org_id in (select auth_org_ids()));

-- ALERT_CONFIGS
create policy alert_select on alert_configs
  for select using (org_id in (select auth_org_ids()));

create policy alert_write on alert_configs
  for all using (org_id in (select auth_org_ids()));

-- SUBSCRIPTIONS: owner only
create policy sub_select on subscriptions
  for select using (
    org_id in (
      select org_id from memberships
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- WEBHOOK_EVENTS: service_role only (no JWT access)

-- INVITATIONS
create policy inv_select on invitations
  for select using (org_id in (select auth_org_ids()));

-- ─────────────────────────────────────────────────────────
-- §2.6 TRIGGERS
-- ─────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sched_updated on schedule_entries;
create trigger trg_sched_updated
  before update on schedule_entries
  for each row execute function set_updated_at();

drop trigger if exists trg_org_updated on organizations;
create trigger trg_org_updated
  before update on organizations
  for each row execute function set_updated_at();

drop trigger if exists trg_sub_updated on subscriptions;
create trigger trg_sub_updated
  before update on subscriptions
  for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────
-- §2.7 SEED: system status types
-- ─────────────────────────────────────────────────────────

insert into status_types (org_id, code, label, color, counts_as_present, is_system, sort_order) values
  (null, 'work',     '{"ru":"Работает","uk":"Працює","en":"Working"}',      '#3B9B7F', true,  true, 1),
  (null, 'vacation', '{"ru":"Отпуск","uk":"Відпустка","en":"Vacation"}',    '#E8A04C', false, true, 2),
  (null, 'sick',     '{"ru":"Больничный","uk":"Лікарняний","en":"Sick"}',   '#D4604A', false, true, 3),
  (null, 'dayoff',   '{"ru":"Выходной","uk":"Вихідний","en":"Day off"}',    '#9CA3AF', false, true, 4),
  (null, 'late',     '{"ru":"Опоздание","uk":"Запізнення","en":"Late"}',    '#C77DC0', true,  true, 5)
on conflict (code) where org_id is null do nothing;
