-- INSERT ... RETURNING на departments падал для owner/admin: dept_select
-- проверял новую строку через visible_department_ids(), которая сканирует
-- departments в снапшоте стейтмента и ещё не видит вставляемую строку.
-- Для org-уровневых ролей проверяем по org_id без скана departments;
-- менеджеры остаются на точечной выдаче своих отделов.

drop policy if exists dept_select on departments;
create policy dept_select on departments
  for select using (
    auth_has_role(org_id, array['owner','admin','viewer']::user_role[])
    or id in (select visible_department_ids())
  );
