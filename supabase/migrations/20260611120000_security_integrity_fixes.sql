-- ─────────────────────────────────────────────────────────
-- Security & integrity fixes (audit 2026-06-11)
--
-- 1. Pin search_path on SECURITY DEFINER functions (linter: function_search_path_mutable)
-- 2. viewer role: read-only access to ALL departments (was: none)
-- 3. Role-aware write policies (viewer/manager could write where they must not)
-- 4. Missing write policies: departments, manager_departments
-- 5. organizations: owner-only update, column-level grant (plan is webhook-only)
-- 6. subscriptions: one row per org (webhook upsert created duplicates after checkout)
-- 7. handle_new_user: capture avatar_url from OAuth metadata
-- 8. updated_at on employees / departments
-- 9. Missing indexes (FK + lookup paths)
-- ─────────────────────────────────────────────────────────

-- ── 1. Pin search_path ───────────────────────────────────

create or replace function auth_org_ids()
returns setof uuid
language sql stable security definer
set search_path = public
as $$
  select org_id from memberships where user_id = auth.uid();
$$;

-- ── 2. visible_department_ids: viewer sees everything (read-only) ──
-- Role hierarchy: owner > admin > manager (assigned depts only) > viewer.
-- Department scoping is a property of the manager role; viewer is org-wide read-only.

create or replace function visible_department_ids()
returns setof uuid
language sql stable security definer
set search_path = public
as $$
  select d.id from departments d
  join memberships m on m.org_id = d.org_id
  where m.user_id = auth.uid() and m.role in ('owner', 'admin', 'viewer')

  union

  select md.department_id from manager_departments md
  join memberships m on m.id = md.membership_id
  where m.user_id = auth.uid() and m.role = 'manager';
$$;

-- ── 3. Role helper for policies ──────────────────────────

create or replace function auth_has_role(p_org_id uuid, p_roles user_role[])
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships
    where org_id = p_org_id
      and user_id = auth.uid()
      and role = any(p_roles)
  );
$$;

-- ── 4. Role-aware write policies ─────────────────────────

-- EMPLOYEES: owner/admin everywhere; manager only inside assigned departments.
drop policy if exists emp_write on employees;
create policy emp_write on employees
  for all
  using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and dept_id in (select visible_department_ids())
    )
  )
  with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and dept_id in (select visible_department_ids())
    )
  );

-- SCHEDULE_ENTRIES: same role rules as employees.
drop policy if exists sched_write on schedule_entries;
create policy sched_write on schedule_entries
  for all
  using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and employee_id in (
        select e.id from employees e
        where e.dept_id in (select visible_department_ids())
      )
    )
  )
  with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and employee_id in (
        select e.id from employees e
        where e.dept_id in (select visible_department_ids())
      )
    )
  );

-- STATUS_TYPES: owner/admin only (was: any member, incl. viewer).
-- System statuses (org_id IS NULL) are never client-writable.
drop policy if exists status_write on status_types;
create policy status_write on status_types
  for all
  using (org_id is not null and auth_has_role(org_id, array['owner','admin']::user_role[]))
  with check (org_id is not null and auth_has_role(org_id, array['owner','admin']::user_role[]));

-- ALERT_CONFIGS: owner/admin everywhere; manager only for assigned departments.
drop policy if exists alert_write on alert_configs;
create policy alert_write on alert_configs
  for all
  using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and department_id in (select visible_department_ids())
    )
  )
  with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and department_id in (select visible_department_ids())
    )
  );

-- DEPARTMENTS: write was impossible (no policy). owner/admin manage structure.
drop policy if exists dept_write on departments;
create policy dept_write on departments
  for all
  using (auth_has_role(org_id, array['owner','admin']::user_role[]))
  with check (auth_has_role(org_id, array['owner','admin']::user_role[]));

-- MANAGER_DEPARTMENTS: owner/admin assign managers to departments.
drop policy if exists mgr_dept_write on manager_departments;
create policy mgr_dept_write on manager_departments
  for all
  using (
    exists (
      select 1 from departments d
      where d.id = department_id
        and auth_has_role(d.org_id, array['owner','admin']::user_role[])
    )
  )
  with check (
    exists (
      select 1 from departments d
      where d.id = department_id
        and auth_has_role(d.org_id, array['owner','admin']::user_role[])
    )
  );

-- INVITATIONS: listing/revoking is owner/admin business (rows contain emails).
drop policy if exists inv_select on invitations;
create policy inv_select on invitations
  for select using (auth_has_role(org_id, array['owner','admin']::user_role[]));

drop policy if exists inv_delete on invitations;
create policy inv_delete on invitations
  for delete using (auth_has_role(org_id, array['owner','admin']::user_role[]));

-- ── 5. ORGANIZATIONS: owner can update settings, but never `plan` ──
-- plan / trial_ends_at are managed exclusively by the Paddle webhook (service role).

drop policy if exists org_update on organizations;
create policy org_update on organizations
  for update
  using (auth_has_role(id, array['owner']::user_role[]))
  with check (auth_has_role(id, array['owner']::user_role[]));

revoke update on organizations from authenticated;
grant update (name, timezone, default_locale, billing_email) on organizations to authenticated;

-- ── 6. SUBSCRIPTIONS: exactly one row per org ────────────
-- Webhook upserted by paddle_subscription_id while org creation inserts a
-- trialing row with NULL paddle id → first checkout produced a second row.

delete from subscriptions s
using subscriptions newer
where s.org_id = newer.org_id
  and s.created_at < newer.created_at;

alter table subscriptions
  add constraint subscriptions_org_id_key unique (org_id);

drop index if exists idx_subscriptions_org; -- superseded by the unique constraint

-- ── 7. handle_new_user: also capture avatar from OAuth ───

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── 8. updated_at on employees / departments ─────────────

alter table employees   add column if not exists updated_at timestamptz not null default now();
alter table departments add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_emp_updated on employees;
create trigger trg_emp_updated
  before update on employees
  for each row execute function set_updated_at();

drop trigger if exists trg_dept_updated on departments;
create trigger trg_dept_updated
  before update on departments
  for each row execute function set_updated_at();

-- ── 9. Missing indexes ───────────────────────────────────

create index if not exists idx_invitations_org on invitations(org_id);

-- One pending invitation per (org, email); re-invite replaces the old one in app logic.
create unique index if not exists idx_invitations_pending_unique
  on invitations(org_id, lower(email)) where accepted_at is null;

create index if not exists idx_mgr_dept_department on manager_departments(department_id);
create index if not exists idx_alert_configs_org on alert_configs(org_id);
create index if not exists idx_schedule_status on schedule_entries(status_id);
