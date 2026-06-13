/**
 * Лого организации и аватар пользователя: бакеты и пути.
 * Валидация (sniffImageMime, лимиты) общая с фото сотрудников —
 * см. lib/schedule/avatar.ts; в *_url хранится ПУТЬ в приватном бакете.
 */

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const ORG_LOGO_BUCKET = 'org-logos'
export const PROFILE_AVATAR_BUCKET = 'profile-avatars'

export function orgLogoStoragePath(orgId: string, mime: string): string {
  return `${orgId}/${Date.now()}.${EXT_BY_MIME[mime] ?? 'jpg'}`
}

export function profileAvatarStoragePath(userId: string, mime: string): string {
  return `${userId}/${Date.now()}.${EXT_BY_MIME[mime] ?? 'jpg'}`
}
