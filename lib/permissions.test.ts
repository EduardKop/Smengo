import { describe, it, expect } from 'vitest'
import { can, assertCan, type Action } from './permissions'
import type { UserRole } from '@/supabase/types'

// ────────────────────────────────────────────────────────
// Role permission matrix from §3.5
// ────────────────────────────────────────────────────────

const ALL_ACTIONS: Action[] = [
  'billing',
  'invite_users',
  'manage_departments',
  'crud_employees',
  'edit_schedule',
  'manage_alerts',
  'manage_status_types',
  'view_grid',
]

describe('permissions — can()', () => {
  describe('owner: full access', () => {
    it('can perform every action', () => {
      for (const action of ALL_ACTIONS) {
        expect(can('owner', action), `owner should be able to: ${action}`).toBe(true)
      }
    })
  })

  describe('admin: all except billing', () => {
    it('cannot access billing', () => {
      expect(can('admin', 'billing')).toBe(false)
    })

    it('can perform all non-billing actions', () => {
      const adminActions = ALL_ACTIONS.filter((a) => a !== 'billing')
      for (const action of adminActions) {
        expect(can('admin', action), `admin should be able to: ${action}`).toBe(true)
      }
    })
  })

  describe('manager: scoped to their departments', () => {
    const allowed: Action[] = ['crud_employees', 'edit_schedule', 'manage_alerts', 'view_grid']
    const denied: Action[] = ['billing', 'invite_users', 'manage_departments', 'manage_status_types']

    it.each(allowed)('can %s', (action) => {
      expect(can('manager', action)).toBe(true)
    })

    it.each(denied)('cannot %s', (action) => {
      expect(can('manager', action)).toBe(false)
    })
  })

  describe('viewer: read-only', () => {
    it('can view_grid', () => {
      expect(can('viewer', 'view_grid')).toBe(true)
    })

    const denied: Action[] = [
      'billing',
      'invite_users',
      'manage_departments',
      'crud_employees',
      'edit_schedule',
      'manage_alerts',
      'manage_status_types',
    ]

    it.each(denied)('cannot %s', (action) => {
      expect(can('viewer', action)).toBe(false)
    })
  })
})

describe('permissions — assertCan()', () => {
  it('does not throw when allowed', () => {
    expect(() => assertCan('owner', 'billing')).not.toThrow()
    expect(() => assertCan('admin', 'invite_users')).not.toThrow()
    expect(() => assertCan('manager', 'edit_schedule')).not.toThrow()
    expect(() => assertCan('viewer', 'view_grid')).not.toThrow()
  })

  it('throws Forbidden when denied', () => {
    expect(() => assertCan('viewer', 'billing')).toThrow("Forbidden: role 'viewer' cannot perform 'billing'")
    expect(() => assertCan('manager', 'billing')).toThrow("Forbidden: role 'manager' cannot perform 'billing'")
    expect(() => assertCan('admin', 'billing')).toThrow("Forbidden: role 'admin' cannot perform 'billing'")
  })

  it('throws for manager trying to manage_departments', () => {
    expect(() => assertCan('manager', 'manage_departments')).toThrow('Forbidden')
  })
})

describe('permissions — role escalation is impossible', () => {
  const roles: UserRole[] = ['owner', 'admin', 'manager', 'viewer']

  it('no role has access to undefined actions', () => {
    for (const role of roles) {
      // @ts-expect-error testing invalid action
      expect(can(role, 'nonexistent_action')).toBe(false)
    }
  })
})
