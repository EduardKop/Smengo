# Правка 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Онбординг в стиле 7shifts (+team_size, +лого), Дашборд→График в меню и редирект на график, bulk-добавление сотрудников таблицей, чистка низа сайдбара, публикация графика с помесячным состоянием в БД.

**Architecture:** Спека `docs/superpowers/specs/2026-06-13-pravka7-onboarding-bulk-publish-design.md`. Всё в продукт-зоне Next.js App Router; новая БД-поверхность: `organizations.team_size`, `schedule_publications`, `schedule_change_marks` (+триггер на schedule_entries). Server actions по образцу `lib/actions/employees.ts` (getActionContext + assertCan + RLS как финальный рубеж).

**Tech Stack:** Next.js 16 / React / Tailwind v4 / Supabase (RLS, Storage) / Zod / vitest.

---

### Task 1: Миграция БД + типы

**Files:**
- Create: `supabase/migrations/20260613120000_team_size_publications.sql`
- Modify: `supabase/types.ts` (регенерация)

- [ ] **Step 1: написать миграцию**

```sql
-- Правка 7: team_size на онбординге + публикация графика по месяцам.

alter table organizations add column if not exists team_size text;
grant update (team_size) on organizations to authenticated;

-- ── Публикации графика (org + месяц) ─────────────────────
create table if not exists schedule_publications (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organizations(id) on delete cascade,
  month        date not null, -- первое число месяца
  published_by uuid not null references profiles(id),
  notify       boolean not null default false,
  published_at timestamptz not null default now()
);
create index if not exists idx_publications_org_month
  on schedule_publications (org_id, month, published_at desc);
alter table schedule_publications enable row level security;

drop policy if exists pub_select on schedule_publications;
create policy pub_select on schedule_publications
  for select using (org_id in (select auth_org_ids()));

drop policy if exists pub_insert on schedule_publications;
create policy pub_insert on schedule_publications
  for insert with check (
    auth_has_role(org_id, array['owner','admin','manager']::user_role[])
    and published_by = auth.uid()
  );

-- ── Метки «в месяце были правки» ──────────────────────────
-- max(updated_at) по entries не ловит удаления — поэтому метка триггером.
create table if not exists schedule_change_marks (
  org_id         uuid not null references organizations(id) on delete cascade,
  month          date not null,
  last_change_at timestamptz not null default now(),
  primary key (org_id, month)
);
alter table schedule_change_marks enable row level security;

drop policy if exists marks_select on schedule_change_marks;
create policy marks_select on schedule_change_marks
  for select using (org_id in (select auth_org_ids()));
-- insert/update/delete политики НЕ создаём: пишет только триггерная
-- SECURITY DEFINER-функция, прямые записи клиентов RLS отвергает.

create or replace function touch_schedule_change_mark()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  r := coalesce(new, old);
  insert into schedule_change_marks (org_id, month, last_change_at)
  values (r.org_id, date_trunc('month', r.entry_date)::date, now())
  on conflict (org_id, month) do update set last_change_at = now();
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_schedule_change_mark on schedule_entries;
create trigger trg_schedule_change_mark
  after insert or update or delete on schedule_entries
  for each row execute function touch_schedule_change_mark();
```

- [ ] **Step 2:** `supabase db push` → `Finished supabase db push.`
- [ ] **Step 3:** `supabase gen types typescript --linked > supabase/types.ts` + вернуть в конец алиасы UserRole/SubscriptionStatus/PlanTier (блок `// ─── App-friendly aliases…`).
- [ ] **Step 4:** `npx tsc --noEmit` чисто (вне `.next/`); commit `feat(db): team_size + schedule_publications + change-marks триггер`.

### Task 2: Zod bulk-схема + тест

**Files:**
- Create: `lib/validation/bulk-employees.ts`
- Test: `lib/validation/bulk-employees.test.ts`

- [ ] **Step 1: тест (падает)**

```ts
import { describe, expect, it } from 'vitest'
import { BulkEmployeesSchema } from './bulk-employees'

describe('BulkEmployeesSchema', () => {
  it('принимает строки с именем, отбрасывая пустые поля в null', () => {
    const res = BulkEmployeesSchema.safeParse({ rows: [
      { full_name: ' Анна Ковальчук ', department_id: null, position: '', email: '', phone: '' },
    ] })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.rows[0].full_name).toBe('Анна Ковальчук')
      expect(res.data.rows[0].email).toBeNull()
    }
  })
  it('отклоняет пустое имя и кривой email с индексом строки', () => {
    const res = BulkEmployeesSchema.safeParse({ rows: [
      { full_name: '', department_id: null, position: '', email: '', phone: '' },
      { full_name: 'Ок', department_id: null, position: '', email: 'не-почта', phone: '' },
    ] })
    expect(res.success).toBe(false)
  })
  it('отклоняет больше 100 строк за раз', () => {
    const rows = Array.from({ length: 101 }, () => ({ full_name: 'X', department_id: null, position: '', email: '', phone: '' }))
    expect(BulkEmployeesSchema.safeParse({ rows }).success).toBe(false)
  })
})
```

- [ ] **Step 2:** `npx vitest run lib/validation/bulk-employees.test.ts` → FAIL (module not found)
- [ ] **Step 3: реализация**

```ts
import { z } from 'zod'

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)

export const BulkEmployeeRowSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  department_id: z.preprocess(emptyToNull, z.string().uuid().nullable()),
  position: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  email: z.preprocess(emptyToNull, z.string().trim().email().max(255).nullable()),
  phone: z.preprocess(emptyToNull, z.string().trim().max(32).nullable()),
})

export const BulkEmployeesSchema = z.object({
  rows: z.array(BulkEmployeeRowSchema).min(1).max(100),
})

export type BulkEmployeeRow = z.infer<typeof BulkEmployeeRowSchema>
```

- [ ] **Step 4:** тест PASS; commit `feat(employees): Zod-схема bulk-добавления`.

### Task 3: bulkCreateEmployeesAction

**Files:**
- Modify: `lib/actions/employees.ts` (рядом с createEmployeeAction; переиспользовать его проверку лимита плана — найти и вынести/повторить логику подсчёта)

- [ ] **Step 1: action**

```ts
export type BulkCreateResult =
  | { ok: true; created: number }
  | { ok: false; error: string }

export async function bulkCreateEmployeesAction(input: unknown): Promise<BulkCreateResult> {
  const parsed = BulkEmployeesSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try { assertCan(ctx.role, 'crud_employees') } catch { return { ok: false, error: 'forbidden' } }

  // лимит плана на ВСЮ пачку (как в createEmployeeAction, но +N)
  // <использовать тот же подсчёт активных сотрудников и PLAN_LIMITS>
  // если (count + rows.length) > limit → { ok:false, error:'plan_limit' }

  // department_id всех строк обязан принадлежать org (один запрос in())
  const deptIds = [...new Set(parsed.data.rows.map(r => r.department_id).filter(Boolean))] as string[]
  if (deptIds.length) {
    const { data: depts } = await ctx.supabase.from('departments')
      .select('id').eq('org_id', ctx.orgId).in('id', deptIds)
    if ((depts?.length ?? 0) !== deptIds.length) return { ok: false, error: 'invalid_reference' }
  }

  const { error } = await ctx.supabase.from('employees').insert(
    parsed.data.rows.map((r) => ({
      org_id: ctx.orgId,
      full_name: r.full_name,
      department_id: r.department_id,
      position: r.position,
      email: r.email,
      phone: r.phone,
    })),
  )
  if (error) return { ok: false, error: toClientError(error) }
  revalidatePath('/schedule'); revalidatePath('/employees')
  return { ok: true, created: parsed.data.rows.length }
}
```

- [ ] **Step 2:** tsc чисто; commit `feat(employees): bulkCreateEmployeesAction с серверным лимитом плана`.

### Task 4: Модалка-таблица bulk-добавления

**Files:**
- Create: `components/schedule/bulk-employee-modal.tsx`
- Modify: `components/schedule/grid.tsx` (кнопка «+ Сотрудник» и ghost-строка открывают bulk; одиночная модалка остаётся для редактирования)
- Modify: `messages/{ru,uk,en}.json` (`app.schedule.bulkAdd.*`)

- [ ] **Step 1:** компонент: модалка по образцу существующих (`.smengo-pop`/EmployeeModal-стили), шапка «Добавить сотрудников», таблица `Имя* · Отдел · Должность · Email · Телефон`, state `rows: BulkRowDraft[]` (3 пустых), автодобавление строки при вводе имени в последней, кнопка удаления строки (Trash2, видна при >1), футер: Cancel + «Добавить N» (N = строки с именем; disabled при 0/isPending). preselectedDeptId prop. Ошибки сервера — строкой над футером.
- [ ] **Step 2:** подключить в grid.tsx: state `bulkModalOpen/{deptId}`, заменить открытие EmployeeModal на create → bulk (edit не трогать). После успеха — invalidate месяца (как делает существующий onSaved у EmployeeModal).
- [ ] **Step 3:** i18n ru/uk/en: title, colName, colDept, colPosition, colEmail, colPhone, addRow, addN (с {count}), noDept, cancel, errorLimit, errorGeneric.
- [ ] **Step 4:** tsc/eslint; живая проверка в превью (3 сотрудника за раз, откат); commit `feat(employees): bulk-добавление таблицей как в 7shifts`.

### Task 5: Публикация — серверная часть

**Files:**
- Create: `lib/actions/schedule-publish.ts`
- Modify: `lib/schedule/fetch-month.ts` (+`lastChangeAt`, `lastPublishedAt` в MonthData), `lib/schedule/types.ts`

- [ ] **Step 1: action**

```ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'

const PublishSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-01$/), // YYYY-MM-01
  notify: z.boolean(),
})

export type PublishResult = { ok: true; publishedAt: string } | { ok: false; error: string }

export async function publishScheduleAction(input: { month: string; notify: boolean }): Promise<PublishResult> {
  const parsed = PublishSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try { assertCan(ctx.role, 'edit_schedule') } catch { return { ok: false, error: 'forbidden' } }

  const { data, error } = await ctx.supabase
    .from('schedule_publications')
    .insert({ org_id: ctx.orgId, month: parsed.data.month, notify: parsed.data.notify, published_by: ctx.userId })
    .select('published_at')
    .single()
  if (error || !data) return { ok: false, error: 'publish_failed' }
  revalidatePath('/schedule')
  return { ok: true, publishedAt: data.published_at }
}
```

- [ ] **Step 2:** fetch-month: двумя лёгкими запросами (maybeSingle) добрать
  `schedule_change_marks.last_change_at` за месяц и последнюю `schedule_publications.published_at`;
  прокинуть в `MonthData` как `lastChangeAt: string | null`, `lastPublishedAt: string | null`.
- [ ] **Step 3:** tsc; commit `feat(schedule): publishScheduleAction + dirty-состояние месяца в fetchMonthData`.

### Task 6: Кнопка «Опубликовать график» + диалог

**Files:**
- Create: `components/schedule/publish-button.tsx`
- Modify: `components/schedule/grid.tsx` (тулбар; локальный `dirtySinceMutation` после успешного upsert/clear), `messages/{ru,uk,en}.json` (`app.schedule.publish.*`)

- [ ] **Step 1:** компонент: видим если `canEdit && (serverDirty || localDirty)`;
  `serverDirty = lastChangeAt && (!lastPublishedAt || lastChangeAt > lastPublishedAt)`.
  Кнопка акцентная с иконкой Send «Опубликовать график» → поповер/модалка: радио
  «Уведомить всех»/«Не уведомлять» (default уведомить), кнопка «Опубликовать» (isPending spinner)
  → `publishScheduleAction({month: 'YYYY-MM-01', notify})` → success: тост (useToasts грида),
  локально `published=true` (кнопка гаснет до следующей правки).
- [ ] **Step 2:** grid.tsx: пробросить `lastChangeAt/lastPublishedAt` из initialData/query;
  после успешной мутации ячейки — `setLocalDirty(true)`; после публикации — сброс.
- [ ] **Step 3:** i18n: button, dialogTitle, notifyAll, notifyNone, publishNow, success, error.
- [ ] **Step 4:** живой E2E в превью (правка → кнопка → публикация → кнопка гаснет; insert виден в БД); commit `feat(schedule): кнопка публикации графика с выбором нотификации`.

### Task 7: Онбординг-редизайн

**Files:**
- Modify: `components/onboarding/create-org-form.tsx`, `app/(app)/onboarding/page.tsx`,
  `lib/actions/org.ts` (createOrgAction: +team_size update, +logo upload после RPC),
  `messages/{ru,uk,en}.json` (`auth.onboarding.*`)

- [ ] **Step 1:** page: split-layout — слева панель `hidden lg:flex` (bg-background, SmengoMark 48,
  3 строчки value-props с галочками: «14 дней бесплатно», «Отмена в любой момент», «Карта не нужна»),
  справа форма (max-w-lg по центру). Заголовок «Пара минут — и вы в приложении» + подзаголовок.
- [ ] **Step 2:** форма: + чипы `team_size` (`1-15 | 16-50 | 51-150 | 150+`, radio-кнопки в стиле
  mode-switcher, опционально) и аватар компании (кружок-превью + «Загрузить», клиентское сжатие
  `compressAvatarImage`, файл держим в state и шлём в FormData createOrgAction).
- [ ] **Step 3:** `createOrgAction`: после успешного RPC — если есть `team_size`, `update organizations set team_size` (RLS owner ✓); если есть файл — sniffImageMime + upload в `org-logos` + `update logo_url` (повторить паттерн uploadOrgLogoAction; org_id известен из RPC-результата/куки).
- [ ] **Step 4:** i18n ru/uk/en: teamSizeLabel, teamSize1, teamSize2, teamSize3, teamSize4, logoLabel, logoUpload, headline, subheadline, vp1, vp2, vp3.
- [ ] **Step 5:** живой E2E: пройти онбординг новым тест-юзером нельзя (нет второй сессии) — проверить рендер формы скриншотом + tsc/vitest; commit `feat(onboarding): экран компании в стиле 7shifts (+team_size, +лого)`.

### Task 8: Меню, редирект, низ сайдбара

**Files:**
- Modify: `app/(app)/(shell)/layout.tsx` (порядок navItems: dashboard, schedule, employees),
  `lib/supabase/middleware.ts` (login/register authed-redirect `/dashboard` → `/schedule`),
  `components/app/sidebar.tsx` (низ: остаётся только LocaleSwitcher),
  плюс greps: `grep -rn "'/dashboard'" app lib components` — все послелогинные редиректы → `/schedule` (onboarding-редирект не трогать).

- [ ] **Step 1:** navItems порядок + редиректы + чистка низа сайдбара (удалить email/роль, ThemeToggle, форму logout; LocaleSwitcher остаётся в `expandedText`-блоке).
- [ ] **Step 2:** tsc/eslint; превью: рейка (порядок иконок), логин-редирект руками не проверить (сессия уже есть) — проверить middleware-ветку юнитом глаз; commit `feat(shell): Дашборд→График в меню, редирект после логина на график, чистка низа сайдбара`.

### Task 9: Верификация + журнал

- [ ] tsc, eslint (изменённые файлы), `npx vitest run` (все), `npm run build`.
- [ ] Живой прогон в превью: bulk-добавление + публикация + меню/сайдбар + онбординг-рендер; тестовые данные откатить (созданных сотрудников удалить, публикации — оставить можно: тест-орг).
- [ ] ROADMAP.md: строка «Правка 7» в журнал; commit `docs(roadmap): журнал правки 7`.

## Self-review

- Покрытие спеки: онбординг (T7), меню/редирект (T8), bulk (T2–T4), сайдбар (T8), публикация (T1, T5, T6) — всё закрыто; тесты в T2, T9.
- Типы согласованы: BulkEmployeesSchema (T2) используется в T3; MonthData.lastChangeAt/lastPublishedAt (T5) — в T6.
- Плейсхолдеров «TBD» нет; в T3 ссылка на существующую проверку лимита createEmployeeAction — исполнителю нужно её прочитать перед реализацией (файл указан).
