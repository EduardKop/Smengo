import type { UserRole } from '@/supabase/types'

export type Action =
  | 'billing'
  | 'invite_users'
  | 'manage_departments'
  | 'crud_employees'
  | 'edit_schedule'
  | 'manage_alerts'
  | 'manage_status_types'
  | 'customize_view'
  | 'view_grid'
  /** Настройки организации (название/таймзона/лого) — зеркало RLS org_update (owner-only) */
  | 'manage_org'

const PERMISSIONS: Record<UserRole, ReadonlySet<Action>> = {
  owner: new Set([
    'billing',
    'manage_org',
    'invite_users',
    'manage_departments',
    'crud_employees',
    'edit_schedule',
    'manage_alerts',
    'manage_status_types',
    'customize_view',
    'view_grid',
  ]),
  admin: new Set([
    'invite_users',
    'manage_departments',
    'crud_employees',
    'edit_schedule',
    'manage_alerts',
    'manage_status_types',
    'customize_view',
    'view_grid',
  ]),
  manager: new Set(['crud_employees', 'edit_schedule', 'manage_alerts', 'customize_view', 'view_grid']),
  viewer: new Set(['view_grid']),
}

/** Check if a role has permission to perform an action. */
export function can(role: UserRole, action: Action): boolean {
  return PERMISSIONS[role].has(action)
}

/**
 * Assert that a role has permission. Throws a 403-style error if not.
 * Use inside Server Actions to enforce authorization on the server.
 */
export function assertCan(role: UserRole, action: Action): void {
  if (!can(role, action)) {
    throw new Error(`Forbidden: role '${role}' cannot perform '${action}'`)
  }
}
