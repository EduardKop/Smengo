-- ─────────────────────────────────────────────────────────
-- Supabase advisor hardening (security + performance lints)
--
-- 1. Functions: revoke default PUBLIC execute; expose only what each role needs
-- 2. set_updated_at: pin search_path
-- 3. profiles / subscriptions policies: initplan-friendly auth.uid()
-- 4. Split FOR ALL write policies into insert/update/delete
--    (multiple permissive policies per action slow row checks down)
-- 5. schedule_entries.created_by/updated_by: ON DELETE SET NULL + covering
--    indexes so deleting an auth user neither fails nor full-scans
-- ─────────────────────────────────────────────────────────

-- ── 1. Function execute grants ───────────────────────────

-- Helpers used inside RLS expressions: every querying role evaluates them.
revoke execute on function auth_org_ids()                       from public;
revoke execute on function visible_department_ids()             from public;
revoke execute on function auth_has_role(uuid, user_role[])     from public;
grant  execute on function auth_org_ids()                       to anon, authenticated;
grant  execute on function visible_department_ids()             to anon, authenticated;
grant  execute on function auth_has_role(uuid, user_role[])     to anon, authenticated;

-- Authenticated-only RPCs
revoke execute on function create_organization(text, text, text, text, text) from public, anon;
revoke execute on function create_invitation(uuid, text, user_role)          from public, anon;
revoke execute on function accept_invitation(text)                           from public, anon;
revoke execute on function update_member_role(uuid, uuid, user_role)         from public, anon;
revoke execute on function remove_member(uuid, uuid)                         from public, anon;

-- get_invitation stays anon-callable by design (invite page renders pre-auth)
revoke execute on function get_invitation(text) from public;
grant  execute on function get_invitation(text) to anon, authenticated;

-- Trigger-only functions: nobody calls these via RPC
revoke execute on function handle_new_user()           from public, anon, authenticated;
revoke execute on function set_updated_at()            from public, anon, authenticated;
revoke execute on function set_schedule_entry_actor()  from public, anon, authenticated;

-- ── 2. Pin search_path on the trigger function ───────────

create or replace function set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 3. Initplan-friendly auth.uid() ──────────────────────

drop policy if exists profile_select on profiles;
create policy profile_select on profiles
  for select using (id = (select auth.uid()));

drop policy if exists profile_update on profiles;
create policy profile_update on profiles
  for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists sub_select on subscriptions;
create policy sub_select on subscriptions
  for select using (
    org_id in (
      select org_id from memberships
      where user_id = (select auth.uid()) and role = 'owner'
    )
  );

-- ── 4. Split FOR ALL write policies ──────────────────────

-- EMPLOYEES
drop policy if exists emp_write on employees;
create policy emp_insert on employees
  for insert with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and dept_id in (select visible_department_ids()))
  );
create policy emp_update on employees
  for update using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and dept_id in (select visible_department_ids()))
  )
  with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and dept_id in (select visible_department_ids()))
  );
create policy emp_delete on employees
  for delete using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and dept_id in (select visible_department_ids()))
  );

-- SCHEDULE_ENTRIES
drop policy if exists sched_write on schedule_entries;
create policy sched_insert on schedule_entries
  for insert with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and employee_id in (
        select e.id from employees e where e.dept_id in (select visible_department_ids())
      )
    )
  );
create policy sched_update on schedule_entries
  for update using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and employee_id in (
        select e.id from employees e where e.dept_id in (select visible_department_ids())
      )
    )
  )
  with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and employee_id in (
        select e.id from employees e where e.dept_id in (select visible_department_ids())
      )
    )
  );
create policy sched_delete on schedule_entries
  for delete using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (
      auth_has_role(org_id, array['manager']::user_role[])
      and employee_id in (
        select e.id from employees e where e.dept_id in (select visible_department_ids())
      )
    )
  );

-- STATUS_TYPES
drop policy if exists status_write on status_types;
create policy status_insert on status_types
  for insert with check (org_id is not null and auth_has_role(org_id, array['owner','admin']::user_role[]));
create policy status_update on status_types
  for update using (org_id is not null and auth_has_role(org_id, array['owner','admin']::user_role[]))
  with check (org_id is not null and auth_has_role(org_id, array['owner','admin']::user_role[]));
create policy status_delete on status_types
  for delete using (org_id is not null and auth_has_role(org_id, array['owner','admin']::user_role[]));

-- ALERT_CONFIGS
drop policy if exists alert_write on alert_configs;
create policy alert_insert on alert_configs
  for insert with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and department_id in (select visible_department_ids()))
  );
create policy alert_update on alert_configs
  for update using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and department_id in (select visible_department_ids()))
  )
  with check (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and department_id in (select visible_department_ids()))
  );
create policy alert_delete on alert_configs
  for delete using (
    auth_has_role(org_id, array['owner','admin']::user_role[])
    or (auth_has_role(org_id, array['manager']::user_role[]) and department_id in (select visible_department_ids()))
  );

-- DEPARTMENTS
drop policy if exists dept_write on departments;
create policy dept_insert on departments
  for insert with check (auth_has_role(org_id, array['owner','admin']::user_role[]));
create policy dept_update on departments
  for update using (auth_has_role(org_id, array['owner','admin']::user_role[]))
  with check (auth_has_role(org_id, array['owner','admin']::user_role[]));
create policy dept_delete on departments
  for delete using (auth_has_role(org_id, array['owner','admin']::user_role[]));

-- MANAGER_DEPARTMENTS
drop policy if exists mgr_dept_write on manager_departments;
create policy mgr_dept_insert on manager_departments
  for insert with check (
    exists (
      select 1 from departments d
      where d.id = department_id and auth_has_role(d.org_id, array['owner','admin']::user_role[])
    )
  );
create policy mgr_dept_delete on manager_departments
  for delete using (
    exists (
      select 1 from departments d
      where d.id = department_id and auth_has_role(d.org_id, array['owner','admin']::user_role[])
    )
  );

-- ── 5. Author FKs: survivable user deletion + indexes ────

alter table schedule_entries
  drop constraint if exists schedule_entries_created_by_fkey,
  add constraint schedule_entries_created_by_fkey
    foreign key (created_by) references auth.users(id) on delete set null;

alter table schedule_entries
  drop constraint if exists schedule_entries_updated_by_fkey,
  add constraint schedule_entries_updated_by_fkey
    foreign key (updated_by) references auth.users(id) on delete set null;

create index if not exists idx_schedule_created_by on schedule_entries(created_by);
create index if not exists idx_schedule_updated_by on schedule_entries(updated_by);
