'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { checkPlanLimit } from '@/lib/billing/limits'
import { EmployeeSchema, ReorderSchema } from '@/lib/validation/schedule'

export type EmpActionResult = { ok: true; id?: string } | { ok: false; error: string }

const UUIDSchema = z.string().uuid()

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
  if (!UUIDSchema.safeParse(employeeId).success) return { ok: false, error: 'invalid_id' }
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
  if (!UUIDSchema.safeParse(employeeId).success) return { ok: false, error: 'invalid_id' }
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
