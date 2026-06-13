-- ─────────────────────────────────────────────────────────
-- Правка 6: лого организации + аватары пользователей (профилей).
--
-- organizations.logo_url и profiles.avatar_url хранят ПУТЬ в приватном
-- бакете (не URL) — клиент получает signed URL на сервере, как у фото
-- сотрудников (см. 20260612210000_employee_avatars.sql).
--   org-logos:        org_id/<ts>.<ext>   — читают члены, пишет owner
--   profile-avatars:  user_id/<ts>.<ext>  — все операции только своя папка
-- ─────────────────────────────────────────────────────────

alter table organizations add column if not exists logo_url text;

-- org_update (RLS) уже owner-only; колоночный grant дополняем logo_url
grant update (logo_url) on organizations to authenticated;

-- ── Бакет лого организаций ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'org-logos',
  'org-logos',
  false,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Чтение: любой член организации (первый сегмент пути — org_id)
drop policy if exists org_logos_select on storage.objects;
create policy org_logos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid())
    )
  );

-- Запись/замена/удаление: только owner (зеркало org_update)
drop policy if exists org_logos_insert on storage.objects;
create policy org_logos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid()) and m.role = 'owner'
    )
  );

drop policy if exists org_logos_update on storage.objects;
create policy org_logos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid()) and m.role = 'owner'
    )
  )
  with check (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid()) and m.role = 'owner'
    )
  );

drop policy if exists org_logos_delete on storage.objects;
create policy org_logos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] in (
      select m.org_id::text from public.memberships m
      where m.user_id = (select auth.uid()) and m.role = 'owner'
    )
  );

-- ── Бакет аватаров пользователей ──────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Все операции — только своя папка (первый сегмент пути = auth.uid())
drop policy if exists profile_avatars_select on storage.objects;
create policy profile_avatars_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists profile_avatars_insert on storage.objects;
create policy profile_avatars_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists profile_avatars_update on storage.objects;
create policy profile_avatars_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists profile_avatars_delete on storage.objects;
create policy profile_avatars_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
