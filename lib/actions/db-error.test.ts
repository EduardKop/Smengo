import { describe, it, expect, vi } from 'vitest'
import { toClientError } from './db-error'
import type { PostgrestError } from '@supabase/supabase-js'

const err = (over: Partial<PostgrestError>): PostgrestError =>
  ({ name: 'PostgrestError', message: '', details: '', hint: '', code: '', ...over }) as PostgrestError

describe('toClientError', () => {
  it('maps codes and rpc exceptions to stable keys, hides raw messages', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(toClientError(err({ code: '23505', message: 'duplicate key value violates...' }))).toBe('duplicate')
    expect(toClientError(err({ code: '23503', message: 'violates foreign key constraint "schedule_entries_employee_id_fkey"' }))).toBe('invalid_reference')
    expect(toClientError(err({ message: 'P0001: ids_outside_scope' }))).toBe('ids_outside_scope')
    expect(toClientError(err({ code: 'XX000', message: 'something internal' }))).toBe('server_error')
  })
})
