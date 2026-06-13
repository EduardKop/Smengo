'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, PlanTier } from '@/supabase/types'
import { getActionContext } from '@/lib/actions/context'
import { assertCan, can } from '@/lib/permissions'
import { checkPlanLimit } from '@/lib/billing/limits'
import { EmployeeSchema, ReorderSchema } from '@/lib/validation/schedule'
import { BulkEmployeesSchema } from '@/lib/validation/bulk-employees'
import { toClientError } from '@/lib/actions/db-error'
import {
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  AVATAR_SIGNED_URL_TTL_SECONDS,
  avatarStoragePath,
  sniffImageMime,
} from '@/lib/schedule/avatar'

export type EmpActionResult = { ok: true; id?: string } | { ok: false; error: string }

/** url — свежий signed URL для мгновенного превью без рефетча месяца. */
export type AvatarActionResult = { ok: true; url: string | null } | { ok: false; error: string }

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

  // TODO: TOCTOU допустим на целевом масштабе (15-300, ручное добавление); при злоупотреблении — перенести лимит в БД-триггер
  // Финальная проверка лимита плана — на сервере
  const { data: org } = await ctx.supabase
    .from('organizations').select('plan').eq('id', ctx.orgId).single()
  if (!org) return { ok: false, error: 'org_not_found' }
  const limit = await checkPlanLimit(ctx.supabase, ctx.orgId, org.plan, 'employees')
  if (!limit.allowed) return { ok: false, error: 'plan_limit_employees' }

  // sort_order: глобально-монотонный хвост; первый ручной reorder перенумерует внутри отдела
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
  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true, id: data.id }
}

export type BulkCreateResult =
  | { ok: true; created: number; invited: number }
  | { ok: false; error: string }

/**
 * Bulk-добавление из модалки-таблицы (правка 7): вся пачка либо вставляется
 * целиком, либо отклоняется (валидация любой строки / лимит плана / чужой отдел).
 */
export async function bulkCreateEmployeesAction(input: unknown): Promise<BulkCreateResult> {
  const parsed = BulkEmployeesSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }

  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'crud_employees')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const rows = parsed.data.rows

  // Строки с приглашением: указан уровень доступа И email. Право invite_users
  // проверяем ДО вставки сотрудников (менеджер может крудить, но не приглашать)
  // — иначе бы создали сотрудников, а пригласить не смогли.
  const inviteRows = rows.filter((r) => r.access_role && r.email)
  if (inviteRows.length > 0 && !can(ctx.role, 'invite_users')) {
    return { ok: false, error: 'forbidden_invite' }
  }

  // Финальная проверка лимита плана на ВСЮ пачку — на сервере
  // (TOCTOU допустим, как у createEmployeeAction)
  const { data: org } = await ctx.supabase
    .from('organizations').select('plan').eq('id', ctx.orgId).single()
  if (!org) return { ok: false, error: 'org_not_found' }
  const limit = await checkPlanLimit(ctx.supabase, ctx.orgId, org.plan, 'employees')
  if (limit.limit !== Infinity && limit.current + rows.length > limit.limit) {
    return { ok: false, error: 'plan_limit_employees' }
  }

  // Все указанные отделы обязаны принадлежать активной организации
  const deptIds = [...new Set(rows.map((r) => r.dept_id).filter((id): id is string => id !== null))]
  if (deptIds.length > 0) {
    const { data: depts } = await ctx.supabase
      .from('departments')
      .select('id')
      .eq('org_id', ctx.orgId)
      .in('id', deptIds)
    if ((depts?.length ?? 0) !== deptIds.length) return { ok: false, error: 'invalid_reference' }
  }

  // sort_order: глобально-монотонный хвост, как у одиночного создания
  const { count } = await ctx.supabase
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', ctx.orgId)
    .is('deleted_at', null)

  const { error } = await ctx.supabase.from('employees').insert(
    rows.map((r, i) => ({
      org_id: ctx.orgId,
      full_name: r.full_name,
      dept_id: r.dept_id,
      position: r.position,
      email: r.email,
      phone: r.phone,
      telegram: r.telegram ?? null,
      sort_order: (count ?? 0) + i + 1,
    })),
  )
  if (error) return { ok: false, error: toClientError(error) }

  // Приглашения (best-effort): сотрудники уже созданы, поэтому сбой отдельного
  // инвайта не откатывает пачку. Каждый инвайт идёт через тот же SECURITY
  // DEFINER RPC create_invitation, что и одиночное приглашение (валидация роли
  // и токена — на сервере), затем письмо Resend.
  const invited = inviteRows.length > 0
    ? await sendBulkInvitations(ctx.supabase, ctx.orgId, org.plan, inviteRows)
    : 0

  revalidatePath('/schedule')
  revalidatePath('/employees')
  return { ok: true, created: rows.length, invited }
}

/**
 * Отправляет приглашения для строк bulk-добавления с уровнем доступа.
 * Возвращает число успешно отправленных. Лимит менеджеров на плане проверяется
 * перед каждым manager-инвайтом (как в createInvitationAction).
 */
async function sendBulkInvitations(
  supabase: SupabaseClient<Database>,
  orgId: string,
  plan: PlanTier,
  rows: Array<{ email: string | null; access_role?: 'admin' | 'manager' | 'viewer' | null }>,
): Promise<number> {
  const { Resend } = await import('resend')
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const resend = apiKey ? new Resend(apiKey) : null

  let sent = 0
  for (const r of rows) {
    if (!r.email || !r.access_role) continue
    try {
      // Лимит менеджеров — на сервере, как при одиночном приглашении
      if (r.access_role === 'manager') {
        const mgr = await checkPlanLimit(supabase, orgId, plan, 'managers')
        if (!mgr.allowed) continue
      }
      const { data: token, error } = await supabase.rpc('create_invitation', {
        p_org_id: orgId,
        p_email: r.email,
        p_role: r.access_role,
      })
      if (error || !token) continue
      if (resend && from && appUrl) {
        await resend.emails.send({
          from,
          to: r.email,
          subject: 'Приглашение в Smengo',
          html: `<p>Вас пригласили в команду Smengo.</p>
                 <p><a href="${appUrl}/invite/${token}">Принять приглашение</a></p>
                 <p>Ссылка действительна 7 дней.</p>`,
        })
      }
      sent += 1
    } catch {
      // best-effort: одно неудачное приглашение не валит пачку
    }
  }
  return sent
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
  if (error) return { ok: false, error: toClientError(error) }

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
  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}

export async function uploadEmployeeAvatarAction(employeeId: string, formData: FormData): Promise<AvatarActionResult> {
  if (!UUIDSchema.safeParse(employeeId).success) return { ok: false, error: 'invalid_id' }
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'crud_employees')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'avatar_invalid_type' }
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, error: 'avatar_too_large' }

  // Тип файла — по магическим байтам, клиентскому Content-Type не доверяем
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const mime = sniffImageMime(head)
  if (!mime) return { ok: false, error: 'avatar_invalid_type' }

  const { data: employee } = await ctx.supabase
    .from('employees')
    .select('id, avatar_url')
    .eq('id', employeeId)
    .eq('org_id', ctx.orgId)
    .is('deleted_at', null)
    .single()
  if (!employee) return { ok: false, error: 'invalid_reference' }

  const storage = ctx.supabase.storage.from(AVATAR_BUCKET)
  const path = avatarStoragePath(ctx.orgId, employeeId, mime)
  const { error: uploadError } = await storage.upload(path, file, { contentType: mime })
  if (uploadError) return { ok: false, error: 'avatar_upload_failed' }

  const { error: updateError } = await ctx.supabase
    .from('employees')
    .update({ avatar_url: path })
    .eq('id', employeeId)
    .eq('org_id', ctx.orgId)
  if (updateError) {
    await storage.remove([path]) // не оставляем сироту, исход не важен
    return { ok: false, error: toClientError(updateError) }
  }

  if (employee.avatar_url && employee.avatar_url !== path) {
    await storage.remove([employee.avatar_url]) // best-effort: битая ссылка уже перезаписана
  }

  const { data: signed } = await storage.createSignedUrl(path, AVATAR_SIGNED_URL_TTL_SECONDS)

  revalidatePath('/schedule')
  revalidatePath('/employees')
  return { ok: true, url: signed?.signedUrl ?? null }
}

export async function removeEmployeeAvatarAction(employeeId: string): Promise<EmpActionResult> {
  if (!UUIDSchema.safeParse(employeeId).success) return { ok: false, error: 'invalid_id' }
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'crud_employees')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const { data: employee } = await ctx.supabase
    .from('employees')
    .select('id, avatar_url')
    .eq('id', employeeId)
    .eq('org_id', ctx.orgId)
    .single()
  if (!employee) return { ok: false, error: 'invalid_reference' }

  if (employee.avatar_url) {
    const { error } = await ctx.supabase
      .from('employees')
      .update({ avatar_url: null })
      .eq('id', employeeId)
      .eq('org_id', ctx.orgId)
    if (error) return { ok: false, error: toClientError(error) }
    // Файл чистим после успешного обнуления ссылки; сирота не страшнее битой ссылки
    await ctx.supabase.storage.from(AVATAR_BUCKET).remove([employee.avatar_url])
  }

  revalidatePath('/schedule')
  revalidatePath('/employees')
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

  const { error } = await ctx.supabase.rpc('reorder_employees', {
    p_ordered_ids: parsed.data.ordered_ids,
    ...(parsed.data.dept_id !== null ? { p_dept_id: parsed.data.dept_id } : {}),
  })
  if (error) return { ok: false, error: toClientError(error) }

  revalidatePath('/schedule')
  return { ok: true }
}
