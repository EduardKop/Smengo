-- Атомарный reorder сотрудников внутри отдела.
-- SECURITY INVOKER: выполняется под RLS вызывающего — emp_update политика остаётся финальной защитой.
-- Проверяет, что ВСЕ переданные id принадлежат org вызывающего и указанному отделу, иначе отклоняет весь батч.

create or replace function reorder_employees(p_dept_id uuid, p_ordered_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_expected int := array_length(p_ordered_ids, 1);
  v_actual int;
begin
  if v_expected is null or v_expected = 0 then
    raise exception 'empty_list';
  end if;

  select count(*) into v_actual
  from employees e
  where e.id = any(p_ordered_ids)
    and e.deleted_at is null
    and e.dept_id is not distinct from p_dept_id
    and e.org_id in (select org_id from memberships where user_id = auth.uid());

  if v_actual <> v_expected then
    raise exception 'ids_outside_scope';
  end if;

  update employees e
  set sort_order = u.ord
  from unnest(p_ordered_ids) with ordinality as u(id, ord)
  where e.id = u.id;
end;
$$;

revoke execute on function reorder_employees(uuid, uuid[]) from public, anon;
grant execute on function reorder_employees(uuid, uuid[]) to authenticated;
