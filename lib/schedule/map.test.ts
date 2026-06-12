import { describe, it, expect } from 'vitest'
import { buildScheduleMap, coverageByDay, shortageByDay } from './map'
import type { ScheduleEntryRow, EmployeeRow, StatusTypeRow } from './types'

const entry = (over: Partial<ScheduleEntryRow>): ScheduleEntryRow =>
  ({
    id: 'e1', org_id: 'org1', employee_id: 'emp1', entry_date: '2026-06-01',
    status_id: 'work', note: null, created_by: null, updated_by: null,
    created_at: '', updated_at: '', start_time: null, end_time: null,
    ...over,
  }) as ScheduleEntryRow

const emp = (id: string, dept: string | null): EmployeeRow =>
  ({ id, org_id: 'org1', dept_id: dept, full_name: id, position: null, sort_order: 0,
     deleted_at: null, created_at: '', updated_at: '', phone: null, telegram: null,
     email: null, birth_date: null, hired_on: null, note: null, employment_kind: 'staff',
  }) as EmployeeRow

const status = (id: string, present: boolean): StatusTypeRow =>
  ({ id, org_id: null, code: id, label: {}, color: '#000', counts_as_present: present,
     is_system: true, sort_order: 0, created_at: '', start_time: null, end_time: null,
  }) as StatusTypeRow

describe('buildScheduleMap', () => {
  it('maps employee -> date -> entry', () => {
    const m = buildScheduleMap([
      entry({ id: 'a', employee_id: 'emp1', entry_date: '2026-06-01' }),
      entry({ id: 'b', employee_id: 'emp1', entry_date: '2026-06-02' }),
      entry({ id: 'c', employee_id: 'emp2', entry_date: '2026-06-01' }),
    ])
    expect(m.get('emp1')?.get('2026-06-01')?.id).toBe('a')
    expect(m.get('emp1')?.size).toBe(2)
    expect(m.get('emp2')?.size).toBe(1)
    expect(m.get('missing')).toBeUndefined()
  })
})

describe('coverageByDay', () => {
  const employees = [emp('emp1', 'd1'), emp('emp2', 'd1'), emp('emp3', 'd2')]
  const statuses = [status('work', true), status('vacation', false)]
  const entries = [
    entry({ employee_id: 'emp1', entry_date: '2026-06-01', status_id: 'work' }),
    entry({ employee_id: 'emp2', entry_date: '2026-06-01', status_id: 'vacation' }),
    entry({ employee_id: 'emp3', entry_date: '2026-06-01', status_id: 'work' }),
  ]

  it('counts only counts_as_present, scoped to department', () => {
    const all = coverageByDay(entries, employees, statuses, null)
    expect(all.get('2026-06-01')).toBe(2) // emp1 + emp3

    const d1 = coverageByDay(entries, employees, statuses, 'd1')
    expect(d1.get('2026-06-01')).toBe(1) // только emp1
  })
})

describe('shortageByDay', () => {
  it('returns deficit only for days below threshold', () => {
    const coverage = new Map([
      ['2026-06-01', 1],
      ['2026-06-02', 3],
      ['2026-06-03', 4],
    ])
    const allDates = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04']

    const shortage = shortageByDay(coverage, 3, allDates)
    expect(shortage.get('2026-06-01')).toBe(2) // present=1, deficit=2
    expect(shortage.has('2026-06-02')).toBe(false) // present=3, no deficit
    expect(shortage.has('2026-06-03')).toBe(false) // present=4, no deficit
    expect(shortage.get('2026-06-04')).toBe(3) // no entry -> present=0, deficit=3
  })

  it('returns empty Map when minPresent is 0', () => {
    const coverage = new Map([['2026-06-01', 1]])
    expect(shortageByDay(coverage, 0, ['2026-06-01']).size).toBe(0)
  })
})
