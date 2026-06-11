-- ─────────────────────────────────────────────────────────
-- Cross-org integrity + schedule visibility fix
--
-- 1. sched_select hid entries of employees without a department even from
--    owner/admin (emp_select treats dept_id IS NULL as org-visible; the
--    schedule policy must mirror that).
-- 2. FKs allowed cross-org references: an entry in org A could point to an
--    employee of org B (and could squat org B's (employee, date) slots via
--    the unique constraint). Composite FKs pin children to the parent org.
-- 3. schedule_entries.status_id must be a system status or a status of the
--    same org (composite FK cannot express the OR → trigger check).
-- ─────────────────────────────────────────────────────────

-- ── 1. Schedule visibility for deptless employees ────────

drop policy if exists sched_select on schedule_entries;
create policy sched_select on schedule_entries
  for select using (
    org_id in (select auth_org_ids())
    and employee_id in (
      select e.id from employees e
      where e.dept_id is null or e.dept_id in (select visible_department_ids())
    )
  );

-- ── 2. Composite FKs: children stay inside the parent org ──

alter table departments
  add constraint departments_id_org_unique unique (id, org_id);

alter table employees
  add constraint employees_id_org_unique unique (id, org_id);

-- employees.dept_id → department of the SAME org
alter table employees
  drop constraint if exists employees_dept_id_fkey,
  add constraint employees_dept_id_fkey
    foreign key (dept_id, org_id) references departments(id, org_id) on delete set null (dept_id);

-- schedule_entries.employee_id → employee of the SAME org
alter table schedule_entries
  drop constraint if exists schedule_entries_employee_id_fkey,
  add constraint schedule_entries_employee_id_fkey
    foreign key (employee_id, org_id) references employees(id, org_id) on delete cascade;

-- alert_configs.department_id → department of the SAME org
alter table alert_configs
  drop constraint if exists alert_configs_department_id_fkey,
  add constraint alert_configs_department_id_fkey
    foreign key (department_id, org_id) references departments(id, org_id) on delete cascade;

-- departments.parent_id → parent department of the SAME org
alter table departments
  drop constraint if exists departments_parent_id_fkey,
  add constraint departments_parent_id_fkey
    foreign key (parent_id, org_id) references departments(id, org_id) on delete set null (parent_id);

-- ── 3. Entry status: system or same-org ──────────────────

create or replace function check_entry_status_org()
returns trigger language plpgsql
set search_path = public
as $$
declare
  v_status_org uuid;
begin
  select org_id into v_status_org from status_types where id = new.status_id;
  if not found then
    raise exception 'status_not_found';
  end if;
  if v_status_org is not null and v_status_org <> new.org_id then
    raise exception 'status_wrong_org';
  end if;
  return new;
end;
$$;

revoke execute on function check_entry_status_org() from public, anon, authenticated;

drop trigger if exists trg_sched_status_org on schedule_entries;
create trigger trg_sched_status_org
  before insert or update of status_id on schedule_entries
  for each row execute function check_entry_status_org();
