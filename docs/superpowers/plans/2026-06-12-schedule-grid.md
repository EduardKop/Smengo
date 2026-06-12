# Schedule Grid (Этап 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Рабочий грид смен на реальных данных Supabase в `/schedule`, визуально идентичный демо-гриду лендинга.

**Architecture:** Подход B из спеки `docs/superpowers/specs/2026-06-12-schedule-grid-design.md`: новые модульные компоненты `components/schedule/*`, данные через TanStack Query (месяц одним набором запросов → `Map<employeeId, Map<dateISO, Entry>>`), optimistic upsert через server actions, RLS как финальная защита. Демо `components/marketing/grid-preview.tsx` НЕ трогаем — это дизайн-спека (цвета статусов: `statusColor()` строка 4959; compact-режим: строка 6502; detail/extended: строка 5428; бейджи: строка 1558).

**Tech Stack:** Next.js 16 App Router, TypeScript strict, @tanstack/react-query v5, @tanstack/react-virtual v3, @dnd-kit, Zod v4, Supabase (@supabase/ssr), vitest.

**Правила для исполнителя:**
- После КАЖДОЙ задачи: `npx tsc --noEmit && npx vitest run` — зелёные, потом коммит.
- Никаких `any`. Типы БД — из `@/supabase/types`.
- Все строки UI — через next-intl: ключи добавлять в `messages/ru.json`, `messages/uk.json`, `messages/en.json` одновременно (namespace `app.schedule.*`, `app.employees.*`). В коде задач ключи указаны.
- Дизайн-токены из демо, не хардкод HEX в компонентах (исключение — маппинг цветов статусов из БД, они приходят данными).
- Сервер-экшены: всегда `getActionContext()` → проверка роли `assertCan` → Zod parse → запрос под RLS.

---

### Task 1: Зависимости и QueryProvider

**Files:**
- Modify: `package.json` (через npm install)
- Create: `components/providers/query-provider.tsx`
- Modify: `app/(app)/(shell)/layout.tsx`

- [ ] **Step 1: Установить зависимости**

```bash
npm install @tanstack/react-query@^5 @tanstack/react-virtual@^3 @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Создать QueryProvider**

`components/providers/query-provider.tsx`:

```tsx
'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
          },
        },
      }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

- [ ] **Step 3: Обернуть shell-layout**

В `app/(app)/(shell)/layout.tsx` импортировать `QueryProvider` и обернуть `{children}` внутри `<main>`:

```tsx
import { QueryProvider } from '@/components/providers/query-provider'
// ...
<main className="flex-1 px-4 py-6 sm:px-8">
  <QueryProvider>{children}</QueryProvider>
</main>
```

- [ ] **Step 4: Проверка и коммит**

Run: `npx tsc --noEmit && npm run build 2>&1 | tail -3`
Expected: без ошибок.

```bash
git add package.json package-lock.json components/providers/query-provider.tsx "app/(app)/(shell)/layout.tsx"
git commit -m "feat(schedule): tanstack query + dnd-kit deps, QueryProvider in shell"
```

---

### Task 2: Миграция employment_kind

**Files:**
- Create: `supabase/migrations/20260612120000_employment_kind.sql`
- Modify: `supabase/types.ts` (regen)

- [ ] **Step 1: Написать миграцию**

```sql
-- Бейдж «стажёр / штатный» из демо-дизайна (вкладка «Сотрудники», ячейки extended)
alter table employees
  add column if not exists employment_kind text not null default 'staff'
  check (employment_kind in ('staff', 'trainee'));
```

- [ ] **Step 2: Применить и перегенерировать типы**

```bash
supabase db push
supabase gen types typescript --linked > /tmp/types_new.ts
cat >> /tmp/types_new.ts <<'EOF'

// ─── App-friendly aliases (preserve existing imports) ───────────────────────
export type UserRole = Database['public']['Enums']['user_role']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
export type PlanTier = Database['public']['Enums']['plan_tier']
EOF
cp /tmp/types_new.ts supabase/types.ts
```

- [ ] **Step 3: Проверка и коммит**

Run: `grep -c employment_kind supabase/types.ts` → Expected: `>= 3`; затем `npx tsc --noEmit` → чисто.

```bash
git add supabase/migrations/20260612120000_employment_kind.sql supabase/types.ts
git commit -m "feat(db): employees.employment_kind (staff|trainee)"
```

---

### Task 3: Хелперы месяца (TDD)

**Files:**
- Create: `lib/schedule/types.ts`
- Create: `lib/schedule/month.ts`
- Test: `lib/schedule/month.test.ts`

- [ ] **Step 1: Создать общие типы**

`lib/schedule/types.ts`:

```ts
import type { Database } from '@/supabase/types'

export type EmployeeRow = Database['public']['Tables']['employees']['Row']
export type DepartmentRow = Database['public']['Tables']['departments']['Row']
export type StatusTypeRow = Database['public']['Tables']['status_types']['Row']
export type ScheduleEntryRow = Database['public']['Tables']['schedule_entries']['Row']

export type GridMode = 'compact' | 'detail' | 'extended'

/** employeeId -> dateISO (YYYY-MM-DD) -> entry */
export type ScheduleMap = Map<string, Map<string, ScheduleEntryRow>>

export interface MonthData {
  employees: EmployeeRow[]
  departments: DepartmentRow[]
  statusTypes: StatusTypeRow[]
  entries: ScheduleEntryRow[]
}
```

- [ ] **Step 2: Написать падающие тесты**

`lib/schedule/month.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { monthDays, monthKey, monthRange, todayISOInTz } from './month'

describe('monthDays', () => {
  it('returns 31 days for July 2026 with correct weekdays', () => {
    const days = monthDays(2026, 7)
    expect(days).toHaveLength(31)
    expect(days[0]).toEqual({ dateISO: '2026-07-01', day: 1, weekday: 3, isWeekend: false }) // среда
    expect(days[3].isWeekend).toBe(true) // 4 июля 2026 — суббота
  })

  it('handles February non-leap (2026) and leap (2028)', () => {
    expect(monthDays(2026, 2)).toHaveLength(28)
    expect(monthDays(2028, 2)).toHaveLength(29)
  })
})

describe('monthKey / monthRange', () => {
  it('formats key and inclusive range', () => {
    expect(monthKey(2026, 6)).toBe('2026-06')
    expect(monthRange(2026, 6)).toEqual({ from: '2026-06-01', to: '2026-06-30' })
  })
})

describe('todayISOInTz', () => {
  it('respects timezone across midnight', () => {
    // 2026-06-12T23:30:00Z = 13 июня 02:30 в Киеве (UTC+3 летом)
    const ref = new Date('2026-06-12T23:30:00Z')
    expect(todayISOInTz('Europe/Kyiv', ref)).toBe('2026-06-13')
    expect(todayISOInTz('UTC', ref)).toBe('2026-06-12')
  })
})
```

- [ ] **Step 3: Запустить — убедиться, что падают**

Run: `npx vitest run lib/schedule/month.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 4: Реализация**

`lib/schedule/month.ts`:

```ts
export interface MonthDay {
  dateISO: string
  day: number
  /** 0 = понедельник … 6 = воскресенье */
  weekday: number
  isWeekend: boolean
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`
}

export function monthDays(year: number, month: number): MonthDay[] {
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return Array.from({ length: count }, (_, i) => {
    const day = i + 1
    const jsDow = new Date(Date.UTC(year, month - 1, day)).getUTCDay() // 0=вс
    const weekday = (jsDow + 6) % 7 // 0=пн
    return {
      dateISO: `${year}-${pad(month)}-${pad(day)}`,
      day,
      weekday,
      isWeekend: weekday >= 5,
    }
  })
}

export function monthRange(year: number, month: number): { from: string; to: string } {
  const days = monthDays(year, month)
  return { from: days[0].dateISO, to: days[days.length - 1].dateISO }
}

/** Дата «сегодня» в таймзоне организации, формат YYYY-MM-DD. */
export function todayISOInTz(timeZone: string, reference = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(reference)
}
```

- [ ] **Step 5: Тесты зелёные → коммит**

Run: `npx vitest run lib/schedule/month.test.ts` → Expected: PASS (5 tests).

```bash
git add lib/schedule/types.ts lib/schedule/month.ts lib/schedule/month.test.ts
git commit -m "feat(schedule): month helpers with org-timezone today (TDD)"
```

---

### Task 4: ScheduleMap и покрытие (TDD)

**Files:**
- Create: `lib/schedule/map.ts`
- Test: `lib/schedule/map.test.ts`

- [ ] **Step 1: Падающие тесты**

`lib/schedule/map.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildScheduleMap, coverageByDay } from './map'
import type { ScheduleEntryRow, EmployeeRow, StatusTypeRow } from './types'

const entry = (over: Partial<ScheduleEntryRow>): ScheduleEntryRow =>
  ({
    id: 'e1', org_id: 'org1', employee_id: 'emp1', entry_date: '2026-06-01',
    status_id: 'work', note: null, created_by: null, updated_by: null,
    created_at: '', updated_at: '', start_time: null, end_time: null,
    ...over,
  }) as ScheduleEntryRow

const emp = (id: string, dept: string | null): EmployeeRow =>
  ({ id, org_id: 'org1', dept_id: dept, full_name: id, position: null, sort_order: 0,
     deleted_at: null, created_at: '', updated_at: '', phone: null, telegram: null,
     email: null, birth_date: null, hired_on: null, note: null, employment_kind: 'staff',
  }) as EmployeeRow

const status = (id: string, present: boolean): StatusTypeRow =>
  ({ id, org_id: null, code: id, label: {}, color: '#000', counts_as_present: present,
     is_system: true, sort_order: 0, created_at: '', start_time: null, end_time: null,
  }) as StatusTypeRow

describe('buildScheduleMap', () => {
  it('maps employee -> date -> entry', () => {
    const m = buildScheduleMap([
      entry({ id: 'a', employee_id: 'emp1', entry_date: '2026-06-01' }),
      entry({ id: 'b', employee_id: 'emp1', entry_date: '2026-06-02' }),
      entry({ id: 'c', employee_id: 'emp2', entry_date: '2026-06-01' }),
    ])
    expect(m.get('emp1')?.get('2026-06-01')?.id).toBe('a')
    expect(m.get('emp1')?.size).toBe(2)
    expect(m.get('emp2')?.size).toBe(1)
    expect(m.get('missing')).toBeUndefined()
  })
})

describe('coverageByDay', () => {
  const employees = [emp('emp1', 'd1'), emp('emp2', 'd1'), emp('emp3', 'd2')]
  const statuses = [status('work', true), status('vacation', false)]
  const entries = [
    entry({ employee_id: 'emp1', entry_date: '2026-06-01', status_id: 'work' }),
    entry({ employee_id: 'emp2', entry_date: '2026-06-01', status_id: 'vacation' }),
    entry({ employee_id: 'emp3', entry_date: '2026-06-01', status_id: 'work' }),
  ]

  it('counts only counts_as_present, scoped to department', () => {
    const all = coverageByDay(entries, employees, statuses, null)
    expect(all.get('2026-06-01')).toBe(2) // emp1 + emp3
    const d1 = coverageByDay(entries, employees, statuses, 'd1')
    expect(d1.get('2026-06-01')).toBe(1) // только emp1
  })
})
```

- [ ] **Step 2: Запустить — FAIL** — `npx vitest run lib/schedule/map.test.ts`

- [ ] **Step 3: Реализация**

`lib/schedule/map.ts`:

```ts
import type { EmployeeRow, ScheduleEntryRow, ScheduleMap, StatusTypeRow } from './types'

export function buildScheduleMap(entries: ScheduleEntryRow[]): ScheduleMap {
  const map: ScheduleMap = new Map()
  for (const e of entries) {
    let byDate = map.get(e.employee_id)
    if (!byDate) {
      byDate = new Map()
      map.set(e.employee_id, byDate)
    }
    byDate.set(e.entry_date, e)
  }
  return map
}

/** dateISO -> сколько людей counts_as_present в этот день (опционально в рамках отдела). */
export function coverageByDay(
  entries: ScheduleEntryRow[],
  employees: EmployeeRow[],
  statusTypes: StatusTypeRow[],
  deptId: string | null,
): Map<string, number> {
  const presentStatus = new Set(statusTypes.filter((s) => s.counts_as_present).map((s) => s.id))
  const scopeEmp = new Set(
    employees.filter((e) => deptId === null || e.dept_id === deptId).map((e) => e.id),
  )
  const out = new Map<string, number>()
  for (const e of entries) {
    if (!presentStatus.has(e.status_id) || !scopeEmp.has(e.employee_id)) continue
    out.set(e.entry_date, (out.get(e.entry_date) ?? 0) + 1)
  }
  return out
}
```

- [ ] **Step 4: PASS → коммит**

```bash
git add lib/schedule/map.ts lib/schedule/map.test.ts
git commit -m "feat(schedule): schedule map + coverage calc (TDD)"
```

---

### Task 5: Zod-схемы (TDD)

**Files:**
- Create: `lib/validation/schedule.ts`
- Test: `lib/validation/schedule.test.ts`

- [ ] **Step 1: Падающие тесты**

`lib/validation/schedule.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { UpsertEntrySchema, DepartmentSchema, EmployeeSchema, ReorderSchema } from './schedule'

describe('UpsertEntrySchema', () => {
  const valid = {
    employee_id: '0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0001',
    entry_date: '2026-06-15',
    status_id: '0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0002',
    start_time: '22:00',
    end_time: '06:00',
    note: '',
  }
  it('accepts night shift (end < start)', () => {
    expect(UpsertEntrySchema.safeParse(valid).success).toBe(true)
  })
  it('rejects bad date and bad time', () => {
    expect(UpsertEntrySchema.safeParse({ ...valid, entry_date: '15.06.2026' }).success).toBe(false)
    expect(UpsertEntrySchema.safeParse({ ...valid, start_time: '25:00' }).success).toBe(false)
  })
  it('allows null times', () => {
    expect(UpsertEntrySchema.safeParse({ ...valid, start_time: null, end_time: null }).success).toBe(true)
  })
})

describe('EmployeeSchema', () => {
  it('requires full_name >= 2, validates employment_kind', () => {
    expect(EmployeeSchema.safeParse({ full_name: 'Анна Ким', employment_kind: 'trainee' }).success).toBe(true)
    expect(EmployeeSchema.safeParse({ full_name: 'A', employment_kind: 'staff' }).success).toBe(false)
    expect(EmployeeSchema.safeParse({ full_name: 'Анна Ким', employment_kind: 'boss' }).success).toBe(false)
  })
})

describe('DepartmentSchema / ReorderSchema', () => {
  it('validates name and uuid list', () => {
    expect(DepartmentSchema.safeParse({ name: 'Кухня' }).success).toBe(true)
    expect(DepartmentSchema.safeParse({ name: '' }).success).toBe(false)
    expect(ReorderSchema.safeParse({ dept_id: null, ordered_ids: ['0b9e9a40-93f9-4df3-9e6c-3a0a2f9a0001'] }).success).toBe(true)
  })
})
```

- [ ] **Step 2: FAIL** — `npx vitest run lib/validation/schedule.test.ts`

- [ ] **Step 3: Реализация**

`lib/validation/schedule.ts`:

```ts
import { z } from 'zod'

const DateISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Формат даты: YYYY-MM-DD' })
const TimeHM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Формат времени: HH:MM' })

export const UpsertEntrySchema = z.object({
  employee_id: z.string().uuid(),
  entry_date: DateISO,
  status_id: z.string().uuid(),
  start_time: TimeHM.nullable().optional(),
  end_time: TimeHM.nullable().optional(),
  note: z.string().max(500).trim().optional().or(z.literal('')),
})

export const ClearEntrySchema = z.object({
  employee_id: z.string().uuid(),
  entry_date: DateISO,
})

export const DepartmentSchema = z.object({
  name: z.string().min(1, { message: 'Укажите название' }).max(80).trim(),
})

export const EmployeeSchema = z.object({
  full_name: z.string().min(2, { message: 'Минимум 2 символа' }).max(120).trim(),
  position: z.string().max(80).trim().optional().or(z.literal('')),
  dept_id: z.string().uuid().nullable().optional(),
  employment_kind: z.enum(['staff', 'trainee']).default('staff'),
  phone: z.string().max(30).trim().optional().or(z.literal('')),
  telegram: z.string().max(60).trim().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  birth_date: DateISO.nullable().optional(),
  hired_on: DateISO.nullable().optional(),
})

export const ReorderSchema = z.object({
  dept_id: z.string().uuid().nullable(),
  ordered_ids: z.array(z.string().uuid()).min(1).max(500),
})
```

Замечание: в тестах статус-id `'work'` из Task 4 — это юнит-моки, тут UUID обязателен (реальные id).

- [ ] **Step 4: PASS → коммит**

```bash
git add lib/validation/schedule.ts lib/validation/schedule.test.ts
git commit -m "feat(schedule): zod schemas for entries/departments/employees (TDD)"
```

---

### Task 6: getActionContext — общий контекст server actions

**Files:**
- Create: `lib/actions/context.ts`

- [ ] **Step 1: Реализация**

`lib/actions/context.ts`:

```ts
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/supabase/types'

export interface ActionContext {
  supabase: SupabaseClient<Database>
  userId: string
  orgId: string
  role: UserRole
}

export type ActionContextResult =
  | { ok: true; ctx: ActionContext }
  | { ok: false; error: 'unauthorized' | 'no_org' }

/** Аутентификация + активная организация + роль. RLS остаётся финальной защитой. */
export async function getActionContext(): Promise<ActionContextResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  const cookieStore = await cookies()
  const orgId = cookieStore.get('active_org_id')?.value
  if (!orgId) return { ok: false, error: 'no_org' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) return { ok: false, error: 'unauthorized' }

  return { ok: true, ctx: { supabase, userId: user.id, orgId, role: membership.role } }
}
```

- [ ] **Step 2: Проверка и коммит**

Run: `npx tsc --noEmit` → чисто.

```bash
git add lib/actions/context.ts
git commit -m "feat(actions): shared getActionContext (auth + org + role)"
```

---

### Task 7: Server actions — отделы

**Files:**
- Create: `lib/actions/departments.ts`

- [ ] **Step 1: Реализация**

`lib/actions/departments.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { DepartmentSchema } from '@/lib/validation/schedule'

export type DeptActionResult = { ok: true; id?: string } | { ok: false; error: string }

export async function createDepartmentAction(formData: FormData): Promise<DeptActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'manage_departments')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = DepartmentSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const { data, error } = await ctx.supabase
    .from('departments')
    .insert({ org_id: ctx.orgId, name: parsed.data.name })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.message }

  revalidatePath('/schedule')
  return { ok: true, id: data.id }
}

export async function renameDepartmentAction(deptId: string, formData: FormData): Promise<DeptActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'manage_departments')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = DepartmentSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const { error } = await ctx.supabase
    .from('departments')
    .update({ name: parsed.data.name })
    .eq('id', deptId)
    .eq('org_id', ctx.orgId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/schedule')
  return { ok: true }
}

export async function deleteDepartmentAction(deptId: string): Promise<DeptActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'manage_departments')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  // Сотрудники отдела не удаляются: FK dept_id → on delete set null (уже в схеме БД)
  const { error } = await ctx.supabase
    .from('departments')
    .delete()
    .eq('id', deptId)
    .eq('org_id', ctx.orgId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/schedule')
  return { ok: true }
}
```

- [ ] **Step 2: Проверка и коммит**

Run: `npx tsc --noEmit && npx vitest run` → чисто/зелёные.

```bash
git add lib/actions/departments.ts
git commit -m "feat(schedule): department CRUD server actions"
```

---

### Task 8: Server actions — сотрудники (+ лимит плана, reorder)

**Files:**
- Create: `lib/actions/employees.ts`

- [ ] **Step 1: Реализация**

`lib/actions/employees.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { checkPlanLimit } from '@/lib/billing/limits'
import { EmployeeSchema, ReorderSchema } from '@/lib/validation/schedule'

export type EmpActionResult = { ok: true; id?: string } | { ok: false; error: string }

function parseEmployee(formData: FormData) {
  return EmployeeSchema.safeParse({
    full_name: formData.get('full_name'),
    position: formData.get('position') ?? '',
    dept_id: formData.get('dept_id') || null,
    employment_kind: formData.get('employment_kind') ?? 'staff',
    phone: formData.get('phone') ?? '',
    telegram: formData.get('telegram') ?? '',
    email: formData.get('email') ?? '',
    birth_date: formData.get('birth_date') || null,
    hired_on: formData.get('hired_on') || null,
  })
}

export async function createEmployeeAction(formData: FormData): Promise<EmpActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'crud_employees')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = parseEmployee(formData)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  // Финальная проверка лимита плана — на сервере
  const { data: org } = await ctx.supabase
    .from('organizations').select('plan').eq('id', ctx.orgId).single()
  const limit = await checkPlanLimit(ctx.supabase, ctx.orgId, org?.plan ?? 'start', 'employees')
  if (!limit.allowed) return { ok: false, error: 'plan_limit_employees' }

  // sort_order = в конец своего отдела
  const { count } = await ctx.supabase
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', ctx.orgId)
    .is('deleted_at', null)

  const d = parsed.data
  const { data, error } = await ctx.supabase
    .from('employees')
    .insert({
      org_id: ctx.orgId,
      full_name: d.full_name,
      position: d.position || null,
      dept_id: d.dept_id ?? null,
      employment_kind: d.employment_kind,
      phone: d.phone || null,
      telegram: d.telegram || null,
      email: d.email || null,
      birth_date: d.birth_date ?? null,
      hired_on: d.hired_on ?? null,
      sort_order: (count ?? 0) + 1,
    })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.message }

  revalidatePath('/schedule')
  return { ok: true, id: data.id }
}

export async function updateEmployeeAction(employeeId: string, formData: FormData): Promise<EmpActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'crud_employees')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = parseEmployee(formData)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const d = parsed.data
  const { error } = await ctx.supabase
    .from('employees')
    .update({
      full_name: d.full_name,
      position: d.position || null,
      dept_id: d.dept_id ?? null,
      employment_kind: d.employment_kind,
      phone: d.phone || null,
      telegram: d.telegram || null,
      email: d.email || null,
      birth_date: d.birth_date ?? null,
      hired_on: d.hired_on ?? null,
    })
    .eq('id', employeeId)
    .eq('org_id', ctx.orgId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/schedule')
  return { ok: true }
}

export async function softDeleteEmployeeAction(employeeId: string): Promise<EmpActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'crud_employees')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const { error } = await ctx.supabase
    .from('employees')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', employeeId)
    .eq('org_id', ctx.orgId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/schedule')
  return { ok: true }
}

export async function reorderEmployeesAction(input: { dept_id: string | null; ordered_ids: string[] }): Promise<EmpActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'crud_employees')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = ReorderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  // Последовательные update под RLS; порядок — позиция в массиве
  for (let i = 0; i < parsed.data.ordered_ids.length; i++) {
    const { error } = await ctx.supabase
      .from('employees')
      .update({ sort_order: i + 1 })
      .eq('id', parsed.data.ordered_ids[i])
      .eq('org_id', ctx.orgId)
    if (error) return { ok: false, error: error.message }
  }

  revalidatePath('/schedule')
  return { ok: true }
}
```

- [ ] **Step 2: Проверка и коммит**

```bash
npx tsc --noEmit && npx vitest run
git add lib/actions/employees.ts
git commit -m "feat(schedule): employee CRUD + reorder + plan limit server actions"
```

---

### Task 9: Server actions — записи графика

**Files:**
- Create: `lib/actions/schedule.ts`

- [ ] **Step 1: Реализация**

`lib/actions/schedule.ts`:

```ts
'use server'

import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { UpsertEntrySchema, ClearEntrySchema } from '@/lib/validation/schedule'

export type EntryActionResult = { ok: true } | { ok: false; error: string }

export async function upsertEntryAction(input: {
  employee_id: string
  entry_date: string
  status_id: string
  start_time?: string | null
  end_time?: string | null
  note?: string
}): Promise<EntryActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'edit_schedule')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = UpsertEntrySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const d = parsed.data
  // Уникальность (employee_id, entry_date) — в БД; RLS дорежет чужие отделы/org
  const { error } = await ctx.supabase
    .from('schedule_entries')
    .upsert(
      {
        org_id: ctx.orgId,
        employee_id: d.employee_id,
        entry_date: d.entry_date,
        status_id: d.status_id,
        start_time: d.start_time ?? null,
        end_time: d.end_time ?? null,
        note: d.note || null,
      },
      { onConflict: 'employee_id,entry_date' },
    )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function clearEntryAction(input: { employee_id: string; entry_date: string }): Promise<EntryActionResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'edit_schedule')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const parsed = ClearEntrySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const { error } = await ctx.supabase
    .from('schedule_entries')
    .delete()
    .eq('org_id', ctx.orgId)
    .eq('employee_id', parsed.data.employee_id)
    .eq('entry_date', parsed.data.entry_date)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
```

Замечание: `revalidatePath` тут НЕ зовём — клиент работает через TanStack Query (optimistic + invalidate), серверный рефетч страницы не нужен на каждый клик.

- [ ] **Step 2: Проверка и коммит**

```bash
npx tsc --noEmit && npx vitest run
git add lib/actions/schedule.ts
git commit -m "feat(schedule): upsert/clear entry server actions"
```

---

### Task 10: SSR-страница + клиентский хук данных

**Files:**
- Modify: `app/(app)/(shell)/schedule/page.tsx` (заменить заглушку)
- Create: `components/schedule/use-schedule.ts`

- [ ] **Step 1: SSR-страница**

`app/(app)/(shell)/schedule/page.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getAppContext } from '@/lib/auth/context'
import { monthRange, todayISOInTz } from '@/lib/schedule/month'
import { ScheduleGrid } from '@/components/schedule/grid'
import type { MonthData } from '@/lib/schedule/types'

interface PageProps {
  searchParams: Promise<{ m?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const ctx = await getAppContext()
  const t = await getTranslations('app.schedule')
  const supabase = await createClient()

  const { m } = await searchParams
  const today = todayISOInTz(ctx.org.timezone ?? 'Europe/Kyiv')
  const [yearStr, monthStr] = (m ?? today.slice(0, 7)).split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const { from, to } = monthRange(year, month)

  const [employees, departments, statusTypes, entries] = await Promise.all([
    supabase.from('employees').select('*').is('deleted_at', null)
      .order('dept_id').order('sort_order'),
    supabase.from('departments').select('*').order('name'),
    supabase.from('status_types').select('*').order('sort_order'),
    supabase.from('schedule_entries').select('*')
      .gte('entry_date', from).lte('entry_date', to),
  ])

  const initialData: MonthData = {
    employees: employees.data ?? [],
    departments: departments.data ?? [],
    statusTypes: statusTypes.data ?? [],
    entries: entries.data ?? [],
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold text-foreground">{t('title')}</h1>
      <ScheduleGrid
        orgId={ctx.org.id}
        role={ctx.role}
        isReadOnly={ctx.isReadOnly}
        year={year}
        month={month}
        today={today}
        initialData={initialData}
      />
    </>
  )
}
```

Примечание: `getAppContext()` нужно расширить полем `org.timezone` — добавить `timezone` в select и интерфейс `AppContext` в `lib/auth/context.ts` (модификация: `organizations(id, name, plan, trial_ends_at, timezone)`).

- [ ] **Step 2: Хук данных + optimistic мутация**

`components/schedule/use-schedule.ts`:

```ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { upsertEntryAction, clearEntryAction } from '@/lib/actions/schedule'
import { monthRange, monthKey } from '@/lib/schedule/month'
import type { MonthData, ScheduleEntryRow } from '@/lib/schedule/types'

export function scheduleKey(orgId: string, year: number, month: number) {
  return ['schedule', orgId, monthKey(year, month)] as const
}

export function useScheduleData(orgId: string, year: number, month: number, initialData: MonthData) {
  return useQuery({
    queryKey: scheduleKey(orgId, year, month),
    initialData,
    queryFn: async (): Promise<MonthData> => {
      const supabase = createClient()
      const { from, to } = monthRange(year, month)
      const [employees, departments, statusTypes, entries] = await Promise.all([
        supabase.from('employees').select('*').is('deleted_at', null).order('dept_id').order('sort_order'),
        supabase.from('departments').select('*').order('name'),
        supabase.from('status_types').select('*').order('sort_order'),
        supabase.from('schedule_entries').select('*').gte('entry_date', from).lte('entry_date', to),
      ])
      return {
        employees: employees.data ?? [],
        departments: departments.data ?? [],
        statusTypes: statusTypes.data ?? [],
        entries: entries.data ?? [],
      }
    },
  })
}

export interface UpsertInput {
  employee_id: string
  entry_date: string
  status_id: string
  start_time?: string | null
  end_time?: string | null
}

export function useUpsertEntry(orgId: string, year: number, month: number) {
  const qc = useQueryClient()
  const key = scheduleKey(orgId, year, month)

  return useMutation({
    mutationFn: async (input: UpsertInput) => {
      const res = await upsertEntryAction(input)
      if (!res.ok) throw new Error(res.error)
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MonthData>(key)
      if (prev) {
        const optimistic: ScheduleEntryRow = {
          ...(prev.entries.find(
            (e) => e.employee_id === input.employee_id && e.entry_date === input.entry_date,
          ) ?? ({
            id: `optimistic-${input.employee_id}-${input.entry_date}`,
            org_id: orgId, note: null, created_by: null, updated_by: null,
            created_at: '', updated_at: '',
          } as ScheduleEntryRow)),
          employee_id: input.employee_id,
          entry_date: input.entry_date,
          status_id: input.status_id,
          start_time: input.start_time ?? null,
          end_time: input.end_time ?? null,
        }
        qc.setQueryData<MonthData>(key, {
          ...prev,
          entries: [
            ...prev.entries.filter(
              (e) => !(e.employee_id === input.employee_id && e.entry_date === input.entry_date),
            ),
            optimistic,
          ],
        })
      }
      return { prev }
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useClearEntry(orgId: string, year: number, month: number) {
  const qc = useQueryClient()
  const key = scheduleKey(orgId, year, month)
  return useMutation({
    mutationFn: async (input: { employee_id: string; entry_date: string }) => {
      const res = await clearEntryAction(input)
      if (!res.ok) throw new Error(res.error)
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<MonthData>(key)
      if (prev) {
        qc.setQueryData<MonthData>(key, {
          ...prev,
          entries: prev.entries.filter(
            (e) => !(e.employee_id === input.employee_id && e.entry_date === input.entry_date),
          ),
        })
      }
      return { prev }
    },
    onError: (_e, _i, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
```

- [ ] **Step 3: Заглушка ScheduleGrid, чтобы собрать**

Создать `components/schedule/grid.tsx` с минимальным клиентским компонентом, принимающим пропсы из Step 1 и рендерящим `<div>grid placeholder</div>` (полная реализация — Task 11). Это позволяет закоммитить связку SSR+hook зелёной.

- [ ] **Step 4: Расширить getAppContext таймзоной** — в `lib/auth/context.ts` добавить `timezone` в select организации и в интерфейс `AppContext['org']`.

- [ ] **Step 5: i18n** — добавить в `messages/{ru,uk,en}.json` ключи (если их нет): `app.schedule.title` уже есть с этапа 0.

- [ ] **Step 6: Проверка и коммит**

```bash
npx tsc --noEmit && npx vitest run && npm run build 2>&1 | tail -3
git add "app/(app)/(shell)/schedule/page.tsx" components/schedule/ lib/auth/context.ts
git commit -m "feat(schedule): SSR month load + query hook with optimistic upsert"
```

---

### Task 11: Каркас грида — группы отделов, virtual rows, шапка дней

**Files:**
- Modify: `components/schedule/grid.tsx` (заменить заглушку)
- Create: `components/schedule/grid-header.tsx`

Реализовать клиентский контейнер:

- [ ] **Step 1:** `grid.tsx`: состояние из URL search params (`useSearchParams` + `useRouter.replace`): `m` (месяц), `dept`, `q` (поиск), `mode` (compact|detail|extended, default detail). Данные — `useScheduleData`, маппинг `buildScheduleMap`, покрытие `coverageByDay`.
- [ ] **Step 2:** Группировка: сотрудники по `dept_id` (отделы по `name`), группа «Без отдела» (`dept_id IS NULL`) — в конце, видна только когда есть такие сотрудники. Каждая группа сворачиваемая (локальный `useState<Set<deptId>>`).
- [ ] **Step 3:** Виртуализация строк: `useVirtualizer` из `@tanstack/react-virtual` по плоскому списку строк (заголовки групп + сотрудники), `estimateSize` по режиму (compact 36px / detail 52px / extended 84px — сверить с демо), `overscan: 10`. Горизонтальный скролл дней — общий контейнер, первая колонка сотрудника sticky слева (как в демо).
- [ ] **Step 4:** `grid-header.tsx`: строка дней месяца (`monthDays`): номер + день недели, выходные подсвечены, «сегодня» — кольцо-маркер (стиль из демо). Шапка sticky сверху.
- [ ] **Step 5:** Проверка в превью: `/schedule` рендерит шапку и пустые строки на тестовой организации. Коммит:

```bash
git add components/schedule/
git commit -m "feat(schedule): grid skeleton — dept groups, virtual rows, day header"
```

---

### Task 12: Ячейка — три режима по дизайну демо

**Files:**
- Create: `components/schedule/grid-cell.tsx`
- Create: `components/schedule/status-style.ts`

- [ ] **Step 1:** `status-style.ts`: функция `statusStyle(status: StatusTypeRow, isWeekend: boolean): { bg: string; fg: string }`. Источник дизайна — `statusColor()` в `components/marketing/grid-preview.tsx:4959-5074`: открыть, перенести логику цветов (системные коды work/vacation/sick/dayoff/late мапятся на те же цвета демо; кастомные статусы — `color` из БД + вычисление контрастного fg). Цвета системных статусов уже совпадают с демо (сидированы из тех же значений: work #3B9B7F и т.д.) — использовать `status.color` напрямую + альфа-фоны как в демо.
- [ ] **Step 2:** `grid-cell.tsx`: рендер по режиму:
  - **compact:** квадрат-чип с однобуквенным кодом статуса (первая буква label в локали), фон по статусу — образец: `CompactGrid` в `grid-preview.tsx:6502+`;
  - **detail:** чип со временем смены (`start–end`, если задано) и подписью статуса — образец: `grid-preview.tsx:5428+`;
  - **extended:** ячейка с временем, длительностью в часах (расчёт с учётом ночной смены через полночь: `(end - start + 24h) % 24h`) и бейджем — образец бейджей: `grid-preview.tsx:1558+`.
  - Пустая ячейка: едва заметный фон, hover-плюс. Выходной — затемнение фона колонки.
- [ ] **Step 3:** Юнит-тест на расчёт длительности (ночная смена 22:00–06:00 → 8ч) в `components/schedule/duration.test.ts` (функцию `shiftDurationHours(start, end)` положить в `lib/schedule/month.ts`).
- [ ] **Step 4:** Сверка с демо: открыть превью бок о бок — `/ru` (лендинг, секция грида) и `/schedule`, прогнать три режима, скриншоты. Расхождения цветов/радиусов/типографики — исправить.
- [ ] **Step 5:** Коммит: `git commit -m "feat(schedule): grid cell — compact/detail/extended modes per demo design"`

---

### Task 13: Редактор ячейки + optimistic мутации

**Files:**
- Create: `components/schedule/cell-editor.tsx`

- [ ] **Step 1:** Поповер при клике на ячейку (если `!isReadOnly` и роль может писать): список статусов (системные + кастомные, цветные чипы), пресеты «Утро / Вечер / Ночь» (из `status_types.start_time/end_time` системного «work»; дефолты: 08:00–16:00 / 16:00–00:00 / 00:00–08:00 — взять точные из демо `grid-preview.tsx` `shiftMorning/shiftEvening/shiftNight`), два time-инпута для ручного времени, кнопка «Очистить».
- [ ] **Step 2:** Подключить `useUpsertEntry` / `useClearEntry`. Закрытие по Escape/клику вне. Ошибка мутации — тост (использовать существующий паттерн тостов демо или простой aria-live блок).
- [ ] **Step 3:** Клавиатура: ячейки фокусируемы, Enter открывает редактор (a11y минимум).
- [ ] **Step 4:** E2E в превью: проставить 3 разных статуса, перезагрузить страницу — записи на месте (реально в БД); отключить сеть (devtools offline) — мутация откатывается с тостом.
- [ ] **Step 5:** Коммит: `git commit -m "feat(schedule): cell editor with shift presets and optimistic mutations"`

---

### Task 14: Строка покрытия и пороги

**Files:**
- Create: `components/schedule/coverage-row.tsx`
- Create: `components/schedule/settings/alerts-form.tsx`
- Create: `lib/actions/alerts.ts`

- [ ] **Step 1:** `coverage-row.tsx`: под шапкой дней, для активного фильтра отдела: `coverageByDay` против `alert_configs.min_present` отдела; день с дефицитом — красная подсветка колонки + бейдж «−N» (стиль: демо `coverageSummary`/`shortageBadge`).
- [ ] **Step 2:** `lib/actions/alerts.ts`: `upsertAlertConfigAction(dept_id, min_present)` — `assertCan(role, 'manage_alerts')`, Zod `z.number().int().min(0).max(500)`, upsert по `(org_id, department_id)`.
- [ ] **Step 3:** `alerts-form.tsx`: в настройках грида (шестерёнка) — список отделов с числовым инпутом порога.
- [ ] **Step 4:** Юнит-тест дефицита: porog 3, present 1 → дефицит 2 (логика в `lib/schedule/map.ts`, функция `shortageByDay(coverage, minPresent)`).
- [ ] **Step 5:** Проверка в превью + коммит: `git commit -m "feat(schedule): coverage row with per-dept thresholds"`

---

### Task 15: Навигация, фильтры, режимы, легенда

**Files:**
- Create: `components/schedule/month-nav.tsx`, `components/schedule/dept-filter.tsx`, `components/schedule/mode-switcher.tsx`, `components/schedule/legend.tsx`

- [ ] **Step 1:** `month-nav.tsx`: стрелки ←/→ и подпись месяца в локали (`Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })`); пишет `?m=YYYY-MM` в URL (replace, не push).
- [ ] **Step 2:** `dept-filter.tsx`: селект «Все отделы» + список; пишет `?dept=`. `mode-switcher.tsx`: три кнопки-сегмента; пишет `?mode=`. Поиск по имени — инпут с дебаунсом 200мс, `?q=`.
- [ ] **Step 3:** `legend.tsx`: чипы всех статусов с цветами (как в демо легенда внизу грида).
- [ ] **Step 4:** Тулбар собрать в `grid.tsx` в один ряд по демо-макету (режимы слева, месяц по центру, фильтр/поиск/экспорт-заглушки справа — кнопки «Экспорт» НЕТ, она в мини-этапе 1.5).
- [ ] **Step 5:** Проверка: URL `?m=2026-07&dept=X&mode=compact&q=ан` — состояние восстанавливается по ссылке. Коммит: `git commit -m "feat(schedule): month nav, filters, mode switcher, legend (URL state)"`

---

### Task 16: Быстрый старт (пустое состояние)

**Files:**
- Create: `components/schedule/quick-start.tsx`

- [ ] **Step 1:** Если `departments.length === 0 && employees.length === 0` — вместо грида три шага с CTA: «1. Создайте отдел» (открывает модалку Task 17), «2. Добавьте сотрудников», «3. Кликайте по ячейкам». Выполненные шаги отмечаются галкой; после первого сотрудника компонент исчезает (показывается грид).
- [ ] **Step 2:** i18n-ключи `app.schedule.quickStart.*` в 3 локали.
- [ ] **Step 3:** Проверка на свежей организации в превью. Коммит: `git commit -m "feat(schedule): quick-start empty state"`

---

### Task 17: Модалки CRUD — отдел и сотрудник

**Files:**
- Create: `components/schedule/dept-modal.tsx`, `components/schedule/employee-modal.tsx`

- [ ] **Step 1:** `dept-modal.tsx`: имя отдела (создание/переименование/удаление с confirm). Server actions из Task 7. После успеха — `qc.invalidateQueries(['schedule', orgId])`.
- [ ] **Step 2:** `employee-modal.tsx`: поля по `EmployeeSchema` (имя, должность, отдел-селект, staff/trainee, телефон, telegram, email, даты). Кнопка «+ Сотрудник» в тулбаре грида и в группе отдела (как в демо `addEmployee`).
- [ ] **Step 3:** Лимит плана: показывать `current/limit` из `getBillingInfoAction` рядом с кнопкой; ошибка `plan_limit_employees` — тост с CTA на тарифы.
- [ ] **Step 4:** E2E: создать отдел → 3 сотрудников → они появились в гриде без перезагрузки. Коммит: `git commit -m "feat(schedule): dept/employee CRUD modals"`

---

### Task 18: Drag-and-drop порядок сотрудников

**Files:**
- Modify: `components/schedule/grid.tsx` (обернуть строки DndContext/SortableContext)

- [ ] **Step 1:** `@dnd-kit/sortable` вертикальная сортировка строк сотрудников внутри группы отдела (ручка-грип на строке, как в демо). Перенос между отделами в этап не входит (только порядок внутри отдела) — перенос делается через модалку сотрудника (смена отдела).
- [ ] **Step 2:** На drop: оптимистично переставить в кэше → `reorderEmployeesAction({ dept_id, ordered_ids })` → при ошибке откат.
- [ ] **Step 3:** E2E: перетащить, перезагрузить — порядок сохранён. Коммит: `git commit -m "feat(schedule): dnd-kit employee reorder"`

---

### Task 19: Вкладка «Сотрудники» (карточки/список)

**Files:**
- Create: `components/schedule/employees-tab/index.tsx`, `employee-card.tsx`, `employee-list.tsx`
- Modify: `components/schedule/grid.tsx` (таб-переключатель «Расписание | Сотрудники» как в демо `scheduleTab/employeesTab`)

- [ ] **Step 1:** Переключатель вкладок над тулбаром (`?tab=employees`). Вкладка использует те же данные Query (employees + departments).
- [ ] **Step 2:** `employee-card.tsx`: карточка по демо (`grid-preview.tsx` — employees tab): имя, должность, отдел, бейдж staff/trainee, телефон/telegram/email (кнопки копирования), дата рождения («через N дней» — расчёт в `lib/schedule/month.ts: daysUntilBirthday`), стаж от `hired_on`. Telegram-КНОПКИ-ДЕЙСТВИЯ не рендерим (этап 5) — только текст контакта с копированием.
- [ ] **Step 3:** `employee-list.tsx`: те же данные таблицей-списком; переключатель cards/list (`?view=`).
- [ ] **Step 4:** Клик по сотруднику в гриде → открывает его карточку (оверлей, как employee calendar overlay демо — упрощённо: карточка + мини-календарь его месяца из ScheduleMap).
- [ ] **Step 5:** Юнит-тест `daysUntilBirthday` (граница года). E2E-проверка вкладки. Коммит: `git commit -m "feat(schedule): employees tab — cards/list per demo"`

---

### Task 20: Настройки — кастомные статусы

**Files:**
- Create: `components/schedule/settings/status-manager.tsx`
- Create: `lib/actions/status-types.ts`

- [ ] **Step 1:** `lib/actions/status-types.ts`: `createStatusTypeAction` / `updateStatusTypeAction` / `deleteStatusTypeAction` — `assertCan(role, 'manage_status_types')`, Zod (`code` slug ≤20, `label` по 3 локалям или одна строка на все, `color` hex, `counts_as_present` bool, опц. `start_time/end_time`). Системные (`org_id IS NULL`) не редактируются (RLS уже запрещает — UI тоже прячет).
- [ ] **Step 2:** `status-manager.tsx`: список статусов (системные — read-only бейджи, кастомные — редактируемые), палитра цветов из `grid-shared.tsx: SOLID_COLORS` (перенести значения, не импортировать маркетинговый файл).
- [ ] **Step 3:** Новый кастомный статус сразу доступен в `cell-editor` (инвалидация Query).
- [ ] **Step 4:** E2E: создать статус «Удалёнка» зелёный counts_as_present=true → проставить в ячейку → покрытие учло. Коммит: `git commit -m "feat(schedule): custom status manager"`

---

### Task 21: RLS-интеграционные тесты

**Files:**
- Create: `supabase/tests/schedule_rls_test.sql`

- [ ] **Step 1:** По паттерну проекта (один `do $$` блок, `set local role authenticated` + `set_config('request.jwt.claims', ...)`, в конце `raise exception 'TESTS_PASSED'`): сценарии —
  1. manager НЕ может upsert запись сотрудника чужого отдела;
  2. viewer не может insert/update/delete нигде;
  3. запись с employee_id чужой организации отклоняется (композитный FK);
  4. статус чужой организации в entry отклоняется (триггер `status_wrong_org`);
  5. manager видит только свои отделы в select.
- [ ] **Step 2:** Прогнать через Management API (паттерн из памяти проекта: токен из keychain). Expected: `TESTS_PASSED`.
- [ ] **Step 3:** Коммит: `git commit -m "test(schedule): RLS integration scenarios"`

---

### Task 22: Перф-сид и финальная верификация этапа

**Files:**
- Create: `scripts/seed-perf.ts` (или SQL-скрипт `supabase/tests/seed_perf.sql`)

- [ ] **Step 1:** Сид в организацию «Claude E2E Test Org»: 6 отделов × 50 сотрудников = 300, заполнить текущий месяц статусами (≈9300 записей) одним SQL `insert ... select generate_series`.
- [ ] **Step 2:** Превью `/schedule`: скролл плавный (virtual), переключение режимов < 200мс на глаз, правка ячейки мгновенна. Если тормозит — профилировать: мемоизация строк (`memo` + стабильные пропсы), `select` в useQuery.
- [ ] **Step 3:** Полный прогон: `npx tsc --noEmit && npx vitest run && npm run build`.
- [ ] **Step 4:** Визуальная сверка с демо: скриншоты трёх режимов рядом с демо-гридом, светлая+тёмная тема, мобильная ширина (горизонтальный скролл грида, sticky-колонка).
- [ ] **Step 5:** Очистить перф-сид (delete по org), обновить ROADMAP.md: чекбоксы этапа 1, статус, журнал.
- [ ] **Step 6:** 🔒 **Security review** по блоку из ROADMAP: новые server actions, RLS, лимиты. Находки — в журнал.
- [ ] **Step 7:** Финальный коммит + сообщить основателю результаты с доказательствами (скриншоты, цифры тестов).

---

## Self-Review (выполнен)

- **Spec coverage:** загрузка месяца (T10), Map (T4), редактор+пресеты+optimistic (T13), миграция employment_kind (T2), today-in-TZ (T3), компоненты (T11-20), роли/лимиты (T7-9, T17), покрытие (T14), фильтры/URL (T15), quick start (T16), dnd (T18), вкладка сотрудников (T19), кастомные статусы (T20), тесты RLS (T21), перф 300 (T22), скрытые фичи-сироты (T12/T19 — не рендерим), экспорт — вне плана (мини-этап 1.5). Пробелов нет.
- **Placeholder scan:** код полный для слоёв данных/actions/hooks; визуальные шаги ссылаются на конкретные строки демо-файла (это источник в репо, не TBD).
- **Type consistency:** `MonthData`, `ScheduleMap`, `ScheduleEntryRow` определены в T3 и используются в T4/T10; результаты actions — единые `{ok}`-юнионы; `scheduleKey` один на хук.
