'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import { DepartmentSchema } from '@/lib/validation/schedule'

export type DeptActionResult = { ok: true; id?: string } | { ok: false; error: string }

const UUIDSchema = z.string().uuid()

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
  const idCheck = UUIDSchema.safeParse(deptId)
  if (!idCheck.success) return { ok: false, error: 'invalid_id' }

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
  const idCheck = UUIDSchema.safeParse(deptId)
  if (!idCheck.success) return { ok: false, error: 'invalid_id' }

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
