'use server'

/**
 * Настройки организации (/settings/company): название, таймзона, лого.
 * Гейт manage_org (owner) — зеркало RLS org_update; колоночный grant
 * пускает только name/timezone/default_locale/billing_email/logo_url.
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getActionContext } from '@/lib/actions/context'
import { assertCan } from '@/lib/permissions'
import {
  AVATAR_MAX_BYTES,
  AVATAR_SIGNED_URL_TTL_SECONDS,
  sniffImageMime,
} from '@/lib/schedule/avatar'
import { ORG_LOGO_BUCKET, orgLogoStoragePath } from '@/lib/app/avatars'

export type OrgSettingsResult =
  | { ok: true }
  | { ok: false; error: string }

export type OrgLogoResult =
  | { ok: true; url: string | null }
  | { ok: false; error: string }

function isValidTimezone(tz: string): boolean {
  try {
    return (Intl.supportedValuesOf('timeZone') as string[]).includes(tz)
  } catch {
    return false
  }
}

const OrgSettingsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  timezone: z.string().trim().min(1).max(64).refine(isValidTimezone, 'invalid_timezone'),
})

export async function updateOrgSettingsAction(input: { name: string; timezone: string }): Promise<OrgSettingsResult> {
  const parsed = OrgSettingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }

  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'manage_org')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const { error } = await ctx.supabase
    .from('organizations')
    .update({ name: parsed.data.name, timezone: parsed.data.timezone })
    .eq('id', ctx.orgId)
  if (error) return { ok: false, error: 'update_failed' }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function uploadOrgLogoAction(formData: FormData): Promise<OrgLogoResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'manage_org')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'avatar_invalid_type' }
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, error: 'avatar_too_large' }

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const mime = sniffImageMime(head)
  if (!mime) return { ok: false, error: 'avatar_invalid_type' }

  const { data: org } = await ctx.supabase
    .from('organizations')
    .select('id, logo_url')
    .eq('id', ctx.orgId)
    .single()
  if (!org) return { ok: false, error: 'invalid_reference' }

  const storage = ctx.supabase.storage.from(ORG_LOGO_BUCKET)
  const path = orgLogoStoragePath(ctx.orgId, mime)
  const { error: uploadError } = await storage.upload(path, file, { contentType: mime })
  if (uploadError) return { ok: false, error: 'avatar_upload_failed' }

  const { error: updateError } = await ctx.supabase
    .from('organizations')
    .update({ logo_url: path })
    .eq('id', ctx.orgId)
  if (updateError) {
    await storage.remove([path]) // не оставляем сироту
    return { ok: false, error: 'update_failed' }
  }

  if (org.logo_url && org.logo_url !== path) {
    await storage.remove([org.logo_url]) // best-effort
  }

  const { data: signed } = await storage.createSignedUrl(path, AVATAR_SIGNED_URL_TTL_SECONDS)

  revalidatePath('/', 'layout')
  return { ok: true, url: signed?.signedUrl ?? null }
}

export async function removeOrgLogoAction(): Promise<OrgSettingsResult> {
  const res = await getActionContext()
  if (!res.ok) return { ok: false, error: res.error }
  const { ctx } = res
  try {
    assertCan(ctx.role, 'manage_org')
  } catch {
    return { ok: false, error: 'forbidden' }
  }

  const { data: org } = await ctx.supabase
    .from('organizations')
    .select('id, logo_url')
    .eq('id', ctx.orgId)
    .single()
  if (!org) return { ok: false, error: 'invalid_reference' }

  if (org.logo_url) {
    const { error } = await ctx.supabase
      .from('organizations')
      .update({ logo_url: null })
      .eq('id', ctx.orgId)
    if (error) return { ok: false, error: 'update_failed' }
    await ctx.supabase.storage.from(ORG_LOGO_BUCKET).remove([org.logo_url])
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}
