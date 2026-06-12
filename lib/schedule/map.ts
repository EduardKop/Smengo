import type { AlertConfigRow, EmployeeRow, ScheduleEntryRow, ScheduleMap, StatusTypeRow } from './types'

/**
 * Строит двумерную Map: employee_id → (entry_date → entry).
 * При дубликате (employee_id, entry_date) побеждает последняя запись
 * (в БД дубликаты невозможны — unique constraint).
 */
export function buildScheduleMap(entries: ScheduleEntryRow[]): ScheduleMap {
  const map: ScheduleMap = new Map()
  for (const e of entries) {
    let byDate = map.get(e.employee_id)
    if (!byDate) {
      byDate = new Map()
      map.set(e.employee_id, byDate)
    }
    byDate.set(e.entry_date, e)
  }
  return map
}

/**
 * dateISO → сколько людей counts_as_present в этот день (опционально в рамках отдела).
 *
 * Контракт: employees — уже отфильтрованный список активных (deleted_at IS NULL);
 * записи сотрудников вне списка игнорируются.
 * Принимает плоский entries сознательно: map и coverage — независимые
 * O(n)-производные одного источника.
 */
export function coverageByDay(
  entries: ScheduleEntryRow[],
  employees: EmployeeRow[],
  statusTypes: StatusTypeRow[],
  deptId: string | null,
): Map<string, number> {
  const presentStatus = new Set(statusTypes.filter((s) => s.counts_as_present).map((s) => s.id))
  const scopeEmp = new Set(
    employees.filter((e) => deptId === null || e.dept_id === deptId).map((e) => e.id),
  )
  const out = new Map<string, number>()
  for (const e of entries) {
    if (!presentStatus.has(e.status_id) || !scopeEmp.has(e.employee_id)) continue
    out.set(e.entry_date, (out.get(e.entry_date) ?? 0) + 1)
  }
  return out
}

/**
 * Вычисляет применимый порог min_present для текущего фильтра:
 * - deptId задан → возвращает min_present конкретного отдела (или 0 если не настроен)
 * - deptId === null (все отделы) → возвращает сумму min_present всех отделов
 *   (0 если ни одного порога нет)
 *
 * Чистая функция, не зависит от глобального состояния.
 */
export function aggregateMinPresent(alertConfigs: AlertConfigRow[], deptId: string | null): number {
  if (deptId !== null) {
    return alertConfigs.find((c) => c.department_id === deptId)?.min_present ?? 0
  }
  return alertConfigs.reduce((sum, c) => sum + c.min_present, 0)
}

/** dateISO -> дефицит (minPresent - present), только положительные значения. */
export function shortageByDay(
  coverage: Map<string, number>,
  minPresent: number,
  allDates: string[],
): Map<string, number> {
  const out = new Map<string, number>()
  if (minPresent <= 0) return out
  for (const d of allDates) {
    const present = coverage.get(d) ?? 0
    if (present < minPresent) out.set(d, minPresent - present)
  }
  return out
}
