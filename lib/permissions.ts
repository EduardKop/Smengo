import type { UserRole } from '@/supabase/types'

export type Action =
  | 'billing'
  | 'invite_users'
  | 'manage_departments'
  | 'crud_employees'
  | 'edit_schedule'
  | 'manage_alerts'
  | 'manage_status_types'
  | 'view_grid'

const PERMISSIONS: Record<UserRole, ReadonlySet<Action>> = {
  owner: new Set([
    'billing',
    'invite_users',
    'manage_departments',
    'crud_employees',
    'edit_schedule',
    'manage_alerts',
    'manage_status_types',
    'view_grid',
  ]),
  admin: new Set([
    'invite_users',
    'manage_departments',
    'crud_employees',
    'edit_schedule',
    'manage_alerts',
    'manage_status_types',
    'view_grid',
  ]),
  manager: new Set(['crud_employees', 'edit_schedule', 'manage_alerts', 'view_grid']),
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
