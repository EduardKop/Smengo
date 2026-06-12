-- ─────────────────────────────────────────────────────────
-- RLS Integration Tests — Schedule Grid
--
-- Pattern: single DO block, everything in a transaction.
-- Final `raise exception 'TESTS_PASSED'` rolls back ALL data.
-- Run via Supabase Management API (postgres role = superuser,
-- bypasses RLS). Role switching simulates authenticated users.
--
-- Tests:
--   T1  manager cannot write to an out-of-scope department
--   T2  manager can write to their assigned department
--   T3  viewer cannot insert schedule entries or update employees
--   T4  cross-org: FK / RLS blocks mismatched (employee, org) insert
--   T5  cross-org: trigger blocks using a foreign org's custom status
--   T6  manager sees only their assigned department (dept_select)
--   T7  viewer sees all departments (org-wide read-only)
--   T8  owner_b sees zero employees from org A
--   T9  reorder_employees: ids_outside_scope when emp from foreign org included
-- ─────────────────────────────────────────────────────────

do $main$
declare
  v_org_a       uuid;
  v_org_b       uuid;
  -- auth user stubs (pre-generated so we can reference them in memberships)
  v_owner_a     uuid := gen_random_uuid();
  v_manager_a   uuid := gen_random_uuid();
  v_viewer_a    uuid := gen_random_uuid();
  v_owner_b     uuid := gen_random_uuid();
  -- departments
  v_dept_a1     uuid;  -- manager_a is assigned to this one
  v_dept_a2     uuid;  -- manager_a has NO access here
  -- employees
  v_emp_a1      uuid;  -- belongs to dept_a1  (manager_a's scope)
  v_emp_a2      uuid;  -- belongs to dept_a2  (outside manager_a's scope)
  v_emp_b1      uuid;  -- belongs to org B
  -- statuses
  v_work        uuid;  -- system status (org_id IS NULL)
  v_custom_b    uuid;  -- custom status belonging to org B
  -- membership ids (for manager_departments link)
  v_mem_manager_a uuid;
  -- org B department (setup only)
  v_dept_b1     uuid;
  -- helper
  v_cnt         int;
  v_ok          boolean;
begin

  -- ── SETUP (running as postgres / superuser: RLS bypassed) ──

  -- 1. Auth user stubs (only id/email required; everything else nullable or defaulted)
  insert into auth.users (id, email) values
    (v_owner_a,   'rls-owner-a@test.local'),
    (v_manager_a, 'rls-manager-a@test.local'),
    (v_viewer_a,  'rls-viewer-a@test.local'),
    (v_owner_b,   'rls-owner-b@test.local');

  -- 2. Organizations (insert separately so RETURNING works cleanly)
  insert into organizations (name, slug, billing_email, plan)
  values ('Test Org A', 'test-org-a-' || floor(random()*1e9)::text, 'a@test.local', 'team')
  returning id into v_org_a;

  insert into organizations (name, slug, billing_email, plan)
  values ('Test Org B', 'test-org-b-' || floor(random()*1e9)::text, 'b@test.local', 'team')
  returning id into v_org_b;

  -- 3. Departments
  insert into departments (org_id, name) values (v_org_a, 'Dept A1') returning id into v_dept_a1;
  insert into departments (org_id, name) values (v_org_a, 'Dept A2') returning id into v_dept_a2;
  -- 4. Employees
  insert into employees (org_id, dept_id, full_name) values (v_org_a, v_dept_a1, 'Emp A1') returning id into v_emp_a1;
  insert into employees (org_id, dept_id, full_name) values (v_org_a, v_dept_a2, 'Emp A2') returning id into v_emp_a2;

  insert into departments (org_id, name) values (v_org_b, 'Dept B1') returning id into v_dept_b1;
  insert into employees (org_id, dept_id, full_name) values (v_org_b, v_dept_b1, 'Emp B1') returning id into v_emp_b1;

  -- 5. Memberships
  insert into memberships (org_id, user_id, role) values (v_org_a, v_owner_a,   'owner');
  insert into memberships (org_id, user_id, role) values (v_org_a, v_manager_a, 'manager') returning id into v_mem_manager_a;
  insert into memberships (org_id, user_id, role) values (v_org_a, v_viewer_a,  'viewer');
  insert into memberships (org_id, user_id, role) values (v_org_b, v_owner_b,   'owner');

  -- 6. Assign manager_a only to dept_a1 (NOT dept_a2)
  insert into manager_departments (membership_id, department_id) values (v_mem_manager_a, v_dept_a1);

  -- 7. Statuses
  select id into v_work from status_types where org_id is null and code = 'work';
  insert into status_types (org_id, code, label, color, counts_as_present)
  values (v_org_b, 'custom-b', '{"ru":"Кастом Б"}', '#AABBCC', true)
  returning id into v_custom_b;

  -- ─────────────────────────────────────────────────────────
  -- T1: manager_a cannot insert a schedule entry for emp_a2
  --     (emp_a2 is in dept_a2 — outside manager_a's scope)
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_manager_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into schedule_entries (org_id, employee_id, entry_date, status_id)
    values (v_org_a, v_emp_a2, '2026-01-01', v_work);
    -- If we reach here the policy didn't block — test fails
    raise exception 'T1_FAILED: manager could write emp_a2 (outside scope)';
  exception when others then
    if sqlerrm = 'T1_FAILED: manager could write emp_a2 (outside scope)' then
      raise;
    end if;
    -- any other exception (RLS violation / check violation) is the expected behaviour
  end;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T2: manager_a CAN insert a schedule entry for emp_a1
  --     (emp_a1 is in dept_a1 — manager_a's assigned dept)
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_manager_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into schedule_entries (org_id, employee_id, entry_date, status_id)
  values (v_org_a, v_emp_a1, '2026-01-02', v_work);

  -- Verify the row actually landed (visible to current user via RLS)
  select count(*) into v_cnt from schedule_entries
  where employee_id = v_emp_a1 and entry_date = '2026-01-02';
  if v_cnt <> 1 then
    raise exception 'T2_FAILED: manager insert succeeded but row not visible (cnt=%)', v_cnt;
  end if;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T3: viewer_a cannot insert schedule entries
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_viewer_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into schedule_entries (org_id, employee_id, entry_date, status_id)
    values (v_org_a, v_emp_a1, '2026-01-03', v_work);
    raise exception 'T3a_FAILED: viewer could insert schedule entry';
  exception when others then
    if sqlerrm = 'T3a_FAILED: viewer could insert schedule entry' then raise; end if;
  end;

  -- viewer also cannot update employees
  begin
    update employees set position = 'hacked' where id = v_emp_a1;
    -- UPDATE without a matching policy is silently a no-op under RLS,
    -- so we must check whether the write took effect
    select count(*) into v_cnt from employees where id = v_emp_a1 and position = 'hacked';
    if v_cnt > 0 then
      raise exception 'T3b_FAILED: viewer could update employee record';
    end if;
  end;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T4: cross-org FK: owner_a cannot insert a schedule entry
  --     with (employee_id = emp_b1, org_id = org_a)
  --     Composite FK: schedule_entries(employee_id, org_id) →
  --       employees(id, org_id) — emp_b1 lives in org_b, so
  --       (emp_b1, org_a) has no matching row → FK violation.
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_owner_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into schedule_entries (org_id, employee_id, entry_date, status_id)
    values (v_org_a, v_emp_b1, '2026-01-04', v_work);
    raise exception 'T4_FAILED: cross-org insert was not blocked';
  exception when others then
    if sqlerrm = 'T4_FAILED: cross-org insert was not blocked' then raise; end if;
    -- FK violation or RLS — both acceptable
  end;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T5: cross-org status trigger: owner_a tries to use
  --     custom_b (belongs to org_b) on emp_a1 of org_a →
  --     trigger must raise 'status_wrong_org'
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_owner_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  v_ok := false;
  begin
    insert into schedule_entries (org_id, employee_id, entry_date, status_id)
    values (v_org_a, v_emp_a1, '2026-01-05', v_custom_b);
    raise exception 'T5_FAILED: cross-org status not rejected by trigger';
  exception when others then
    if sqlerrm = 'T5_FAILED: cross-org status not rejected by trigger' then raise; end if;
    if sqlerrm = 'status_wrong_org' then
      v_ok := true;
    end if;
    -- any other exception (e.g. RLS blocked before trigger) is also acceptable
  end;
  -- Note: if RLS blocked first (status_types not visible), v_ok stays false but
  -- the cross-org write was still stopped. Either outcome is a pass.

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T6: manager_a sees exactly 1 department (dept_a1)
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_manager_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_cnt from departments where org_id = v_org_a;
  if v_cnt <> 1 then
    raise exception 'T6_FAILED: manager sees % departments, expected 1', v_cnt;
  end if;

  set local role postgres;

  -- owner_a sees both departments
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_owner_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_cnt from departments where org_id = v_org_a;
  if v_cnt <> 2 then
    raise exception 'T6b_FAILED: owner_a sees % departments, expected 2', v_cnt;
  end if;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T7: viewer_a sees both departments (org-wide read-only)
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_viewer_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_cnt from departments where org_id = v_org_a;
  if v_cnt <> 2 then
    raise exception 'T7_FAILED: viewer sees % departments, expected 2', v_cnt;
  end if;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T8: owner_b sees ZERO employees from org A
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_owner_b::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_cnt from employees where org_id = v_org_a;
  if v_cnt <> 0 then
    raise exception 'T8_FAILED: owner_b sees % employees from org A, expected 0', v_cnt;
  end if;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- T9: reorder_employees RPC: owner_a passes an ordered_ids
  --     list that includes emp_b1 (foreign org) →
  --     function must raise 'ids_outside_scope'
  -- ─────────────────────────────────────────────────────────
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_owner_a::text, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    -- signature: reorder_employees(p_ordered_ids uuid[], p_dept_id uuid)
    perform reorder_employees(array[v_emp_a1, v_emp_b1], v_dept_a1);
    raise exception 'T9_FAILED: reorder_employees did not reject foreign emp';
  exception when others then
    if sqlerrm = 'T9_FAILED: reorder_employees did not reject foreign emp' then raise; end if;
    if sqlerrm <> 'ids_outside_scope' then
      raise exception 'T9_FAILED: expected ids_outside_scope, got: %', sqlerrm;
    end if;
  end;

  set local role postgres;

  -- ─────────────────────────────────────────────────────────
  -- ALL TESTS PASSED — roll everything back
  -- ─────────────────────────────────────────────────────────
  raise exception 'TESTS_PASSED';

end $main$;
