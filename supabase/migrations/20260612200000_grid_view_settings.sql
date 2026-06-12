-- Правка 2: сохраняемый «Вид» грида (решение основателя 2026-06-12).
-- Один вид на организацию: тумблеры «Отображения» + визуалы карточек статусов
-- (формат CustomCellConfig демо). Системные status_types не трогаем — их
-- переопределения живут в settings.cardVisuals по id статуса.

create table if not exists grid_view_settings (
  org_id     uuid primary key references organizations(id) on delete cascade,
  settings   jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  -- защита от раздувания jsonb произвольным клиентом (сервер валидирует Zod-ом,
  -- но fail-closed и на уровне БД)
  constraint grid_view_settings_size check (pg_column_size(settings) < 65536)
);

alter table grid_view_settings enable row level security;

-- Читают все члены организации: вид общий, viewer видит как настроено.
create policy gvs_select on grid_view_settings
  for select using (org_id in (select auth_org_ids()));

-- Настраивают owner/admin/manager («менеджер или владелец» — решение основателя).
create policy gvs_insert on grid_view_settings
  for insert with check (auth_has_role(org_id, array['owner','admin','manager']::user_role[]));

create policy gvs_update on grid_view_settings
  for update using (auth_has_role(org_id, array['owner','admin','manager']::user_role[]))
  with check (auth_has_role(org_id, array['owner','admin','manager']::user_role[]));

create policy gvs_delete on grid_view_settings
  for delete using (auth_has_role(org_id, array['owner','admin']::user_role[]));
