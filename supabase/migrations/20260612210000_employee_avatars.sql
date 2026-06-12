-- ─────────────────────────────────────────────────────────
-- Фото сотрудников: employees.avatar_url + Storage-бакет employee-avatars
--
-- В avatar_url хранится ПУТЬ в бакете (org_id/employee_id/<ts>.<ext>),
-- не URL: бакет приватный, клиент получает batch signed URLs при загрузке
-- месяца. Первый сегмент пути — org_id, на нём держатся все политики.
-- ─────────────────────────────────────────────────────────

alter table employees add column if not exists avatar_url text;

-- Приватный бакет; лимиты размера/MIME дублируют серверную валидацию
-- upload-экшена — защита и от запросов в Storage API мимо экшена.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'employee-avatars',
  'employee-avatars',
  false,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ── RLS на storage.objects ────────────────────────────────
-- Сравнение текст-к-тексту (без ::uuid-каста пути — кривой путь не должен
-- ронять запрос ошибкой каста). Подзапрос к memberships идёт под RLS
-- (mem_select показывает членства своих организаций, включая собственное).

-- Чтение (signed URL = select): любой член организации
drop policy if exists emp_avatars_select on storage.objects;
create policy emp_avatars_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'employee-avatars'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid())
    )
  );

-- Запись: роли с правом crud_employees (точечный контроль — в server action)
drop policy if exists emp_avatars_insert on storage.objects;
create policy emp_avatars_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'employee-avatars'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'manager')
    )
  );

drop policy if exists emp_avatars_update on storage.objects;
create policy emp_avatars_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'employee-avatars'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'manager')
    )
  )
  with check (
    bucket_id = 'employee-avatars'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'manager')
    )
  );

drop policy if exists emp_avatars_delete on storage.objects;
create policy emp_avatars_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'employee-avatars'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'manager')
    )
  );
