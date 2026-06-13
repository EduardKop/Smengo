'use server'

/**
 * Профиль пользователя (/my_account): имя + аватар.
 * Профиль — пользовательский уровень (не организация): RLS profiles
 * разрешает select/update только своей строки; бакет profile-avatars —
 * только свою папку (user_id/...).
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  AVATAR_MAX_BYTES,
  AVATAR_SIGNED_URL_TTL_SECONDS,
  sniffImageMime,
} from '@/lib/schedule/avatar'
import { PROFILE_AVATAR_BUCKET, profileAvatarStoragePath } from '@/lib/app/avatars'

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error: string }

export type ProfileAvatarResult =
  | { ok: true; url: string | null }
  | { ok: false; error: string }

const FullNameSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
})

export async function updateProfileAction(input: { full_name: string }): Promise<ProfileActionResult> {
  const parsed = FullNameSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name })
    .eq('id', user.id)
  if (error) return { ok: false, error: 'update_failed' }

  revalidatePath('/my_account')
  return { ok: true }
}

export async function uploadProfileAvatarAction(formData: FormData): Promise<ProfileAvatarResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'avatar_invalid_type' }
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, error: 'avatar_too_large' }

  // Тип файла — по магическим байтам, клиентскому Content-Type не доверяем
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const mime = sniffImageMime(head)
  if (!mime) return { ok: false, error: 'avatar_invalid_type' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .eq('id', user.id)
    .single()
  if (!profile) return { ok: false, error: 'invalid_reference' }

  const storage = supabase.storage.from(PROFILE_AVATAR_BUCKET)
  const path = profileAvatarStoragePath(user.id, mime)
  const { error: uploadError } = await storage.upload(path, file, { contentType: mime })
  if (uploadError) return { ok: false, error: 'avatar_upload_failed' }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: path })
    .eq('id', user.id)
  if (updateError) {
    await storage.remove([path]) // не оставляем сироту, исход не важен
    return { ok: false, error: 'update_failed' }
  }

  if (profile.avatar_url && profile.avatar_url !== path) {
    await storage.remove([profile.avatar_url]) // best-effort
  }

  const { data: signed } = await storage.createSignedUrl(path, AVATAR_SIGNED_URL_TTL_SECONDS)

  revalidatePath('/my_account')
  return { ok: true, url: signed?.signedUrl ?? null }
}

export async function removeProfileAvatarAction(): Promise<ProfileActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .eq('id', user.id)
    .single()
  if (!profile) return { ok: false, error: 'invalid_reference' }

  if (profile.avatar_url) {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id)
    if (error) return { ok: false, error: 'update_failed' }
    // Файл чистим после успешного обнуления ссылки
    await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([profile.avatar_url])
  }

  revalidatePath('/my_account')
  return { ok: true }
}
