'use client'

/**
 * Сохраняемый «Вид» грида организации: тумблеры «Отображения» + визуалы
 * карточек статусов. Изменения применяются оптимистично и сохраняются
 * debounced-вызовом saveGridViewAction; ошибка → откат к последнему
 * сохранённому состоянию + тост (код ошибки наружу через onSaveError).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { saveGridViewAction } from '@/lib/actions/grid-view'
import type { CardVisual, GridViewSettings } from '@/lib/validation/grid-view'

const SAVE_DEBOUNCE_MS = 600

export interface GridViewToggles {
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  /** true — строки сгруппированы по отделам; false — единый список */
  groupByDept: boolean
  showEmployeeDepartment: boolean
  showEmployeeRole: boolean
  showEmployeeDot: boolean
}

export interface ResolvedGridView extends GridViewToggles {
  cardVisuals: Record<string, CardVisual>
}

/** Дефолты = демо (DEFAULT_DISPLAY_SETTINGS старого localStorage-вида). */
export const DEFAULT_GRID_VIEW: ResolvedGridView = {
  showTimes: true,
  merged: false,
  showGrid: false,
  groupByDept: true,
  showEmployeeDepartment: true,
  showEmployeeRole: true,
  showEmployeeDot: true,
  cardVisuals: {},
}

/** Сохранённые настройки (все поля optional) → полный вид с дефолтами. */
export function resolveGridView(settings: GridViewSettings | null | undefined): ResolvedGridView {
  return {
    showTimes: settings?.showTimes ?? DEFAULT_GRID_VIEW.showTimes,
    merged: settings?.merged ?? DEFAULT_GRID_VIEW.merged,
    showGrid: settings?.showGrid ?? DEFAULT_GRID_VIEW.showGrid,
    groupByDept: settings?.groupByDept ?? DEFAULT_GRID_VIEW.groupByDept,
    showEmployeeDepartment: settings?.showEmployeeDepartment ?? DEFAULT_GRID_VIEW.showEmployeeDepartment,
    showEmployeeRole: settings?.showEmployeeRole ?? DEFAULT_GRID_VIEW.showEmployeeRole,
    showEmployeeDot: settings?.showEmployeeDot ?? DEFAULT_GRID_VIEW.showEmployeeDot,
    cardVisuals: settings?.cardVisuals ?? {},
  }
}

function toSettings(view: ResolvedGridView): GridViewSettings {
  return {
    showTimes: view.showTimes,
    merged: view.merged,
    showGrid: view.showGrid,
    groupByDept: view.groupByDept,
    showEmployeeDepartment: view.showEmployeeDepartment,
    showEmployeeRole: view.showEmployeeRole,
    showEmployeeDot: view.showEmployeeDot,
    cardVisuals: view.cardVisuals,
  }
}

export interface UseGridViewResult {
  view: ResolvedGridView
  setToggle: (key: keyof GridViewToggles, value: boolean) => void
  /** null — сбросить визуал статуса к дефолтному рендеру */
  setCardVisual: (statusTypeId: string, visual: CardVisual | null) => void
}

export function useGridView(
  initial: GridViewSettings | null | undefined,
  canCustomize: boolean,
  onSaveError: (code: string) => void,
): UseGridViewResult {
  const [view, setView] = useState<ResolvedGridView>(() => resolveGridView(initial))
  /** Текущее значение для расчёта next вне setState (избегаем эффектов в updater). */
  const viewRef = useRef(view)
  /** Последний подтверждённый сервером снапшот — точка отката при ошибке. */
  const persistedRef = useRef(view)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSaveErrorRef = useRef(onSaveError)

  useEffect(() => {
    onSaveErrorRef.current = onSaveError
  }, [onSaveError])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const apply = useCallback((next: ResolvedGridView) => {
    viewRef.current = next
    setView(next)
    // Роли без customize_view не пишут (UI и так дизейблит контролы) —
    // сервер в любом случае fail-closed через assertCan.
    if (!canCustomize) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      const snapshot = persistedRef.current
      void saveGridViewAction(toSettings(next)).then((res) => {
        if (res.ok) {
          persistedRef.current = next
          return
        }
        // Откат только если пользователь не успел изменить вид ещё раз —
        // иначе откатим более свежие правки, чей save уже запланирован.
        if (viewRef.current === next) {
          viewRef.current = snapshot
          setView(snapshot)
        }
        onSaveErrorRef.current(res.error)
      })
    }, SAVE_DEBOUNCE_MS)
  }, [canCustomize])

  const setToggle = useCallback((key: keyof GridViewToggles, value: boolean) => {
    apply({ ...viewRef.current, [key]: value })
  }, [apply])

  const setCardVisual = useCallback((statusTypeId: string, visual: CardVisual | null) => {
    const prev = viewRef.current
    const cardVisuals = { ...prev.cardVisuals }
    if (visual === null) delete cardVisuals[statusTypeId]
    else cardVisuals[statusTypeId] = visual
    apply({ ...prev, cardVisuals })
  }, [apply])

  return { view, setToggle, setCardVisual }
}
