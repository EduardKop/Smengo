'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import {
  Settings2, Pencil, X, Check, ChevronDown, RotateCcw,
  Sun, Sunset, Moon, TreePalm, Thermometer, AlertCircle, AlertTriangle,
  Palette, Sparkles, LayoutGrid, List, ShieldCheck, Briefcase, Globe2, Clock3,
  CalendarDays, Send, Mail, Phone, LockKeyhole, Copy,
} from 'lucide-react'
import { CalendarDots, UsersThree } from '@phosphor-icons/react'
import {
  RolePickerModal, AddSectionModal,
  ROLE_COLORS, DEPARTMENT_ROLE_KEYS, type CustomSection, type RoleOrSectionKey,
} from './grid-shared'
import { ClassicGrid } from './classic-grid'
import avatarMan14 from '../../Avatars_demo/man (14).jpeg'
import avatarMan4Alt from '../../Avatars_demo/man (4).jpeg'
import avatarMan1 from '../../Avatars_demo/man 1.jpeg'
import avatarMan12 from '../../Avatars_demo/man 12.jpeg'
import avatarMan2 from '../../Avatars_demo/man 2 .jpeg'
import avatarMan3 from '../../Avatars_demo/man 3.jpeg'
import avatarMan4 from '../../Avatars_demo/man 4.jpeg'
import avatarMan from '../../Avatars_demo/man.jpeg'
import avatarWoman1 from '../../Avatars_demo/woman (1).jpeg'
import avatarWoman12 from '../../Avatars_demo/woman (12).jpeg'
import avatarWoman5Alt from '../../Avatars_demo/woman (5).jpeg'
import avatarWoman34 from '../../Avatars_demo/woman 34.jpeg'
import avatarWoman4 from '../../Avatars_demo/woman 4.jpeg'
import avatarWoman5 from '../../Avatars_demo/woman 5.jpeg'

export type Status = 'W' | 'V' | 'S' | 'D' | 'U' | '-'
export type Mode = 'compact' | 'detail' | 'extended'
export type DeptKey = 'all' | 'sales' | 'ops' | 'support' | 'marketing' | 'design'
export type ProjectKey = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'
export type ShiftType = 'morning' | 'evening' | 'night'
export type GridTab = 'schedule' | 'employees'
export type EmployeeDirectoryView = 'cards' | 'list'
export type RoleKey =
  | 'salesDepartment'
  | 'developmentDepartment'
  | 'hr'
  | 'salesLead'
  | 'projectManager'
export type SpecialtyKey = 'sales' | 'retention' | 'frontEnd' | 'backEnd' | 'hr' | 'salesOps' | 'uiUx'
  | 'salesLead'
  | 'projectManager'
export type EmployeeNameKey =
  | 'annaPetrov'
  | 'markSidorov'
  | 'kateVolkova'
  | 'ivanMelnikov'
  | 'olgaRomanenko'
  | 'pavelYurov'
  | 'dariaKos'
  | 'alexNovikov'
  | 'yuliaLebed'
  | 'romaKarpov'
  | 'leraTarasova'
export type ShiftKey = 'morning' | 'evening' | 'night' | 'dayoff' | 'vacation' | 'sick' | 'unfilled'

// Day index that highlights a coverage gap (Wed, day 14)
export const PROBLEM_DAY_IDX = 13

export type GridPreviewLabels = {
  modeDetail: string
  modeCompact: string
  modeExtended: string
  monthLabel: string
  allDepts: string
  exportBtn: string
  addEmployee: string
  employee: string
  deptSales: string
  deptOps: string
  deptSupport: string
  deptMarketing: string
  deptDesign: string
  demoDept: string
  minDay: string
  alert: string
  coverageSummary: string
  statusWork: string
  statusVac: string
  statusSick: string
  statusOff: string
  statusUncovered: string
  statusWorkFull: string
  shiftMorning: string
  shiftEvening: string
  shiftNight: string
  shortageBadge: string
  shortageLabel: string
  hourSuffix: string
  displayLabel: string
  highContrastLabel: string
  highlightWeekendsLabel: string
  showTimesLabel: string
  mergedLabel: string
  gridLabel: string
  stickyLabel: string
  onShiftByDepartmentLabel: string
  timerLabel: string
  todayLabel: string
  scheduleTab: string
  employeesTab: string
  employeeViewCards: string
  employeeViewList: string
  employeePhone: string
  employeeContactInfo: string
  employeeTelegram: string
  employeeEmail: string
  employeeProject: string
  employeeBirthday: string
  employeeBirthdayIn: string
  employeeAgeYears: string
  employeeCompanyDays: string
  employeeCompanyDaysValue: string
  employeeTrainee: string
  employeeStaff: string
  days: { mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string }
  projectsBtn: string
  telegramBtn: string
  editBtn: string
  editDone: string
  toastCopied: string
  toastExported: string
  toastAdded: string
  newEmployee: string
  projectBadge: string
  projectTeam: string
  projectStatus: string
  projectClose: string
  projects: Record<ProjectKey, { name: string; desc: string; tag: string }>
  roles: Record<RoleKey, string>
  roleShortLabels: Record<RoleKey, string>
  specialties: Record<SpecialtyKey, string>
  employeeNames: Record<EmployeeNameKey, string>
  shifts: Record<ShiftKey, string>
  coverageGap: string
  months: [string, string, string, string, string]
  colOffDays: string
  colWorkHrs: string
  onShiftRowLabel: string
  footerLegendDay: string
  footerLegendNight: string
  footerLegendVacation: string
  footerLegendSick: string
  chromeOnShift: string
  chromeOffToday: string
  chromeToday: string
  themeLabel: string
  themeStandard: string
  themeClassic: string
  classicTeams: string
  classicAbsence: string
  classicAll: string
  classicSearch: string
  addSectionBtn: string
  addSectionTitle: string
  sectionNameLabel: string
  sectionNamePlaceholder: string
  colorLabel: string
  previewLabel: string
  gradientLabel: string
  stdColorsLabel: string
  gradientsLabel: string
  customColorLabel: string
  createBtn: string
  cancelBtn: string
  changeRoleTitle: string
  assignmentTitle: string
  assignmentSubtitle: string
  assignmentStructureLabel: string
  assignmentBranchLabel: string
  assignmentAddRole: string
  assignmentAddDepartment: string
  assignmentRolePlaceholder: string
  assignmentDepartmentPlaceholder: string
  assignmentRoleCount: string
  assignmentNoRoles: string
  saveBtn: string
  customBadge: string
  resetBtn: string
  showRolesLabel: string
  showEmployeeRoleLabel: string
  showEmployeeDepartmentLabel: string
  showEmployeeDotLabel: string
  empCalendarTitle: string
  empCalendarClose: string
  empCalendarLegendWork: string
  empCalendarLegendOff: string
  empCalendarLegendVacation: string
  empCalendarLegendSick: string
  empCalendarLegendDayoff: string
  empCalendarSummaryWorked: string
  empCalendarSummaryOff: string
  empCalendarSummaryHours: string
  aiPrompt: string
  aiRun: string
  aiDone: string
  aiOptimizedSummary: string
  localeTag: string
  ariaPrevMonth: string
  ariaNextMonth: string
  ariaTimerStart: string
  ariaTimerPause: string
  ariaNotifications: string
  ariaUserMenu: string
  ariaMore: string
  employeeActive: string
  employeeLock: string
  employeeAgeYearsOne: string
  employeeAgeYearsFew: string
  employeeCompanyDaysOne: string
  employeeCompanyDaysFew: string
}

// Demo months follow the real calendar so weekday headers and day counts
// match what labels.months claims (March–July 2026).
export const DEMO_YEAR = 2026
const DEMO_FIRST_MONTH = 2 // March (labels.months[0])
const DOW_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type MonthDay = { n: number; k: (typeof DOW_KEYS)[number] }

export function monthDays(monthIdx: number): MonthDay[] {
  const month = DEMO_FIRST_MONTH + monthIdx
  const count = new Date(DEMO_YEAR, month + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => {
    const dow = (new Date(DEMO_YEAR, month, i + 1).getDay() + 6) % 7
    return { n: i + 1, k: DOW_KEYS[dow] }
  })
}

export function scheduleOffsetForMonth(monthIdx: number): number {
  const month = DEMO_FIRST_MONTH + monthIdx
  const firstDowMon0 = (new Date(DEMO_YEAR, month, 1).getDay() + 6) % 7
  return ((firstDowMon0 - 3) % 14 + 14) % 14
}

export type EmpDef = {
  dept: Exclude<DeptKey, 'all'>
  name: string
  nameKey?: EmployeeNameKey
  tg: string
  pIdx: 1 | 2 | 3 | 4 | 5 | 6
  roleKey: RoleKey
  specialty: string
  s: string
  shift: ShiftType
}

// Schedule strings are 14 chars. Index 13 (=day 14 Wed) is highlighted as a coverage gap.
// Default team: sales (6), development (2), HR, sales lead, and project manager.
export const BASE_EMPLOYEES: EmpDef[] = [
  { dept: 'sales',     name: 'Anna Petrov',     nameKey: 'annaPetrov',     tg: '@anna_p',   pIdx: 1, roleKey: 'salesDepartment',       specialty: 'sales',     s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'sales',     name: 'Kate Volkova',    nameKey: 'kateVolkova',    tg: '@kate_v',   pIdx: 1, roleKey: 'salesDepartment',       specialty: 'sales',     s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'sales',     name: 'Olga Romanenko',  nameKey: 'olgaRomanenko',  tg: '@olga_r',   pIdx: 1, roleKey: 'salesDepartment',       specialty: 'sales',     s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'sales',     name: 'Mark Sidorov',    nameKey: 'markSidorov',    tg: '@mark_s',   pIdx: 2, roleKey: 'salesDepartment',       specialty: 'retention', s: 'WWDDWWWWWDDSSW', shift: 'night' },
  { dept: 'sales',     name: 'Ivan Melnikov',   nameKey: 'ivanMelnikov',   tg: '@ivan_m',   pIdx: 3, roleKey: 'salesDepartment',       specialty: 'retention', s: 'WWDDWWDDWWDDWW', shift: 'night' },
  { dept: 'sales',     name: 'Pavel Yurov',     nameKey: 'pavelYurov',     tg: '@pavel_y',  pIdx: 6, roleKey: 'salesDepartment',       specialty: 'retention', s: 'WWDDWWWWWDDWWW', shift: 'night' },
  { dept: 'sales',     name: 'Roma Karpov',     nameKey: 'romaKarpov',     tg: '@roma_k',   pIdx: 5, roleKey: 'salesDepartment',       specialty: 'salesLead', s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'ops',       name: 'Daria Kos',       nameKey: 'dariaKos',       tg: '@daria_k',  pIdx: 1, roleKey: 'developmentDepartment', specialty: 'frontEnd',  s: 'WWDDWWWWWDDWWU', shift: 'morning' },
  { dept: 'ops',       name: 'Alex Novikov',    nameKey: 'alexNovikov',    tg: '@alex_n',   pIdx: 2, roleKey: 'developmentDepartment', specialty: 'backEnd',   s: 'WWDDWWWWWDDWWU', shift: 'morning' },
  { dept: 'ops',       name: 'Lera Tarasova',   nameKey: 'leraTarasova',   tg: '@lera_t',   pIdx: 4, roleKey: 'developmentDepartment', specialty: 'projectManager', s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'support',   name: 'Yulia Lebed',     nameKey: 'yuliaLebed',     tg: '@yulia_l',  pIdx: 5, roleKey: 'hr',                    specialty: 'hr',        s: 'WWDDWWWWWDDWWW', shift: 'morning' },
]

const SPECIALTY_COLORS: Record<string, string> = {
  sales: '#d0773f',
  retention: '#b86132',
  frontEnd: '#3b82f6',
  backEnd: '#3b82f6',
  hr: '#10b981',
  salesOps: '#a65027',
  uiUx: '#8b5cf6',
  salesLead: '#8f431f',
  projectManager: '#8b5cf6',
}

const SPECIALTY_FALLBACK_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6']

const DEFAULT_DEPARTMENT_ROLES: Partial<Record<RoleKey, string[]>> = {
  salesDepartment: ['sales', 'retention', 'salesOps', 'salesLead'],
  developmentDepartment: ['frontEnd', 'backEnd', 'projectManager'],
  hr: ['hr'],
}

const SALES_SPECIALTY_SORT: Record<string, number> = {
  sales: 0,
  retention: 1,
  salesOps: 2,
  salesLead: 3,
}

const SPECIALTY_LEGACY_KEYS: Record<string, SpecialtyKey> = {
  Sales: 'sales',
  Продажі: 'sales',
  Продажи: 'sales',
  'Ретеншен': 'retention',
  Retention: 'retention',
  FrontEnd: 'frontEnd',
  'Front-End': 'frontEnd',
  BackEnd: 'backEnd',
  'Back-End': 'backEnd',
  HR: 'hr',
  'Sales Ops': 'salesOps',
  'Операції продажів': 'salesOps',
  'Операции продаж': 'salesOps',
  'Head of Sales': 'salesLead',
  'Керівник відділу продажів': 'salesLead',
  'Керівник відділу продаж': 'salesLead',
  'Керівник ВП': 'salesLead',
  'Руководитель отдела продаж': 'salesLead',
  'Керівник продажів': 'salesLead',
  'Руководитель продаж': 'salesLead',
  'Project Manager': 'projectManager',
  'Менеджер проєктів': 'projectManager',
  'Менеджер проектов': 'projectManager',
  'Проджект менеджер': 'projectManager',
  UIUX: 'uiUx',
  'UI/UX': 'uiUx',
}

type EmployeeKind = 'trainee' | 'staff'
type EmployeeProfileSeed = {
  birthday: string
  joined: string
  kind: EmployeeKind
}

const PROFILE_REFERENCE_DATE = new Date(2026, 4, 14)
const CONTACT_PLACEHOLDERS = {
  phone: '+380999999999',
  telegram: '@smengo_demo',
  email: 'demo@smengo.app',
}

const EMPLOYEE_PROFILE_SEEDS: Record<string, EmployeeProfileSeed> = {
  'Anna Petrov':    { birthday: '1997-06-18', joined: '2022-09-12', kind: 'staff' },
  'Mark Sidorov':   { birthday: '1995-11-03', joined: '2023-02-01', kind: 'staff' },
  'Kate Volkova':   { birthday: '2001-05-28', joined: '2026-03-04', kind: 'trainee' },
  'Ivan Melnikov':  { birthday: '1993-08-09', joined: '2021-10-20', kind: 'staff' },
  'Daria Kos':      { birthday: '1999-12-21', joined: '2024-01-15', kind: 'staff' },
  'Alex Novikov':   { birthday: '2002-07-07', joined: '2026-04-02', kind: 'trainee' },
  'Olga Romanenko': { birthday: '1991-03-25', joined: '2020-06-08', kind: 'staff' },
  'Pavel Yurov':    { birthday: '1998-09-14', joined: '2022-11-30', kind: 'staff' },
  'Yulia Lebed':    { birthday: '2000-10-01', joined: '2025-05-19', kind: 'staff' },
  'Roma Karpov':    { birthday: '2003-06-02', joined: '2026-02-18', kind: 'trainee' },
  'Lera Tarasova':  { birthday: '1996-04-11', joined: '2023-07-26', kind: 'staff' },
}

export function rotateSchedule(s: string, offset: number): string {
  const padded = (s + 'WWWWWWWWWWWWWW').slice(0, 14)
  const o = ((offset % 14) + 14) % 14
  return padded.slice(o) + padded.slice(0, o)
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function formatDemoDate(value: string): string {
  const date = parseDate(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

function fillTemplate(template: string, value: number): string {
  return template.replace('{n}', String(value))
}

function employeeProfileFor(emp: EmpDef, index: number): EmployeeProfileSeed {
  const fallbackBirthdays = ['1999-02-16', '2000-08-23', '1994-12-04', '2002-01-30']
  const fallbackJoined = ['2025-09-01', '2026-01-12', '2024-05-21', '2026-04-18']
  return EMPLOYEE_PROFILE_SEEDS[emp.name] ?? {
    birthday: fallbackBirthdays[index % fallbackBirthdays.length],
    joined: fallbackJoined[index % fallbackJoined.length],
    kind: index % 3 === 1 ? 'trainee' : 'staff',
  }
}

function birthdayStats(birthday: string, reference: Date): { daysUntil: number; age: number } {
  const birth = parseDate(birthday)
  const today = startOfDay(reference)
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
  const daysUntil = Math.round((next.getTime() - today.getTime()) / 86_400_000)
  const hadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  return {
    daysUntil,
    age: today.getFullYear() - birth.getFullYear() - (hadBirthdayThisYear ? 0 : 1),
  }
}

// Plural-aware template fill: picks one/few/many form via Intl.PluralRules
// (covers ru/uk «1 год / 2 года / 5 лет»; for en `few` never matches).
function pluralTemplate(
  locale: string,
  n: number,
  forms: { one: string; few: string; many: string },
): string {
  let category = 'other'
  try {
    category = new Intl.PluralRules(locale).select(n)
  } catch { /* fall back to many */ }
  const template = category === 'one' ? forms.one : category === 'few' ? forms.few : forms.many
  return fillTemplate(template, n)
}

function daysInCompany(joined: string, reference: Date): number {
  const joinedAt = startOfDay(parseDate(joined))
  const today = startOfDay(reference)
  return Math.max(0, Math.round((today.getTime() - joinedAt.getTime()) / 86_400_000))
}

type ScheduleCellOverride = { name: string; day: number; status: Status }
type AiOptimizedCell = ScheduleCellOverride
type AiShiftMove = {
  name: string
  fromDay: number
  toDay: number
  fromStatus: Status
  toStatus: Status
}

const STATUS_OPTIONS: Exclude<Status, never>[] = ['W', 'V', 'S', 'D', 'U', '-']
const AI_SHIFT_MOVES: AiShiftMove[] = [
  { name: 'Ivan Melnikov', fromDay: 8, toDay: 6, fromStatus: 'W', toStatus: 'W' },
  { name: 'Ivan Melnikov', fromDay: 9, toDay: 7, fromStatus: 'D', toStatus: 'W' },
  { name: 'Ivan Melnikov', fromDay: 22, toDay: 21, fromStatus: 'W', toStatus: 'W' },
  { name: 'Ivan Melnikov', fromDay: 23, toDay: 22, fromStatus: 'D', toStatus: 'W' },
]
const AI_OPTIMIZED_CELLS: AiOptimizedCell[] = [
  ...AI_SHIFT_MOVES.flatMap(({ name, fromDay, toDay, fromStatus, toStatus }) => [
    { name, day: fromDay, status: fromStatus },
    { name, day: toDay, status: toStatus },
  ]),
  { name: 'Ivan Melnikov', day: 11, status: 'W' },
  { name: 'Ivan Melnikov', day: 20, status: 'W' },
  { name: 'Ivan Melnikov', day: 25, status: 'W' },
  { name: 'Daria Kos', day: PROBLEM_DAY_IDX, status: 'W' },
  { name: 'Alex Novikov', day: PROBLEM_DAY_IDX, status: 'W' },
  { name: 'Alex Novikov', day: 4, status: 'W' },
]
const DEFAULT_SCHEDULE_OVERRIDES: Record<string, Status> = {
  'Kate Volkova-21': 'V',
  'Kate Volkova-22': 'V',
  'Kate Volkova-23': 'V',
  'Kate Volkova-24': 'V',
  'Kate Volkova-25': 'V',
  'Kate Volkova-26': 'V',
  'Mark Sidorov-25': 'W',
  'Mark Sidorov-26': 'W',
  'Olga Romanenko-19': 'S',
  'Olga Romanenko-20': 'S',
  'Olga Romanenko-21': 'S',
  'Olga Romanenko-22': 'S',
}

export type WorkMeta = {
  bg: string
  name: string
  hours: number
  window: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
}

export function workMeta(shift: ShiftType, labels: GridPreviewLabels): WorkMeta {
  if (shift === 'morning') {
    return { bg: 'var(--st-work-morning)', name: labels.shiftMorning, hours: 8, window: '09–17', Icon: Sun }
  }
  if (shift === 'evening') {
    return { bg: 'var(--st-work-evening)', name: labels.shiftEvening, hours: 8, window: '14–22', Icon: Sunset }
  }
  return { bg: 'var(--st-work-night)', name: labels.shiftNight, hours: 10, window: '22–08', Icon: Moon }
}

// Short shift window for narrow cells — must agree with workMeta windows.
export function compactShiftWindow(shift: ShiftType): string {
  return shift === 'night' ? '22–8' : shift === 'evening' ? '14–22' : '9–17'
}

function statusIcon(code: Status): ComponentType<{ size?: number; style?: React.CSSProperties }> | null {
  if (code === 'V') return TreePalm
  if (code === 'S') return Thermometer
  if (code === 'U') return AlertCircle
  return null
}

// Dashed orange edge marking the problem column. Applied per-cell so it scrolls naturally.
function problemColumnStyle(ci: number, highlighted = true): React.CSSProperties {
  if (!highlighted || ci !== PROBLEM_DAY_IDX) return {}
  return {
    borderLeft: '1.5px dashed var(--accent)',
    borderRight: '1.5px dashed var(--accent)',
    background: 'rgba(217,119,87,0.08)',
  }
}

// Tooltip text for a cell — derives from status code + shift type.
function cellTooltip(code: Status, shift: ShiftType, labels: GridPreviewLabels): string {
  if (code === 'V') return labels.shifts.vacation
  if (code === 'S') return labels.shifts.sick
  if (code === 'D') return labels.shifts.dayoff
  if (code === 'U') return labels.shifts.unfilled
  if (code === 'W') return labels.shifts[shift]
  return ''
}

function aiCellAnimation(isOptimized: boolean, isShiftSource: boolean, isShiftTarget: boolean): string {
  if (isShiftTarget) return 'smengo-ai-shift-fill 640ms ease-out'
  if (isShiftSource) return 'smengo-ai-shift-vacate 640ms ease-out'
  if (isOptimized) return 'smengo-ai-cell-pop 680ms cubic-bezier(.22,1,.36,1)'
  return 'none'
}

function normalizedScheduleStatus(
  statusOf: (name: string, dayIdx: number, base: string) => Status,
  emp: EmpDef,
  dayIdx: number,
): Status {
  const s = statusOf(emp.name, dayIdx, emp.s)
  return s === 'U' && dayIdx !== PROBLEM_DAY_IDX ? 'W' : s
}

function onShiftCountsForRows(
  rows: EmpDef[],
  statusOf: (name: string, dayIdx: number, base: string) => Status,
  days: MonthDay[],
) {
  return days.map((_d, dayIdx) => rows.reduce((count, emp) => (
    normalizedScheduleStatus(statusOf, emp, dayIdx) === 'W' ? count + 1 : count
  ), 0))
}

function onShiftCountColor(count: number, total: number) {
  if (total <= 0) return 'var(--muted-foreground)'
  if (count >= total) return 'var(--success)'
  if (count >= Math.max(1, total - 2)) return 'var(--warning)'
  return 'var(--st-alert)'
}

function OnShiftCountCell({ count, total, compact = false }: { count: number; total: number; compact?: boolean }) {
  const color = onShiftCountColor(count, total)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: compact ? 14 : 16,
        paddingBottom: 2,
        borderBottom: `2px solid color-mix(in oklab, ${color} 54%, transparent)`,
        color,
        fontSize: compact ? 9.5 : 11,
        fontWeight: 800,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {count}
    </span>
  )
}

function ScheduleFooterLegend({ labels }: { labels: GridPreviewLabels }) {
  return (
    <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <FooterLegendDot color="var(--st-work-morning)" label={labels.footerLegendDay} />
      <FooterLegendDot color="var(--st-work-night)" label={labels.footerLegendNight} />
      <FooterLegendDot color="var(--st-vacation)" label={labels.footerLegendVacation} />
      <FooterLegendDot color="var(--st-sick)" label={labels.footerLegendSick} />
    </div>
  )
}

function FooterLegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        color: 'var(--muted-foreground)',
        fontSize: 10.5,
        fontWeight: 550,
        lineHeight: 1,
        letterSpacing: 0,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6.5, height: 6.5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  )
}

const ON_SHIFT_MENU_WIDTH = 196

function OnShiftScopePicker({
  labels,
  groups,
  value,
  onChange,
}: {
  labels: GridPreviewLabels
  groups: { key: string; name: string; shortName: string; rows: EmpDef[] }[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const selectableGroups = groups.filter((group) => group.rows.length > 0)
  const selectedGroup = selectableGroups.find((group) => group.key === value)
  const buttonLabel = selectedGroup?.shortName || selectedGroup?.name || labels.classicAll
  const options: { key: string; name: string }[] = [
    { key: 'all', name: labels.classicAll },
    ...selectableGroups.map((group) => ({ key: group.key, name: group.name })),
  ]

  useEffect(() => {
    if (!open) return

    const updateMenuPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return

      const estimatedHeight = options.length * 28 + 10
      const maxLeft = Math.max(8, window.innerWidth - ON_SHIFT_MENU_WIDTH - 8)
      const maxTop = Math.max(8, window.innerHeight - estimatedHeight - 8)
      const topAbove = rect.top - estimatedHeight - 6
      const top = topAbove >= 8 ? topAbove : Math.min(maxTop, rect.bottom + 6)

      setMenuPos({
        left: Math.min(maxLeft, Math.max(8, rect.right - ON_SHIFT_MENU_WIDTH)),
        top: Math.max(8, top),
      })
    }

    updateMenuPosition()

    const onDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }

    window.addEventListener('mousedown', onDown)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, options.length])

  const pick = (next: string) => {
    onChange(next)
    setOpen(false)
  }

  const menu = open && menuPos && typeof document !== 'undefined'
    ? createPortal(
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          left: menuPos.left,
          top: menuPos.top,
          zIndex: 5000,
          width: ON_SHIFT_MENU_WIDTH,
          padding: 5,
          border: '1px solid var(--border)',
          borderRadius: 9,
          background: 'var(--surface)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.24)',
          textTransform: 'none',
        }}
      >
        {options.map((item) => {
          const active = item.key === (selectedGroup ? value : 'all')
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => pick(item.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                border: 0,
                borderRadius: 6,
                background: active ? 'color-mix(in oklab, var(--accent) 13%, var(--grid-cell))' : 'transparent',
                color: 'var(--foreground)',
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: active ? 700 : 550,
                lineHeight: 1.1,
                textAlign: 'left',
                whiteSpace: 'nowrap',
                textTransform: 'none',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              {active && <Check style={{ width: 12, height: 12, color: 'var(--accent)', flexShrink: 0 }} />}
            </button>
          )
        })}
      </div>,
      document.body,
    )
    : null

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        style={{
          height: 20,
          maxWidth: 104,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          border: '1px solid var(--border)',
          borderRadius: 999,
          background: 'var(--grid-pill-bg)',
          color: 'var(--muted-foreground)',
          padding: '0 7px',
          cursor: 'pointer',
          fontSize: 9.5,
          fontWeight: 650,
          lineHeight: 1,
          letterSpacing: 0,
          textTransform: 'none',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buttonLabel}</span>
        <ChevronDown style={{ width: 10, height: 10, flexShrink: 0 }} />
      </button>
      {menu}
    </div>
  )
}

export function setEmployeeRowDragImage(e: React.DragEvent<HTMLElement>, rowEl: HTMLElement | null) {
  if (!rowEl || typeof document === 'undefined') return

  const rect = rowEl.getBoundingClientRect()
  const isTableRow = rowEl.tagName.toLowerCase() === 'tr'
  const wrapper = document.createElement(isTableRow ? 'table' : 'div')
  const clone = rowEl.cloneNode(true) as HTMLElement

  if (isTableRow) {
    const tbody = document.createElement('tbody')
    tbody.appendChild(clone)
    wrapper.appendChild(tbody)
    wrapper.style.borderCollapse = 'collapse'
  } else {
    wrapper.appendChild(clone)
  }

  Object.assign(wrapper.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    pointerEvents: 'none',
    zIndex: '9999',
    opacity: '0.96',
    filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.18))',
  })
  Object.assign(clone.style, {
    width: `${rect.width}px`,
    background: 'var(--grid-cell)',
  })

  document.body.appendChild(wrapper)
  e.dataTransfer.setDragImage(
    wrapper,
    Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
    Math.max(0, Math.min(e.clientY - rect.top, rect.height)),
  )
  window.setTimeout(() => wrapper.remove(), 0)
}

export function GridPreview({ labels }: { labels: GridPreviewLabels }) {
  const [mode, setMode] = useState<Mode>('compact')
  const [activeTab, setActiveTab] = useState<GridTab>('schedule')
  const [employeeView, setEmployeeView] = useState<EmployeeDirectoryView>('cards')
  const [contrast, setContrast] = useState(true)
  const [strongWeekend, setStrongWeekend] = useState(false)
  const [showTimes, setShowTimes] = useState(true)
  const [merged, setMerged] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [sticky, setSticky] = useState(true)
  const [onShiftScope, setOnShiftScope] = useState('all')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showTimer, setShowTimer] = useState(true)
  const [showToday, setShowToday] = useState(true)
  const [theme, setTheme] = useState<'standard' | 'classic'>('standard')
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement | null>(null)
  const [showTelegram, setShowTelegram] = useState(false)
  const [showEmployeeRole, setShowEmployeeRole] = useState(true)
  const [showEmployeeDepartment, setShowEmployeeDepartment] = useState(true)
  const [showEmployeeDot, setShowEmployeeDot] = useState(true)
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null)
  const [monthIdx, setMonthIdx] = useState(2) // May
  const [deptFilter, setDeptFilter] = useState<DeptKey>('all')
  const [deptOpen, setDeptOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [projectModal, setProjectModal] = useState<ProjectKey | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editCell, setEditCell] = useState<{ name: string; day: number; px: number; py: number } | null>(null)
  const [overrides, setOverrides] = useState<Record<string, Status>>({})
  const [aiOverrides, setAiOverrides] = useState<Record<string, Status>>({})
  const [aiState, setAiState] = useState<'idle' | 'running' | 'done'>('idle')
  const [aiRun, setAiRun] = useState(0)
  const [aiMonthIdx, setAiMonthIdx] = useState<number | null>(null)
  const [demoEmps, setDemoEmps] = useState<EmpDef[]>([])

  // Custom sections + role overrides + custom order per employee (persisted)
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [empRoleOverrides, setEmpRoleOverrides] = useState<Record<string, RoleOrSectionKey>>({})
  const [empSpecialtyOverrides, setEmpSpecialtyOverrides] = useState<Record<string, string>>({})
  const [departmentRoleOverrides, setDepartmentRoleOverrides] = useState<Record<string, string[]>>({})
  const [departmentColorOverrides, setDepartmentColorOverrides] = useState<Record<string, string>>({})
  const [specialtyColorOverrides, setSpecialtyColorOverrides] = useState<Record<string, string>>({})
  const [empOrder, setEmpOrder] = useState<string[]>([])
  const [storedGridStateLoaded, setStoredGridStateLoaded] = useState(false)
  const [rolePickerFor, setRolePickerFor] = useState<string | null>(null)
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [dragEmp, setDragEmp] = useState<string | null>(null)
  const [dragOverEmp, setDragOverEmp] = useState<string | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)

  // Persist to localStorage
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem('smengo:demo:gridState')
        if (!raw) {
          setStoredGridStateLoaded(true)
          return
        }
        const parsed = JSON.parse(raw) as {
          sections?: CustomSection[]
          overrides?: Record<string, RoleOrSectionKey>
          specialtyOverrides?: Record<string, string>
          departmentRoleOverrides?: Record<string, string[]>
          departmentColorOverrides?: Record<string, string>
          specialtyColorOverrides?: Record<string, string>
          order?: string[]
        }
        if (parsed.sections) setCustomSections(parsed.sections)
        const migratedSpecialties = { ...(parsed.specialtyOverrides ?? {}) }
        if (parsed.overrides) {
          const migratedOverrides = { ...parsed.overrides }
          for (const [name, departmentKey] of Object.entries(migratedOverrides)) {
            if (departmentKey === 'salesLead') {
              migratedOverrides[name] = 'salesDepartment'
              migratedSpecialties[name] = 'salesLead'
            } else if (departmentKey === 'projectManager') {
              migratedOverrides[name] = 'developmentDepartment'
              migratedSpecialties[name] = 'projectManager'
            }
          }
          setEmpRoleOverrides(migratedOverrides)
        }
        setEmpSpecialtyOverrides(migratedSpecialties)
        if (parsed.departmentRoleOverrides) setDepartmentRoleOverrides(parsed.departmentRoleOverrides)
        if (parsed.departmentColorOverrides) setDepartmentColorOverrides(parsed.departmentColorOverrides)
        if (parsed.specialtyColorOverrides) setSpecialtyColorOverrides(parsed.specialtyColorOverrides)
        if (parsed.order) setEmpOrder(parsed.order)
      } catch { /* ignore */ }
      setStoredGridStateLoaded(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => {
    if (!storedGridStateLoaded) return
    try {
      localStorage.setItem('smengo:demo:gridState', JSON.stringify({
        sections: customSections,
        overrides: empRoleOverrides,
        specialtyOverrides: empSpecialtyOverrides,
        departmentRoleOverrides,
        departmentColorOverrides,
        specialtyColorOverrides,
        order: empOrder,
      }))
    } catch { /* ignore */ }
  }, [customSections, empRoleOverrides, empSpecialtyOverrides, departmentRoleOverrides, departmentColorOverrides, specialtyColorOverrides, empOrder, storedGridStateLoaded])

  function getEmpRoleKey(emp: EmpDef): RoleOrSectionKey {
    return empRoleOverrides[emp.name] ?? emp.roleKey
  }
  function getEmpSpecialtyKey(emp: EmpDef): string {
    return normalizeSpecialtyKey(empSpecialtyOverrides[emp.name] ?? emp.specialty)
  }
  function getEmpSpecialty(emp: EmpDef): string {
    return specialtyLabelFor(getEmpSpecialtyKey(emp), labels)
  }
  function getRoleLabel(key: RoleOrSectionKey): string {
    if (typeof key === 'string' && key.startsWith('cs:')) {
      return customSections.find((c) => c.key === key)?.name ?? key
    }
    return labels.roles[key as RoleKey] ?? String(key)
  }
  function getRoleShortLabel(key: RoleOrSectionKey): string {
    if (typeof key === 'string' && key.startsWith('cs:')) {
      return customSections.find((c) => c.key === key)?.name ?? key
    }
    return labels.roleShortLabels[key as RoleKey] ?? getRoleLabel(key)
  }
  function getRoleColor(key: RoleOrSectionKey): string {
    const override = departmentColorOverrides[String(key)]
    if (override) return override
    if (typeof key === 'string' && key.startsWith('cs:')) {
      return customSections.find((c) => c.key === key)?.color ?? 'var(--muted-foreground)'
    }
    return ROLE_COLORS[key as RoleKey] ?? 'var(--muted-foreground)'
  }
  function getSpecialtyColor(role: string): string {
    const key = normalizeSpecialtyKey(role)
    return specialtyColorOverrides[key] ?? SPECIALTY_COLORS[key] ?? SPECIALTY_FALLBACK_COLORS[stableHash(key) % SPECIALTY_FALLBACK_COLORS.length]
  }
  function salesSpecialtyRank(emp: EmpDef): number {
    const key = normalizeSpecialtyKey(getEmpSpecialtyKey(emp))
    return SALES_SPECIALTY_SORT[key] ?? 99
  }
  function rolesForDepartmentKey(key: RoleOrSectionKey): string[] {
    const keyString = String(key)
    const defaults = DEFAULT_DEPARTMENT_ROLES[key as RoleKey] ?? []
    const assigned = allEmps
      .filter((emp) => String(getEmpRoleKey(emp)) === keyString)
      .map((emp) => getEmpSpecialtyKey(emp))
    const custom = departmentRoleOverrides[keyString] ?? []
    return Array.from(new Set([...defaults, ...assigned, ...custom]))
  }
  function onPickSpecialty(empName: string, role: string) {
    setEmpSpecialtyOverrides((prev) => ({ ...prev, [empName]: normalizeSpecialtyKey(role) }))
  }
  function onPickDepartmentForEmp(empName: string, key: RoleOrSectionKey) {
    const emp = allEmps.find((item) => item.name === empName)
    const currentRole = emp ? getEmpSpecialtyKey(emp) : ''
    const nextRoles = rolesForDepartmentKey(key)
    setEmpRoleOverrides((prev) => ({ ...prev, [empName]: key }))
    if (nextRoles.length > 0 && !nextRoles.includes(currentRole)) {
      setEmpSpecialtyOverrides((prev) => ({ ...prev, [empName]: nextRoles[0] }))
    }
  }
  function makeCustomSectionKey(): string {
    const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    return `cs:${rand}`
  }
  function onCreateDepartmentFromPicker(name: string, color: string): RoleOrSectionKey {
    const key = makeCustomSectionKey()
    const section = { key, name, color }
    setCustomSections((prev) => [...prev, section])
    setDepartmentColorOverrides((prev) => ({ ...prev, [key]: color }))
    setDepartmentRoleOverrides((prev) => ({ ...prev, [key]: prev[key] ?? [] }))
    return key
  }
  function onCreateDepartmentRole(departmentKey: RoleOrSectionKey, role: string, color: string) {
    const key = String(departmentKey)
    setDepartmentRoleOverrides((prev) => {
      const current = prev[key] ?? []
      return current.includes(role) ? prev : { ...prev, [key]: [...current, role] }
    })
    setSpecialtyColorOverrides((prev) => ({ ...prev, [role]: color }))
  }
  function onCreateSection(section: CustomSection) {
    setCustomSections((prev) => [...prev, section])
  }
  function handleReset() {
    try { localStorage.removeItem('smengo:demo:gridState') } catch { /* ignore */ }
    setCustomSections([])
    setEmpRoleOverrides({})
    setEmpSpecialtyOverrides({})
    setDepartmentRoleOverrides({})
    setDepartmentColorOverrides({})
    setSpecialtyColorOverrides({})
    setEmpOrder([])
    setMode('compact')
    setActiveTab('schedule')
    setEmployeeView('cards')
    setContrast(true)
    setStrongWeekend(false)
    setShowTimes(true)
    setMerged(false)
    setShowGrid(false)
    setSticky(true)
    setOnShiftScope('all')
    setShowTimer(true)
    setShowToday(true)
    setShowEmployeeRole(true)
    setShowEmployeeDepartment(true)
    setShowEmployeeDot(true)
    setSelectedEmp(null)
    setMonthIdx(2)
    setDeptFilter('all')
    setEditMode(false)
    setTheme('standard')
    setOverrides({})
    setAiOverrides({})
    setAiState('idle')
    setAiRun(0)
    setAiMonthIdx(null)
  }
  function onMoveEmp(srcName: string, targetName: string | null, targetGroupKey: RoleOrSectionKey | null) {
    if (!srcName) return
    // Update role if dropping on a different group
    if (targetGroupKey !== null) {
      setEmpRoleOverrides((prev) => ({ ...prev, [srcName]: targetGroupKey }))
    }
    // Update order: place src right before/at target name (or end if null)
    setEmpOrder((prev) => {
      const everyone = [...BASE_EMPLOYEES.map((e) => e.name), ...demoEmps.map((e) => e.name)]
      const base = prev.length ? prev.filter((n) => everyone.includes(n)) : everyone.slice()
      const withoutSrc = base.filter((n) => n !== srcName)
      if (targetName && targetName !== srcName) {
        const idx = withoutSrc.indexOf(targetName)
        if (idx >= 0) {
          withoutSrc.splice(idx, 0, srcName)
          return withoutSrc
        }
      }
      withoutSrc.push(srcName)
      return withoutSrc
    })
  }

  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSec, setTimerSec] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const settingsRef = useRef<HTMLDivElement | null>(null)
  const deptRef = useRef<HTMLDivElement | null>(null)
  const editCellRef = useRef<HTMLDivElement | null>(null)
  const notifRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)
  const toastTimer = useRef<number | null>(null)
  const aiApplyTimer = useRef<number | null>(null)
  const aiDoneTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!timerRunning) return
    const id = window.setInterval(() => setTimerSec((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [timerRunning])

  useEffect(() => {
    return () => {
      if (aiApplyTimer.current) window.clearTimeout(aiApplyTimer.current)
      if (aiDoneTimer.current) window.clearTimeout(aiDoneTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!notifOpen) return
    function onDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [notifOpen])

  useEffect(() => {
    if (!userOpen) return
    function onDown(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [userOpen])

  function fmtTime(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}`
  }

  useEffect(() => {
    if (!settingsOpen) return
    function onDown(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [settingsOpen])

  useEffect(() => {
    if (!themeOpen) return
    function onDown(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [themeOpen])

  useEffect(() => {
    if (!deptOpen) return
    function onDown(e: MouseEvent) {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [deptOpen])

  useEffect(() => {
    if (!editCell) return
    function onDown(e: MouseEvent) {
      if (editCellRef.current && !editCellRef.current.contains(e.target as Node)) {
        setEditCell(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [editCell])

  function showToast(text: string) {
    setToast(text)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }

  function chipBg(code: Exclude<Status, '-'>): string {
    if (code === 'D') return 'var(--chip-d-bg)'
    if (contrast) {
      const map = {
        W: 'var(--st-work)',
        V: 'var(--st-vacation)',
        S: 'var(--st-sick)',
        D: 'var(--chip-d-bg)',
        U: 'var(--st-uncovered)',
      }
      return map[code]
    }
    return `var(--chip-${code.toLowerCase()}-bg)`
  }
  function chipFg(code: Exclude<Status, '-'>): string {
    if (code === 'D') return 'var(--chip-d-fg)'
    if (contrast) return '#fff'
    return `var(--chip-${code.toLowerCase()}-fg)`
  }

  const weekendBg = strongWeekend ? 'var(--accent-soft)' : 'var(--grid-weekend)'
  const monthLabel = labels.months[monthIdx]
  const monthOffset = scheduleOffsetForMonth(monthIdx)
  const days = monthDays(monthIdx)
  const lastMonthIdx = labels.months.length - 1

  const allEmps = [...BASE_EMPLOYEES, ...demoEmps]
  const aiOptimized = aiState === 'done' && aiMonthIdx === monthIdx
  const coverageSummary = aiOptimized ? labels.aiOptimizedSummary : labels.coverageSummary
  const optimizedCellKeys = AI_OPTIMIZED_CELLS.reduce<Record<string, true>>((acc, cell) => {
    acc[`${cell.name}-${cell.day}`] = true
    return acc
  }, {})
  const shiftedFromCellKeys = AI_SHIFT_MOVES.reduce<Record<string, true>>((acc, cell) => {
    acc[`${cell.name}-${cell.fromDay}`] = true
    return acc
  }, {})
  const shiftedToCellKeys = AI_SHIFT_MOVES.reduce<Record<string, true>>((acc, cell) => {
    acc[`${cell.name}-${cell.toDay}`] = true
    return acc
  }, {})

  function statusOf(name: string, dayIdx: number, base: string): Status {
    const key = `${name}-${dayIdx}-${monthIdx}`
    if (overrides[key]) return overrides[key]
    if (aiOverrides[key]) return aiOverrides[key]
    const defaultOverride = DEFAULT_SCHEDULE_OVERRIDES[`${name}-${dayIdx}`]
    if (defaultOverride) return defaultOverride
    const rotated = rotateSchedule(base, monthOffset)
    return (rotated[dayIdx % 14] ?? 'W') as Status
  }

  function setStatusOf(name: string, dayIdx: number, s: Status) {
    setOverrides((prev) => ({ ...prev, [`${name}-${dayIdx}-${monthIdx}`]: s }))
  }

  function runAiOptimization() {
    if (aiState !== 'idle') return
    if (aiApplyTimer.current) window.clearTimeout(aiApplyTimer.current)
    if (aiDoneTimer.current) window.clearTimeout(aiDoneTimer.current)
    setSelectedEmp(null)
    setEditCell(null)
    setEditMode(false)
    setAiState('running')
    setAiMonthIdx(monthIdx)
    setAiRun((n) => n + 1)

    aiApplyTimer.current = window.setTimeout(() => {
      setAiOverrides((prev) => {
        const next = { ...prev }
        for (const cell of AI_OPTIMIZED_CELLS) {
          next[`${cell.name}-${cell.day}-${monthIdx}`] = cell.status
        }
        return next
      })
      setAiRun((n) => n + 1)
    }, 540)

    aiDoneTimer.current = window.setTimeout(() => {
      setAiState('done')
    }, 1450)
  }

  const CHIP_LBL: Record<Exclude<Status, '-'>, string> = {
    W: labels.statusWork, V: labels.statusVac, S: labels.statusSick,
    D: labels.statusOff,  U: labels.statusUncovered,
  }
  const CHIP_LBL_FULL: Record<Exclude<Status, '-'>, string> = {
    W: labels.statusWorkFull, V: labels.statusVac, S: labels.statusSick,
    D: labels.statusOff, U: labels.statusUncovered,
  }

  function onDeptPick(d: DeptKey) {
    setDeptFilter(d)
    setDeptOpen(false)
  }

  function onAddEmployee() {
    if (demoEmps.length >= 4) return
    const idx = demoEmps.length + 1
    const tg = `@new_user${idx}`
    const template = BASE_EMPLOYEES[(idx - 1) % BASE_EMPLOYEES.length]
    setDemoEmps((prev) => [...prev, {
      dept: 'sales',
      name: `${labels.newEmployee} ${idx}`,
      tg,
      pIdx: ((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
      roleKey: 'salesDepartment',
      specialty: idx % 2 === 0 ? 'retention' : 'sales',
      s: template.s,
      shift: template.shift,
    }])
    showToast(labels.toastAdded)
  }

  function onTelegramClick(tg: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tg).catch(() => {})
    }
    showToast(labels.toastCopied)
  }

  function displayNameForKey(name: string): string {
    const emp = allEmps.find((item) => item.name === name)
    return emp ? employeeDisplayName(emp, labels) : name
  }

  const deptOptions: { k: DeptKey; label: string }[] = [
    { k: 'all',       label: labels.allDepts },
    { k: 'sales',     label: labels.deptSales },
    { k: 'ops',       label: labels.deptOps },
    { k: 'support',   label: labels.deptSupport },
    { k: 'marketing', label: labels.deptMarketing },
    { k: 'design',    label: labels.deptDesign },
  ]

  function deptLabel(d: Exclude<DeptKey, 'all'>): string {
    return d === 'sales' ? labels.deptSales
      : d === 'ops' ? labels.deptOps
      : d === 'support' ? labels.deptSupport
      : d === 'marketing' ? labels.deptMarketing
      : labels.deptDesign
  }

  // Build groups including demo dept
  const baseDeptOrder: Exclude<DeptKey, 'all'>[] =
    deptFilter === 'all'
      ? ['sales', 'ops', 'support', 'marketing', 'design']
      : [deptFilter]

  // Build role-based groups (respecting dept filter)
  const flatEmps: EmpDef[] = []
  for (const d of baseDeptOrder) {
    for (const e of BASE_EMPLOYEES) if (e.dept === d) flatEmps.push(e)
  }
  if (demoEmps.length > 0 && deptFilter === 'all') flatEmps.push(...demoEmps)
  // Apply custom order (if set)
  const orderedEmps: EmpDef[] = empOrder.length
    ? (() => {
        const map = new Map(flatEmps.map((e) => [e.name, e]))
        const out: EmpDef[] = []
        for (const n of empOrder) { const e = map.get(n); if (e) { out.push(e); map.delete(n) } }
        for (const e of map.values()) out.push(e)
        return out
      })()
    : flatEmps
  const roleOrderSt: RoleOrSectionKey[] = []
  const roleGroupMapSt = new Map<RoleOrSectionKey, EmpDef[]>()
  for (const emp of orderedEmps) {
    const rk = getEmpRoleKey(emp)
    if (!roleGroupMapSt.has(rk)) {
      roleOrderSt.push(rk)
      roleGroupMapSt.set(rk, [])
    }
    roleGroupMapSt.get(rk)!.push(emp)
  }
  // Append empty custom sections (so user can drop into them)
  for (const cs of customSections) {
    if (!roleGroupMapSt.has(cs.key)) {
      roleOrderSt.push(cs.key)
      roleGroupMapSt.set(cs.key, [])
    }
  }
  const groups: { key: string; name: string; shortName: string; min?: number; rows: EmpDef[] }[] =
    roleOrderSt.map((rk) => {
      const rows = roleGroupMapSt.get(rk)!
      return {
        key: String(rk),
        name: getRoleLabel(rk),
        shortName: getRoleShortLabel(rk),
        rows: String(rk) === 'salesDepartment'
          ? [...rows].sort((a, b) => salesSpecialtyRank(a) - salesSpecialtyRank(b))
          : rows,
      }
    })
  const departmentRoleItemsByKey = Object.fromEntries(
    ([...DEPARTMENT_ROLE_KEYS, ...customSections.map((section) => section.key)] as RoleOrSectionKey[]).map((key) => [
      String(key),
      rolesForDepartmentKey(key).map((role) => ({ key: role, label: specialtyLabelFor(role, labels), color: getSpecialtyColor(role) })),
    ]),
  )

  let todayOnShift = 0, todayOff = 0
  for (const emp of allEmps) {
    const s = statusOf(emp.name, PROBLEM_DAY_IDX, emp.s)
    if (s === 'W') todayOnShift++
    else if (s === 'V' || s === 'S' || s === 'D') todayOff++
  }
  const rolePickerEmp = rolePickerFor ? allEmps.find((e) => e.name === rolePickerFor) ?? null : null

  return (
    <div style={{ position: 'relative' }}>
      {/* Top controls: mode toggle + settings */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <div
          data-mode-pill
          className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-border p-1 sm:w-auto"
          style={{ background: 'var(--grid-pill-bg)' }}
        >
          {(['compact', 'detail', 'extended'] as const).map((m) => {
            const lbl = m === 'detail' ? labels.modeDetail : m === 'compact' ? labels.modeCompact : labels.modeExtended
            const active = mode === m
            return (
              <button
                key={m}
                type="button"
                data-active={active}
                onClick={() => setMode(m)}
                className="flex-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors sm:flex-none sm:px-4"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--muted-foreground)',
                }}
              >
                {lbl}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">

        <div ref={settingsRef} className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label={labels.displayLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            style={{ background: 'var(--grid-pill-bg)' }}
          >
            <Settings2 className="h-4 w-4" />
          </button>
          {settingsOpen && (
            <div
              className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-border p-3 text-[13px] shadow-lg max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2"
              style={{ background: 'var(--surface)' }}
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.displayLabel}
              </div>
              <SettingRow label={labels.highContrastLabel} value={contrast} onChange={setContrast} />
              <SettingRow label={labels.highlightWeekendsLabel} value={strongWeekend} onChange={setStrongWeekend} />
              <SettingRow label={labels.showTimesLabel} value={showTimes} onChange={setShowTimes} />
              <SettingRow label={labels.mergedLabel} value={merged} onChange={setMerged} />
              <SettingRow label={labels.gridLabel} value={showGrid} onChange={setShowGrid} />
              <SettingRow label={labels.stickyLabel} value={sticky} onChange={setSticky} />
              <SettingRow label={labels.timerLabel} value={showTimer} onChange={setShowTimer} />
              <SettingRow label={labels.todayLabel} value={showToday} onChange={setShowToday} />
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                {sticky && (
                  <SettingRow label={labels.showEmployeeDepartmentLabel} value={showEmployeeDepartment} onChange={setShowEmployeeDepartment} />
                )}
                <SettingRow label={labels.showEmployeeRoleLabel} value={showEmployeeRole} onChange={setShowEmployeeRole} />
                <SettingRow label={labels.showEmployeeDotLabel} value={showEmployeeDot} onChange={setShowEmployeeDot} />
              </div>
            </div>
          )}
        </div>

        <div ref={themeRef} className="relative">
          <button
            type="button"
            onClick={() => setThemeOpen((v) => !v)}
            aria-label={labels.themeLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            style={{ background: 'var(--grid-pill-bg)' }}
          >
            <Palette className="h-4 w-4" />
          </button>
          {themeOpen && (
            <div
              className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-border p-2 text-[13px] shadow-lg max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2"
              style={{ background: 'var(--surface)' }}
            >
              <div className="mb-1 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.themeLabel}
              </div>
              {(['standard', 'classic'] as const).map((t) => {
                const active = theme === t
                const isClassic = t === 'classic'
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTheme(t); setThemeOpen(false) }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"
                    style={{
                      background: active ? 'var(--accent-soft)' : 'transparent',
                    }}
                  >
                    <span
                      style={isClassic
                        ? {
                            fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
                            fontSize: 15, fontWeight: 500,
                            color: '#1a1f2e',
                            background: '#ffffff',
                            border: '1px solid #e3e6ea',
                            padding: '2px 10px', borderRadius: 4,
                            letterSpacing: '-0.01em',
                          }
                        : {
                            fontFamily: 'inherit',
                            fontSize: 13, fontWeight: 600,
                            color: 'var(--accent)',
                            letterSpacing: '0.01em',
                          }
                      }
                    >
                      {isClassic ? labels.themeClassic : labels.themeStandard}
                    </span>
                    {active && <Check className="h-4 w-4" style={{ color: 'var(--accent)' }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

          <button
            type="button"
            onClick={handleReset}
            title={labels.resetBtn}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            style={{ background: 'var(--grid-pill-bg)' }}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="smengo-ai-grid-stage" data-ai-state={aiState} style={{ position: 'relative' }}>
      {theme === 'classic' ? (
        <ClassicGrid
          labels={labels}
          mode={mode}
          monthIdx={monthIdx}
          setMonthIdx={setMonthIdx}
          deptFilter={deptFilter}
          showTimer={showTimer}
          showToday={showToday}
          contrast={contrast}
          strongWeekend={strongWeekend}
          showTimes={showTimes}
          merged={merged}
          showGrid={showGrid}
          sticky={sticky}
          customSections={customSections}
          empOrder={empOrder}
          getEmpRoleKey={getEmpRoleKey}
          getRoleLabel={getRoleLabel}
          getRoleColor={getRoleColor}
          onOpenRolePicker={(name) => setRolePickerFor(name)}
          onOpenAddSection={() => setAddSectionOpen(true)}
          onMoveEmp={onMoveEmp}
          dragEmp={dragEmp}
          setDragEmp={setDragEmp}
          dragOverEmp={dragOverEmp}
          setDragOverEmp={setDragOverEmp}
          dragOverGroup={dragOverGroup}
          setDragOverGroup={setDragOverGroup}
          optimizedOverrides={aiOverrides}
          optimizedCellKeys={optimizedCellKeys}
          optimizationRun={aiRun}
          optimizationState={aiState}
          coverageSummary={coverageSummary}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          employeeView={employeeView}
          onEmployeeViewChange={setEmployeeView}
        />
      ) : (
      <div
        style={{
          background: 'var(--grid-cell)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,.06), 0 12px 48px rgba(0,0,0,.10)',
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {/* Default chrome bar - hidden on mobile (decorative) */}
        <div className="hidden sm:contents">
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', background: 'var(--grid-chrome)',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500 }}>
            smengo · {monthLabel}
          </span>
          <DemoTabs active={activeTab} labels={labels} onChange={setActiveTab} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {showToday && (
              <TodayStatusChip
                labels={labels}
                onShift={todayOnShift}
                offToday={todayOff}
              />
            )}
            {showTimer && (
            <>
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 13, fontWeight: 600, letterSpacing: 1,
                color: timerRunning ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.2s',
              }}
            >
              {fmtTime(timerSec)}
            </span>
            <button
              type="button"
              onClick={() => setTimerRunning((v) => !v)}
              aria-label={timerRunning ? labels.ariaTimerPause : labels.ariaTimerStart}
              className="cursor-pointer transition-transform hover:scale-110"
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: timerRunning ? '#e0a93a' : '#28c840',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: timerRunning ? '0 1px 3px rgba(224,169,58,.4)' : '0 1px 3px rgba(40,200,64,.35)',
                border: 0, padding: 0,
              }}
            >
              {timerRunning ? (
                <svg width="8" height="9" viewBox="0 0 8 9" fill="#fff">
                  <rect x="1" y="0.5" width="2" height="8" rx="0.5" />
                  <rect x="5" y="0.5" width="2" height="8" rx="0.5" />
                </svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 8 8" fill="#fff" style={{ marginLeft: 1 }}>
                  <path d="M1 0.5 L7 4 L1 7.5 Z" />
                </svg>
              )}
            </button>
            </>
            )}

            <div ref={notifRef} style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                onClick={() => { setNotifOpen((v) => !v); setUserOpen(false) }}
                aria-label={labels.ariaNotifications}
                className="cursor-pointer transition-colors hover:opacity-80"
                style={{
                  background: 'transparent', border: 0, padding: 2,
                  display: 'inline-flex', alignItems: 'center', position: 'relative',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span style={{
                  position: 'absolute', top: 1, right: 1,
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 0 1.5px var(--grid-chrome)',
                }} />
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 z-30 mt-2 rounded-xl border border-border shadow-lg"
                  style={{
                    top: '100%', background: 'var(--surface)',
                    width: 260, padding: 8, fontSize: 12,
                  }}
                >
                  <div style={{
                    padding: '6px 8px 8px',
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: 'var(--muted-foreground)',
                  }}>
                    {labels.shortageLabel}
                  </div>
                  <div style={{
                    display: 'flex', gap: 8, padding: '8px',
                    borderRadius: 6, background: 'var(--accent-soft)',
                    color: 'var(--foreground)', lineHeight: 1.35,
                  }}>
                    <AlertCircle style={{ width: 14, height: 14, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
                    <span>{coverageSummary}</span>
                  </div>
                </div>
              )}
            </div>

            <div ref={userRef} style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                onClick={() => { setUserOpen((v) => !v); setNotifOpen(false) }}
                aria-label={labels.ariaUserMenu}
                className="cursor-pointer transition-transform hover:scale-105"
                style={{ background: 'transparent', border: 0, padding: 0, borderRadius: '50%' }}
              >
                <Avatar name="Olga Romanenko" size={22} />
              </button>
              {userOpen && (
                <div
                  className="absolute right-0 z-30 mt-2 rounded-xl border border-border shadow-lg"
                  style={{
                    top: '100%', background: 'var(--surface)',
                    width: 200, padding: 10, fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <Avatar name="Olga Romanenko" size={28} />
                    <div style={{ lineHeight: 1.25, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: 12 }}>{labels.employeeNames.olgaRomanenko}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>olga@smengo.app</div>
                    </div>
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    {[labels.editBtn, labels.exportBtn].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setUserOpen(false)}
                        className="block w-full text-left cursor-pointer transition-colors hover:bg-muted rounded"
                        style={{
                          background: 'transparent', border: 0,
                          padding: '6px 8px', fontSize: 12, color: 'var(--foreground)',
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>


        {/* App topbar */}
        <div
          data-grid-topbar
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderBottom: '1px solid var(--border)',
            background: 'var(--grid-cell)', flexWrap: 'wrap',
          }}
        >
          {/* Month pill */}
          {activeTab === 'schedule' && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--grid-pill-bg)', borderRadius: 6,
                padding: '4px 8px', fontSize: 11, fontWeight: 500,
                color: 'var(--foreground)',
              }}
            >
              <button
                type="button"
                onClick={() => setMonthIdx((m) => Math.max(0, m - 1))}
                disabled={monthIdx === 0}
                className="cursor-pointer hover:opacity-70 disabled:cursor-default disabled:opacity-35 disabled:hover:opacity-35"
                aria-label={labels.ariaPrevMonth}
                style={{ background: 'transparent', border: 0, padding: '0 2px', color: 'inherit' }}
              >
                ‹
              </button>
              <span>{monthLabel}</span>
              <button
                type="button"
                onClick={() => setMonthIdx((m) => Math.min(lastMonthIdx, m + 1))}
                disabled={monthIdx === lastMonthIdx}
                className="cursor-pointer hover:opacity-70 disabled:cursor-default disabled:opacity-35 disabled:hover:opacity-35"
                aria-label={labels.ariaNextMonth}
                style={{ background: 'transparent', border: 0, padding: '0 2px', color: 'inherit' }}
              >
                ›
              </button>
            </div>
          )}

          {/* Dept dropdown */}
          <div ref={deptRef} className="relative">
            <button
              type="button"
              onClick={() => setDeptOpen((v) => !v)}
              className="cursor-pointer hover:opacity-80"
              style={{
                background: 'var(--grid-pill-bg)', borderRadius: 6,
                padding: '4px 8px', fontSize: 11,
                color: 'var(--muted-foreground)', border: 0,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              {deptFilter === 'all' ? labels.allDepts : deptLabel(deptFilter)}
              <ChevronDown style={{ width: 11, height: 11 }} />
            </button>
            {deptOpen && (
              <div
                className="absolute left-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border shadow-lg"
                style={{ background: 'var(--surface)' }}
              >
                {deptOptions.map((d) => (
                  <button
                    key={d.k}
                    type="button"
                    onClick={() => onDeptPick(d.k)}
                    className="block w-full px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-muted"
                    style={{
                      color: 'var(--foreground)',
                      background: deptFilter === d.k ? 'var(--accent-soft)' : 'transparent',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sm:hidden">
            <DemoTabs active={activeTab} labels={labels} onChange={setActiveTab} compact />
          </div>

          <div style={{ flex: 1 }} />

          {activeTab === 'employees' ? (
            <EmployeeViewToggle labels={labels} view={employeeView} onChange={setEmployeeView} />
          ) : (
            <>
              {/* Add Section - hidden on mobile to reduce clutter */}
              <button
                type="button"
                onClick={() => setAddSectionOpen(true)}
                className="hidden cursor-pointer transition-colors hover:opacity-80 sm:inline-block"
                style={{
                  background: 'var(--grid-pill-bg)', borderRadius: 6,
                  padding: '4px 8px', fontSize: 11,
                  color: 'var(--muted-foreground)', border: 0,
                }}
              >
                {labels.addSectionBtn}
              </button>

              {/* Edit toggle */}
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="cursor-pointer transition-colors"
                style={{
                  background: editMode ? 'var(--accent)' : 'var(--grid-pill-bg)',
                  color: editMode ? '#fff' : 'var(--muted-foreground)',
                  borderRadius: 6, padding: '4px 8px', fontSize: 11,
                  border: 0, display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <Pencil style={{ width: 11, height: 11 }} />
                {editMode ? labels.editDone : labels.editBtn}
              </button>

              {/* Export */}
              <button
                type="button"
                onClick={() => showToast(labels.toastExported)}
                className="cursor-pointer transition-colors hover:opacity-80"
                style={{
                  background: 'var(--grid-pill-bg)', borderRadius: 6,
                  padding: '4px 8px', fontSize: 11,
                  color: 'var(--muted-foreground)', border: 0,
                }}
              >
                {labels.exportBtn}
              </button>

              {/* Add employee */}
              <button
                type="button"
                onClick={onAddEmployee}
                disabled={demoEmps.length >= 4}
                className="cursor-pointer transition-colors"
                style={{
                  background: 'var(--accent)', borderRadius: 6,
                  padding: '4px 8px', fontSize: 11, fontWeight: 600,
                  color: '#fff', border: 0,
                  opacity: demoEmps.length >= 4 ? 0.5 : 1,
                  cursor: demoEmps.length >= 4 ? 'not-allowed' : 'pointer',
                }}
              >
                {labels.addEmployee}
              </button>
            </>
          )}
        </div>

        {/* Body */}
        {activeTab === 'employees' ? (
          <EmployeeDirectory
            employees={orderedEmps}
            labels={labels}
            view={employeeView}
            mode={mode}
            getEmpRoleKey={getEmpRoleKey}
            getEmpSpecialty={getEmpSpecialty}
            getRoleLabel={getRoleLabel}
            getRoleColor={getRoleColor}
            getSpecialtyColor={getSpecialtyColor}
            onCopied={() => showToast(labels.toastCopied)}
          />
        ) : mode === 'compact' ? (
          <CompactGrid
            groups={groups}
            days={days}
            statusOf={statusOf}
            weekendBg={weekendBg}
            chipBg={chipBg}
            chipFg={chipFg}
            contrast={contrast}
            labels={labels}
            showTelegram={showTelegram}
            onEmpClick={(name) => setSelectedEmp(name)}
            showTimes={showTimes}
            merged={merged}
            showGrid={showGrid}
            sticky={sticky}
            onShiftScope={onShiftScope}
            onShiftScopeChange={setOnShiftScope}
            showEmployeeRole={showEmployeeRole}
            showEmployeeDepartment={showEmployeeDepartment}
            showEmployeeDot={showEmployeeDot}
            editMode={editMode}
            onToggleProjects={() => setShowTelegram((v) => !v)}
            onProjectClick={(name, pIdx) =>
              showTelegram
                ? onTelegramClick(allEmps.find((e) => e.name === name)?.tg ?? '')
                : setProjectModal((`p${pIdx}` as ProjectKey))
            }
            onCellEdit={(name, day, px, py) => setEditCell({ name, day, px, py })}
            getEmpRoleKey={getEmpRoleKey}
            getEmpSpecialty={getEmpSpecialty}
            getRoleColor={getRoleColor}
            getSpecialtyColor={getSpecialtyColor}
            onOpenRolePicker={(name) => setRolePickerFor(name)}
            dragEmp={dragEmp}
            setDragEmp={setDragEmp}
            dragOverEmp={dragOverEmp}
            setDragOverEmp={setDragOverEmp}
            dragOverGroup={dragOverGroup}
            setDragOverGroup={setDragOverGroup}
            onMoveEmp={onMoveEmp}
            optimizedCellKeys={optimizedCellKeys}
            shiftedFromCellKeys={shiftedFromCellKeys}
            shiftedToCellKeys={shiftedToCellKeys}
            optimizationRun={aiRun}
            optimizationState={aiState}
          />
        ) : (
          <DetailGrid
            mode={mode}
            groups={groups}
            days={days}
            statusOf={statusOf}
            labels={labels}
            chipLbl={CHIP_LBL}
            chipLblFull={CHIP_LBL_FULL}
            chipBg={chipBg}
            chipFg={chipFg}
            contrast={contrast}
            weekendBg={weekendBg}
            showTimes={showTimes}
            merged={merged}
            showGrid={showGrid}
            sticky={sticky}
            onShiftScope={onShiftScope}
            onShiftScopeChange={setOnShiftScope}
            showEmployeeRole={showEmployeeRole}
            showEmployeeDepartment={showEmployeeDepartment}
            showEmployeeDot={showEmployeeDot}
            showTelegram={showTelegram}
            onEmpClick={(name) => setSelectedEmp(name)}
            onToggleProjects={() => setShowTelegram((v) => !v)}
            onProjectClick={(name, pIdx) =>
              showTelegram
                ? onTelegramClick(allEmps.find((e) => e.name === name)?.tg ?? '')
                : setProjectModal((`p${pIdx}` as ProjectKey))
            }
            editMode={editMode}
            onCellEdit={(name, day, px, py) => setEditCell({ name, day, px, py })}
            getEmpRoleKey={getEmpRoleKey}
            getEmpSpecialty={getEmpSpecialty}
            getRoleLabel={getRoleLabel}
            getRoleColor={getRoleColor}
            getSpecialtyColor={getSpecialtyColor}
            onOpenRolePicker={(name) => setRolePickerFor(name)}
            dragEmp={dragEmp}
            setDragEmp={setDragEmp}
            dragOverEmp={dragOverEmp}
            setDragOverEmp={setDragOverEmp}
            dragOverGroup={dragOverGroup}
            setDragOverGroup={setDragOverGroup}
            onMoveEmp={onMoveEmp}
            optimizedCellKeys={optimizedCellKeys}
            shiftedFromCellKeys={shiftedFromCellKeys}
            shiftedToCellKeys={shiftedToCellKeys}
            optimizationRun={aiRun}
            optimizationState={aiState}
          />
        )}

        {/* Coverage summary strip */}
        {activeTab === 'schedule' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              padding: '8px 12px',
              background: aiOptimized
                ? 'color-mix(in oklab, var(--success) 13%, transparent)'
                : contrast ? 'rgba(224, 155, 58, 0.12)' : 'rgba(224, 155, 58, 0.08)',
              borderTop: aiOptimized
                ? '1px solid color-mix(in oklab, var(--success) 32%, transparent)'
                : '1px solid rgba(224, 155, 58, 0.30)',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 16, height: 16, borderRadius: '50%',
                  background: aiOptimized ? 'var(--success)' : 'var(--warning)', color: '#fff',
                  flexShrink: 0,
                }}
              >
                {aiOptimized ? (
                  <Check style={{ width: 10, height: 10, strokeWidth: 3 }} />
                ) : (
                  <AlertTriangle style={{ width: 10, height: 10, strokeWidth: 2.5 }} />
                )}
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: aiOptimized ? 'var(--success)' : 'var(--warning)' }}>
                {coverageSummary}
              </span>
            </div>
            <ScheduleFooterLegend labels={labels} />
          </div>
        )}

        {/* Cell-edit popover — fixed so it renders above overflow:hidden tables */}
        {activeTab === 'schedule' && editCell && (
          <div
            ref={editCellRef}
            className="fixed z-[9999] rounded-lg border border-border shadow-xl"
            style={{
              background: 'var(--surface)',
              padding: 6,
              top: editCell.py,
              left: editCell.px,
              transform: 'translateX(-50%)',
              animation: 'smengo-popover-pop 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {displayNameForKey(editCell.name)}
            </div>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusOf(editCell.name, editCell.day, s)
                    setEditCell(null)
                  }}
                  className="cursor-pointer transition-transform hover:scale-105"
                  style={{
                    width: 36, height: 30, border: 0, borderRadius: 5,
                    background: s === '-' ? 'var(--muted)' : chipBg(s as Exclude<Status, '-'>),
                    color: s === '-' ? 'var(--muted-foreground)' : chipFg(s as Exclude<Status, '-'>),
                    fontSize: 10, fontWeight: 600,
                  }}
                >
                  {s === '-' ? '—' : CHIP_LBL[s as Exclude<Status, '-'>]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project modal */}
        {activeTab === 'schedule' && projectModal && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              animation: 'smengo-backdrop-in 0.22s ease-out',
            }}
            onClick={() => setProjectModal(null)}
          >
            <div
              className="rounded-xl border border-border p-5 shadow-xl"
              style={{
                background: 'var(--surface)', width: 320, maxWidth: '90%',
                animation: 'smengo-modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px',
                    borderRadius: 999, color: 'var(--accent)',
                    background: 'var(--accent-soft)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  {labels.projects[projectModal].tag}
                </span>
                <button
                  type="button"
                  onClick={() => setProjectModal(null)}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  style={{ background: 'transparent', border: 0, padding: 2 }}
                  aria-label={labels.projectClose}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <h4 className="mb-1 font-serif text-[18px] font-semibold text-foreground">
                {labels.projects[projectModal].name}
              </h4>
              <p className="text-[13px] leading-[1.55] text-muted-foreground">
                {labels.projects[projectModal].desc}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[12px]">
                <span style={{ color: 'var(--subtle)' }}>{labels.projectTeam}</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                  {allEmps.filter((e) => `p${e.pIdx}` === projectModal).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Toast (bottom-left of grid) */}
        {toast && (
          <div
            className="absolute z-50 rounded-lg shadow-lg"
            style={{
              left: 14, bottom: 14,
              background: 'var(--foreground)',
              color: 'var(--background)',
              padding: '9px 14px', fontSize: 12, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              animation: 'smengo-toast-up 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--success)', color: '#fff',
              }}
            >
              <Check style={{ width: 9, height: 9, strokeWidth: 3 }} />
            </span>
            {toast}
          </div>
        )}
      </div>
      )}
      {aiState === 'running' && (
        <div aria-hidden="true" className="smengo-ai-scan-layer">
          <span />
        </div>
      )}
      </div>

      {activeTab === 'schedule' && (
        <AiOptimizeBar labels={labels} state={aiState} onRun={runAiOptimization} />
      )}

      {/* Role picker modal (themed) */}
      {rolePickerFor && (
        <RolePickerModal
          theme="standard"
          labels={labels}
          empName={rolePickerEmp ? employeeDisplayName(rolePickerEmp, labels) : rolePickerFor}
          avatarSrc={rolePickerEmp ? avatarSrcForName(rolePickerEmp.name) : avatarSrcForName(rolePickerFor)}
          currentDepartmentKey={getEmpRoleKey(rolePickerEmp ?? BASE_EMPLOYEES[0])}
          currentRole={getEmpSpecialtyKey(rolePickerEmp ?? BASE_EMPLOYEES[0])}
          customSections={customSections}
          roleItemsByDepartment={departmentRoleItemsByKey}
          departmentColorOverrides={departmentColorOverrides}
          onPickDepartment={(key) => onPickDepartmentForEmp(rolePickerFor, key)}
          onPickRole={(role) => onPickSpecialty(rolePickerFor, role)}
          onDepartmentColorChange={(key, color) => setDepartmentColorOverrides((prev) => ({ ...prev, [String(key)]: color }))}
          onRoleColorChange={(role, color) => setSpecialtyColorOverrides((prev) => ({ ...prev, [role]: color }))}
          onCreateDepartment={onCreateDepartmentFromPicker}
          onCreateRole={onCreateDepartmentRole}
          onClose={() => setRolePickerFor(null)}
        />
      )}
      {addSectionOpen && (
        <AddSectionModal
          theme="standard"
          labels={labels}
          onCreate={onCreateSection}
          onClose={() => setAddSectionOpen(false)}
        />
      )}

      {/* Employee calendar overlay (themed, animated) */}
      <EmployeeCalendarOverlay
        empName={selectedEmp}
        emp={allEmps.find((e) => e.name === selectedEmp) ?? null}
        monthLabel={monthLabel}
        days={days}
        labels={labels}
        statusOf={statusOf}
        getEmpRoleKey={getEmpRoleKey}
        getEmpSpecialty={getEmpSpecialty}
        getRoleLabel={getRoleLabel}
        getRoleColor={getRoleColor}
        getSpecialtyColor={getSpecialtyColor}
        onClose={() => setSelectedEmp(null)}
      />
    </div>
  )
}

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #d8f0a7 0%, #89e8b6 48%, #f6d879 100%)',
  'linear-gradient(135deg, #f0d36b 0%, #18c973 52%, #2475dd 100%)',
  'linear-gradient(135deg, #9aa7ff 0%, #e9c6ee 52%, #f0ede5 100%)',
  'linear-gradient(135deg, #10d468 0%, #0ca8dd 45%, #322bc7 100%)',
  'linear-gradient(135deg, #e13bd9 0%, #ef7b42 56%, #f2d356 100%)',
  'linear-gradient(135deg, #7cc9ff 0%, #68e1a5 44%, #ffe08a 100%)',
  'linear-gradient(135deg, #ff8fa3 0%, #a971ff 50%, #39d6c2 100%)',
  'linear-gradient(135deg, #b6e880 0%, #3bb6a6 46%, #4961dd 100%)',
]

const AVATAR_IMAGES = [
  avatarWoman34.src,
  avatarMan4.src,
  avatarWoman4.src,
  avatarMan4Alt.src,
  avatarWoman12.src,
  avatarMan14.src,
  avatarWoman5Alt.src,
  avatarMan12.src,
  avatarWoman1.src,
  avatarMan3.src,
  avatarWoman5.src,
  avatarMan2.src,
  avatarMan1.src,
  avatarMan.src,
]

const AVATAR_BY_NAME: Record<string, string> = {
  'Anna Petrov': avatarWoman34.src,
  'Mark Sidorov': avatarMan4.src,
  'Kate Volkova': avatarWoman4.src,
  'Ivan Melnikov': avatarMan4Alt.src,
  'Daria Kos': avatarWoman12.src,
  'Alex Novikov': avatarMan14.src,
  'Olga Romanenko': avatarWoman5Alt.src,
  'Pavel Yurov': avatarMan12.src,
  'Yulia Lebed': avatarWoman1.src,
  'Roma Karpov': avatarMan3.src,
  'Lera Tarasova': avatarWoman5.src,
}

function stableHash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

export function Avatar({ name, size = 18 }: { name: string; size?: number }) {
  const h = stableHash(name)
  const bg = AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
  const image = avatarSrcForName(name)
  return (
    <span
      aria-label={name}
      title={name}
      style={{
        width: size, height: size, borderRadius: '50%',
        backgroundImage: `url("${image}"), ${bg}`,
        backgroundPosition: 'center, center',
        backgroundSize: 'cover, cover',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.10)',
      }}
    />
  )
}

function avatarSrcForName(name: string): string {
  const h = stableHash(name)
  return AVATAR_BY_NAME[name] ?? AVATAR_IMAGES[h % AVATAR_IMAGES.length]
}

export function DemoTabs({
  active, labels, onChange, compact = false, variant = 'standard',
}: {
  active: GridTab
  labels: GridPreviewLabels
  onChange: (tab: GridTab) => void
  compact?: boolean
  variant?: 'standard' | 'classic'
}) {
  const classic = variant === 'classic'
  const tabs: Array<{ key: GridTab; label: string; icon: React.ReactNode }> = [
    { key: 'schedule', label: labels.scheduleTab, icon: <CalendarDots size={compact ? 13 : 14} weight="duotone" /> },
    { key: 'employees', label: labels.employeesTab, icon: <UsersThree size={compact ? 13 : 14} weight="duotone" /> },
  ]

  return (
    <div
      role="tablist"
      aria-label={labels.displayLabel}
      style={{
        marginLeft: compact ? 0 : 12,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 8,
        border: classic ? '1px solid var(--classic-grid-line, var(--border))' : '1px solid var(--border)',
        background: classic ? 'color-mix(in oklab, var(--muted) 42%, transparent)' : 'var(--grid-pill-bg)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="cursor-pointer transition-colors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: compact ? 4 : 6,
              border: 0,
              borderRadius: 6,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              padding: compact ? '3px 7px' : '4px 9px',
              fontSize: compact ? 10 : 11,
              fontWeight: isActive ? 650 : 550,
              fontFamily: classic ? 'ui-serif, Georgia, "Times New Roman", serif' : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function TodayStatusChip({
  labels, onShift, offToday, classic = false,
}: {
  labels: GridPreviewLabels
  onShift: number
  offToday: number
  classic?: boolean
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        background: classic ? 'color-mix(in oklab, var(--muted) 50%, transparent)' : 'var(--grid-cell)',
        border: '1px solid var(--border)',
        borderRadius: classic ? 999 : 6,
        padding: classic ? '3px 10px' : '3px 8px',
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--muted-foreground)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontWeight: 500 }}>{labels.chromeToday}</span>
      <span style={{ width: 1, height: 10, background: classic ? 'var(--classic-grid-line)' : 'var(--border)' }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: classic ? '#5cb89a' : 'var(--st-work)' }} />
        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{onShift}</span>
        <span>{labels.chromeOnShift}</span>
      </span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: classic ? '#7d8896' : 'var(--chip-d-bg)',
            border: classic ? 0 : '1px solid var(--border)',
          }}
        />
        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{offToday}</span>
        <span>{labels.chromeOffToday}</span>
      </span>
    </span>
  )
}

export function EmployeeViewToggle({
  labels, view, onChange, variant = 'standard',
}: {
  labels: GridPreviewLabels
  view: EmployeeDirectoryView
  onChange: (view: EmployeeDirectoryView) => void
  variant?: 'standard' | 'classic'
}) {
  const classic = variant === 'classic'
  const items: Array<{ key: EmployeeDirectoryView; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }> = [
    { key: 'cards', label: labels.employeeViewCards, Icon: LayoutGrid },
    { key: 'list', label: labels.employeeViewList, Icon: List },
  ]

  return (
    <div
      role="group"
      aria-label={labels.displayLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 8,
        background: classic ? 'color-mix(in oklab, var(--muted) 42%, transparent)' : 'var(--grid-pill-bg)',
        border: classic ? '1px solid var(--classic-grid-line, var(--border))' : '1px solid var(--border)',
      }}
    >
      {items.map(({ key, label, Icon }) => {
        const active = view === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="cursor-pointer transition-colors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              border: 0,
              borderRadius: 6,
              background: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: active ? 650 : 550,
              fontFamily: classic ? 'ui-serif, Georgia, "Times New Roman", serif' : undefined,
            }}
          >
            <Icon size={12} strokeWidth={2.2} />
            <span className="max-[420px]:hidden">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function EmployeeDirectory({
  employees, labels, view, mode = 'compact', getEmpRoleKey, getEmpSpecialty, getRoleLabel, getRoleColor, getSpecialtyColor, variant = 'standard', onCopied,
}: {
  employees: EmpDef[]
  labels: GridPreviewLabels
  view: EmployeeDirectoryView
  mode?: Mode
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getEmpSpecialty: (emp: EmpDef) => string
  getRoleLabel: (key: RoleOrSectionKey) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  getSpecialtyColor: (role: string) => string
  variant?: 'standard' | 'classic'
  onCopied?: () => void
}) {
  const classic = variant === 'classic'
  const isCompact = mode === 'compact'
  const isExtended = mode === 'extended'
  const listMinWidth = isCompact ? 820 : isExtended ? 1160 : 980
  const listFontSize = isCompact ? 10.5 : isExtended ? 12 : 11
  const listHeadPad = isCompact ? '7px 10px' : isExtended ? '12px 16px' : '9px 12px'
  const listCellPad = isCompact ? '8px 10px' : isExtended ? '14px 16px' : '10px 12px'
  const listBirthdayDetail = !isCompact
  const cardGridMin = isCompact ? 330 : isExtended ? 560 : 440
  const cardGap = isCompact ? 10 : isExtended ? 14 : 12
  const cardPad = isCompact ? 10 : isExtended ? 14 : 12
  const rows = employees.map((emp, index) => {
    const profile = employeeProfileFor(emp, index)
    const birthday = birthdayStats(profile.birthday, PROFILE_REFERENCE_DATE)
    const roleKey = getEmpRoleKey(emp)
    const roleColor = getRoleColor(roleKey)
    const project = labels.projects[`p${emp.pIdx}` as ProjectKey]
    return {
      emp,
      displayName: employeeDisplayName(emp, labels),
      profile,
      roleLabel: getRoleLabel(roleKey),
      roleColor,
      specialtyLabel: getEmpSpecialty(emp),
      specialtyColor: getSpecialtyColor(getEmpSpecialty(emp)),
      projectName: project.name,
      birthdayDate: formatDemoDate(profile.birthday),
      birthdaySoon: fillTemplate(labels.employeeBirthdayIn, birthday.daysUntil),
      ageText: ageText(birthday.age),
      birthdayMeta: `${fillTemplate(labels.employeeBirthdayIn, birthday.daysUntil)} · ${ageText(birthday.age)}`,
      companyDays: pluralTemplate(labels.localeTag, daysInCompany(profile.joined, PROFILE_REFERENCE_DATE), {
        one: labels.employeeCompanyDaysOne,
        few: labels.employeeCompanyDaysFew,
        many: labels.employeeCompanyDaysValue,
      }),
      kindLabel: profile.kind === 'trainee' ? labels.employeeTrainee : labels.employeeStaff,
    }
  })

  function ageText(age: number): string {
    return pluralTemplate(labels.localeTag, age, {
      one: labels.employeeAgeYearsOne,
      few: labels.employeeAgeYearsFew,
      many: labels.employeeAgeYears,
    })
  }

  if (view === 'list') {
    return (
      <div style={{ overflowX: 'auto', background: classic ? 'var(--surface)' : 'var(--grid-cell)' }}>
        <table style={{ width: '100%', minWidth: listMinWidth, borderCollapse: 'collapse', fontSize: listFontSize }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {[labels.employee, labels.employeeProject, labels.employeeContactInfo, labels.employeeBirthday, labels.employeeCompanyDays].map((label) => (
                <th
                  key={label}
                  style={{
                    textAlign: 'left',
                    padding: listHeadPad,
                    color: 'var(--muted-foreground)',
                    fontSize: isExtended ? 10.5 : 10,
                    fontWeight: 650,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: classic ? 'var(--surface)' : 'var(--grid-cell)',
                    fontFamily: classic ? 'ui-serif, Georgia, "Times New Roman", serif' : undefined,
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.emp.name} style={{ borderBottom: '1px solid var(--grid-row-divider)' }}>
                <td style={{ padding: listCellPad }}>
                  <EmployeeIdentity row={row} mode={mode} variant={variant} />
                </td>
                <td style={{ padding: listCellPad, color: 'var(--foreground)', fontWeight: 650 }}>
                  {row.projectName}
                </td>
                <td style={{ padding: listCellPad, color: 'var(--muted-foreground)' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isCompact ? 'repeat(3, minmax(0, 1fr))' : '1fr',
                      gap: isCompact ? 5 : 3,
                      maxWidth: isCompact ? 260 : 220,
                    }}
                  >
                    <CopyContactButton value={CONTACT_PLACEHOLDERS.phone} displayValue={isCompact ? labels.employeePhone : CONTACT_PLACEHOLDERS.phone} compact={isCompact} onCopied={onCopied} />
                    <CopyContactButton value={CONTACT_PLACEHOLDERS.telegram} displayValue={isCompact ? labels.employeeTelegram : CONTACT_PLACEHOLDERS.telegram} compact={isCompact} onCopied={onCopied} />
                    <CopyContactButton value={CONTACT_PLACEHOLDERS.email} displayValue={isCompact ? labels.employeeEmail : CONTACT_PLACEHOLDERS.email} compact={isCompact} onCopied={onCopied} />
                  </div>
                </td>
                <td style={{ padding: listCellPad }}>
                  <div style={{ color: 'var(--foreground)', fontWeight: 650 }}>{row.birthdayDate}</div>
                  {listBirthdayDetail && (
                    <div style={{ marginTop: 2, color: 'var(--muted-foreground)' }}>{row.birthdayMeta}</div>
                  )}
                </td>
                <td style={{ padding: listCellPad, color: 'var(--foreground)', fontWeight: 650 }}>
                  {row.companyDays}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: cardPad,
        background: classic ? 'var(--surface)' : 'var(--grid-cell)',
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${cardGridMin}px), 1fr))`,
        gap: cardGap,
      }}
    >
      {rows.map((row) => (
        <EmployeeProfileCard
          key={row.emp.name}
          row={row}
          labels={labels}
          mode={mode}
          variant={variant}
          onCopied={onCopied}
        />
      ))}
    </div>
  )
}

function EmployeeProfileCard({
  row, labels, mode = 'compact', variant = 'standard', onCopied,
}: {
  row: {
    emp: EmpDef
    displayName: string
    roleLabel: string
    roleColor: string
    specialtyLabel: string
    specialtyColor: string
    projectName: string
    birthdayDate: string
    birthdaySoon: string
    ageText: string
    companyDays: string
    kindLabel: string
    profile: EmployeeProfileSeed
  }
  labels: GridPreviewLabels
  mode?: Mode
  variant?: 'standard' | 'classic'
  onCopied?: () => void
}) {
  const compact = mode === 'compact'
  const extended = mode === 'extended'
  const classic = variant === 'classic'
  const avatarSize = compact ? 38 : extended ? 52 : 46
  const cardPad = compact ? 16 : extended ? 24 : 20
  const statGap = compact ? 14 : extended ? 24 : 18
  const nameSize = compact ? 16 : extended ? 20 : 18
  const roleIconColor = solidAccent(row.specialtyColor)
  const statusAccent = '#10b981'
  const kindAccent = row.profile.kind === 'trainee' ? '#8b5cf6' : '#10b981'

  return (
    <article
      style={{
        minWidth: 0,
        border: classic ? '1px solid var(--classic-grid-line, var(--border))' : '1px solid color-mix(in oklab, var(--border) 84%, var(--foreground) 8%)',
        borderRadius: classic ? 8 : 10,
        background: 'color-mix(in oklab, var(--surface) 96%, var(--grid-cell) 4%)',
        boxShadow: classic
          ? '0 1px 0 rgba(0,0,0,0.04)'
          : '0 1px 2px rgba(15,23,42,0.06), 0 10px 26px rgba(15,23,42,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: cardPad,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: compact ? 12 : 18,
          alignItems: 'start',
          borderBottom: '1px solid var(--grid-row-divider)',
          background: 'color-mix(in oklab, var(--surface) 98%, var(--grid-pill-bg) 2%)',
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: compact ? 12 : 16 }}>
          <EmployeeAvatarWithPresence name={row.emp.name} size={avatarSize} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: 'var(--foreground)',
                fontSize: nameSize,
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: classic ? 'ui-serif, Georgia, "Times New Roman", serif' : undefined,
              }}
            >
              {row.displayName}
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(row.emp.tg).catch(() => {})
                }
                onCopied?.()
              }}
              className="cursor-pointer transition-colors hover:text-accent"
              title={row.emp.tg}
              style={{
                marginTop: compact ? 5 : 7,
                maxWidth: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--muted-foreground)',
                fontFamily: 'inherit',
                fontSize: compact ? 12 : 13,
                fontWeight: 650,
                lineHeight: 1.1,
              }}
            >
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.emp.tg}
              </span>
              <Copy size={compact ? 12 : 13} strokeWidth={2.1} style={{ flexShrink: 0 }} />
            </button>
            <div
              style={{
                marginTop: compact ? 7 : 9,
                color: 'var(--muted-foreground)',
                fontSize: compact ? 12 : 13,
                fontWeight: 650,
                lineHeight: 1.1,
              }}
            >
              {row.ageText}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: compact ? 6 : 8 }}>
          <EmployeeStatusBadge label={labels.employeeActive.toLocaleUpperCase('uk-UA')} accent={statusAccent} Icon={ShieldCheck} mode={mode} />
          <EmployeeStatusBadge
            label={row.kindLabel.toLocaleUpperCase('uk-UA')}
            accent={kindAccent}
            Icon={row.profile.kind === 'trainee' ? Sparkles : ShieldCheck}
            mode={mode}
          />
        </div>
      </div>

      <div
        style={{
          padding: cardPad,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: statGap,
          rowGap: compact ? 14 : 18,
        }}
      >
        <EmployeeProfileStat label={row.roleLabel} value={row.specialtyLabel} Icon={Briefcase} iconColor={roleIconColor} mode={mode} />
        <EmployeeProfileStat label={labels.employeeProject} value={row.projectName} Icon={Globe2} iconColor="#8b5cf6" mode={mode} />
        <EmployeeProfileStat label={labels.employeeCompanyDays} value={row.companyDays} Icon={Clock3} iconColor="var(--muted-foreground)" mode={mode} />
        <EmployeeProfileStat label={labels.employeeBirthday} value={row.birthdayDate} detail={row.birthdaySoon} Icon={CalendarDays} iconColor="var(--muted-foreground)" mode={mode} />
      </div>

      <div
        style={{
          padding: compact ? '11px 14px' : extended ? '16px 22px' : '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 10 : 14,
          borderTop: '1px solid var(--grid-row-divider)',
          background: 'color-mix(in oklab, var(--grid-pill-bg) 48%, transparent)',
        }}
      >
        <EmployeeCardAction label={labels.employeeTelegram} value={row.emp.tg} Icon={Send} mode={mode} onCopied={onCopied} />
        <EmployeeCardAction label={labels.employeeEmail} value={CONTACT_PLACEHOLDERS.email} Icon={Mail} mode={mode} onCopied={onCopied} />
        <EmployeeCardAction label={labels.employeePhone} value={CONTACT_PLACEHOLDERS.phone} Icon={Phone} mode={mode} onCopied={onCopied} />
        <div style={{ flex: 1 }} />
        <EmployeeCardAction label={labels.editBtn} value={labels.editBtn} Icon={Pencil} mode={mode} copy={false} />
        <EmployeeCardAction label={labels.employeeLock} value={labels.employeeLock} Icon={LockKeyhole} mode={mode} copy={false} danger />
      </div>
    </article>
  )
}

function EmployeeAvatarWithPresence({ name, size }: { name: string; size: number }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <Avatar name={name} size={size} />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -1,
          bottom: -1,
          width: Math.max(10, Math.round(size * 0.24)),
          height: Math.max(10, Math.round(size * 0.24)),
          borderRadius: '50%',
          background: '#4ade80',
          border: '2px solid var(--surface)',
          boxShadow: '0 0 0 1px color-mix(in oklab, #4ade80 44%, transparent)',
        }}
      />
    </span>
  )
}

function EmployeeStatusBadge({
  label, accent, Icon, mode = 'compact',
}: {
  label: string
  accent: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  mode?: Mode
}) {
  const compact = mode === 'compact'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 6 : 7,
        minHeight: compact ? 26 : 30,
        padding: compact ? '4px 10px' : '5px 13px',
        borderRadius: compact ? 6 : 7,
        border: `1px solid color-mix(in oklab, ${accent} 36%, transparent)`,
        background: `color-mix(in oklab, ${accent} 12%, var(--surface))`,
        color: accent,
        fontSize: compact ? 11 : 12,
        fontWeight: 850,
        letterSpacing: '0.08em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={compact ? 13 : 14} strokeWidth={2.2} style={{ flexShrink: 0 }} />
      {label}
    </span>
  )
}

function EmployeeProfileStat({
  label, value, detail, Icon, iconColor, mode = 'compact',
}: {
  label: string
  value: string
  detail?: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  iconColor: string
  mode?: Mode
}) {
  const compact = mode === 'compact'
  const extended = mode === 'extended'
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          color: 'var(--muted-foreground)',
          fontSize: compact ? 10.5 : extended ? 13 : 12,
          fontWeight: 800,
          letterSpacing: '0.07em',
          lineHeight: 1.1,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: compact ? 9 : 12,
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 8 : 10,
          minWidth: 0,
          color: 'var(--foreground)',
          fontSize: compact ? 13 : extended ? 16 : 14.5,
          fontWeight: 750,
          lineHeight: 1.2,
        }}
      >
        <Icon size={compact ? 15 : 17} strokeWidth={2.1} style={{ color: iconColor, flexShrink: 0 }} />
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      </div>
      {detail && (
        <div
          style={{
            marginTop: 4,
            paddingLeft: compact ? 23 : 27,
            color: 'var(--muted-foreground)',
            fontSize: compact ? 10.5 : 11.5,
            fontWeight: 600,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {detail}
        </div>
      )}
    </div>
  )
}

function EmployeeCardAction({
  label, value, Icon, mode = 'compact', copy = true, danger = false, onCopied,
}: {
  label: string
  value: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  mode?: Mode
  copy?: boolean
  danger?: boolean
  onCopied?: () => void
}) {
  const compact = mode === 'compact'
  return (
    <button
      type="button"
      onClick={() => {
        if (!copy || typeof navigator === 'undefined' || !navigator.clipboard) return
        navigator.clipboard.writeText(value).catch(() => {})
        onCopied?.()
      }}
      title={copy ? `${label}: ${value}` : label}
      className="cursor-pointer transition-colors hover:text-accent"
      style={{
        width: compact ? 24 : 28,
        height: compact ? 24 : 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        borderRadius: 6,
        background: 'transparent',
        color: danger ? '#fb7185' : 'var(--muted-foreground)',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <Icon size={compact ? 17 : 19} strokeWidth={2} />
    </button>
  )
}

function EmployeeIdentity({
  row, mode = 'compact', variant = 'standard',
}: {
  row: {
    emp: EmpDef
    displayName: string
    roleLabel: string
    roleColor: string
    specialtyLabel: string
    specialtyColor: string
    kindLabel: string
  }
  mode?: Mode
  variant?: 'standard' | 'classic'
}) {
  const compact = mode === 'compact'
  const extended = mode === 'extended'
  const classic = variant === 'classic'
  const avatarSize = compact ? 26 : extended ? 38 : 30
  const nameSize = compact ? 11.5 : extended ? 14 : 12
  const identityGap = compact ? 8 : extended ? 11 : 9
  const badgeGap = compact ? 4 : extended ? 7 : 6
  const metaMargin = compact ? 3 : extended ? 6 : 4
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: identityGap, minWidth: 0 }}>
      <Avatar name={row.emp.name} size={avatarSize} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: nameSize,
            fontWeight: 700,
            color: 'var(--foreground)',
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: classic ? 'ui-serif, Georgia, "Times New Roman", serif' : undefined,
          }}
        >
          {row.displayName}
        </div>
        <div style={{ marginTop: metaMargin, display: 'flex', alignItems: 'center', gap: badgeGap, flexWrap: 'wrap', minWidth: 0 }}>
          <DepartmentPositionCard
            department={row.roleLabel}
            position={row.specialtyLabel}
            departmentAccent={row.roleColor}
            accent={row.specialtyColor}
            compact={compact}
            shrink
            maxWidth="100%"
            textScale={compact ? 0.9 : extended ? 1.08 : 1}
          />
          <span
            style={{
              color: 'var(--muted-foreground)',
              fontSize: compact ? 9.5 : extended ? 11 : 10,
              fontWeight: 650,
              whiteSpace: 'nowrap',
              lineHeight: 1.1,
            }}
          >
            {row.kindLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

export function normalizeSpecialtyKey(role: string): string {
  return SPECIALTY_LEGACY_KEYS[role] ?? role
}

export function specialtyLabelFor(role: string, labels: GridPreviewLabels): string {
  const key = normalizeSpecialtyKey(role)
  return labels.specialties[key as SpecialtyKey] ?? role
}

export function employeeDisplayName(emp: EmpDef, labels: GridPreviewLabels): string {
  return emp.nameKey ? labels.employeeNames[emp.nameKey] : emp.name
}

function compactDepartmentLabel(label: string): string {
  const normalized = label
    .replace(/^(відділ|отдел|department)\s+/i, '')
    .replace(/\s+department$/i, '')
    .trim()
  const lower = normalized.toLocaleLowerCase('uk-UA')

  if (lower === 'sales') return 'SALES'
  if (lower === 'development') return 'DEVELOPMENT'

  return normalized.toLocaleUpperCase('uk-UA')
}

function solidAccent(color?: string): string {
  return color && !color.includes('gradient(') ? color : '#8b5cf6'
}

function compactDepartmentAccent(department: string, fallback?: string): string {
  const lower = department.toLocaleLowerCase('uk-UA')
  if (lower.includes('продаж') || lower.includes('sales')) return '#d0773f'
  if (lower.includes('розроб') || lower.includes('разработ') || lower.includes('development')) return '#5d8bd7'
  return solidAccent(fallback)
}

function employeeDotAccent(department: string, position: string, departmentFallback?: string, roleFallback?: string): string {
  const departmentColor = compactDepartmentAccent(department, departmentFallback ?? roleFallback)
  const lower = department.toLocaleLowerCase('uk-UA')
  const roleKey = normalizeSpecialtyKey(position)
  if (
    (lower.includes('продаж') || lower.includes('sales')) &&
    ['sales', 'retention', 'salesOps', 'salesLead'].includes(roleKey)
  ) {
    return solidAccent(SPECIALTY_COLORS[roleKey] ?? roleFallback ?? departmentColor)
  }
  return departmentColor
}

function DepartmentDot({
  color,
  outer = 12,
  inner = 7,
  marginRight,
}: {
  color: string
  outer?: number
  inner?: number
  marginRight?: number
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: outer,
        height: outer,
        flexShrink: 0,
        borderRadius: '50%',
        background: `color-mix(in oklab, ${color} 22%, transparent)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight,
        verticalAlign: 'middle',
      }}
    >
      <span
        style={{
          width: inner,
          height: inner,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 18%, transparent)`,
        }}
      />
    </span>
  )
}

function employeeMetaParts(sticky: boolean, showDepartment: boolean, showRole: boolean) {
  const department = sticky && showDepartment
  const role = showRole
  return { department, role, count: Number(department) + Number(role) }
}

function compactEmployeeNameColumnWidth({
  sticky,
  showEmployeeRole,
  showEmployeeDepartment,
  showEmployeeDot,
  showTelegram,
}: {
  sticky: boolean
  showEmployeeRole: boolean
  showEmployeeDepartment: boolean
  showEmployeeDot: boolean
  showTelegram: boolean
}): number {
  if (showTelegram) return 305

  const meta = employeeMetaParts(sticky, showEmployeeDepartment, showEmployeeRole)
  if (meta.count === 0) return showEmployeeDot ? 236 : 218
  if (meta.count === 1) return meta.role ? 286 : 266
  return showEmployeeDot ? 305 : 292
}

function detailEmployeeNameColumnWidth({
  mode,
  sticky,
  showEmployeeRole,
  showEmployeeDepartment,
  showEmployeeDot,
  showTelegram,
}: {
  mode: Mode
  sticky: boolean
  showEmployeeRole: boolean
  showEmployeeDepartment: boolean
  showEmployeeDot: boolean
  showTelegram: boolean
}): string {
  const isExt = mode === 'extended'
	  if (showTelegram) return isExt ? 'clamp(280px, 28vw, 350px)' : 'clamp(250px, 25vw, 300px)'

  const meta = employeeMetaParts(sticky, showEmployeeDepartment, showEmployeeRole)
  if (meta.count === 0) {
    return showEmployeeDot
	      ? (isExt ? 'clamp(230px, 23vw, 280px)' : 'clamp(230px, 23vw, 280px)')
	      : (isExt ? 'clamp(215px, 22vw, 255px)' : 'clamp(220px, 22vw, 260px)')
  }
  if (meta.count === 1) {
	    if (meta.role) return isExt ? 'clamp(260px, 27vw, 330px)' : 'clamp(250px, 25vw, 300px)'
	    return isExt ? 'clamp(245px, 26vw, 310px)' : 'clamp(240px, 24vw, 290px)'
  }
  return isExt
    ? `clamp(260px, 30vw, ${sticky ? 370 : 330}px)`
	    : `clamp(260px, 27vw, ${sticky ? 320 : 300}px)`
}

function DepartmentPositionCard({
  department,
  position,
  accent,
  departmentAccent,
  departmentShort,
  compact = false,
  variant = 'default',
  textScale = 1,
  hideDepartment = false,
  showDepartment = true,
  showPosition = true,
  showDot,
  width,
  maxWidth,
  shrink = false,
  onClick,
}: {
  department: string
  position: string
  accent: string
  departmentAccent?: string
  departmentShort?: string
  compact?: boolean
  variant?: 'default' | 'compactSchedule'
  textScale?: number
  hideDepartment?: boolean
  showDepartment?: boolean
  showPosition?: boolean
  showDot?: boolean
  width?: number | string
  maxWidth?: number | string
  shrink?: boolean
  onClick?: () => void
}) {
  const shouldClamp = width !== undefined || maxWidth !== undefined || shrink
  const isCompactSchedule = variant === 'compactSchedule'
  const shouldShowDepartment = showDepartment && !hideDepartment
  const shouldShowPosition = showPosition
  const shouldShowDot = showDot ?? isCompactSchedule
  const hasText = shouldShowDepartment || shouldShowPosition
  const dotAccent = shouldShowPosition
    ? employeeDotAccent(department, position, departmentAccent, accent)
    : compactDepartmentAccent(department, departmentAccent ?? accent)
  const accentTextStyle = (color?: string): React.CSSProperties => {
    if (!color) return {}
    if (color.includes('gradient(')) {
      return {
        backgroundImage: color,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }
    }
    return { color }
  }
  if (!hasText && !shouldShowDot) return null

  const compactContent = (
    <>
      {shouldShowDot && <DepartmentDot color={dotAccent} />}
      {shouldShowDepartment && (
        <>
          <span
            style={{
              minWidth: 0,
              maxWidth: 90,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--muted-foreground)',
              fontSize: 10 * textScale,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: 0,
              textTransform: 'uppercase',
            }}
          >
            {compactDepartmentLabel(departmentShort ?? department)}
          </span>
          {shouldShowPosition && (
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                color: 'var(--muted-foreground)',
                fontSize: 15 * textScale,
                fontWeight: 500,
                lineHeight: 0.8,
                opacity: 0.78,
              }}
            >
              ›
            </span>
          )}
        </>
      )}
      {shouldShowPosition && (
        <span
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--foreground)',
            fontSize: 13.5 * textScale,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {position}
        </span>
      )}
    </>
  )
  const content = (
    <>
      {shouldShowDot && (
        <span style={{ marginLeft: hasText ? (compact ? 5 : 6) : 0, display: 'inline-flex' }}>
          <DepartmentDot color={dotAccent} />
        </span>
      )}
      {shouldShowDepartment && (
        <>
          <span
            style={{
              minWidth: shouldClamp ? 0 : 'max-content',
              overflow: shouldClamp ? 'hidden' : 'visible',
              textOverflow: shouldClamp ? 'ellipsis' : 'clip',
              color: departmentAccent ? undefined : 'var(--muted-foreground)',
              padding: compact ? '1px 6px' : '2px 7px',
              ...accentTextStyle(departmentAccent),
            }}
          >
            {department}
          </span>
          {shouldShowPosition && (
            <span
              aria-hidden="true"
              style={{
                alignSelf: 'stretch',
                width: 1,
                background: 'var(--border)',
                opacity: 0.85,
              }}
            />
          )}
        </>
      )}
      {shouldShowPosition && (
        <span
          style={{
            minWidth: shouldClamp ? 0 : 'max-content',
            overflow: shouldClamp ? 'hidden' : 'visible',
            textOverflow: shouldClamp ? 'ellipsis' : 'clip',
            color: accent.includes('gradient(') ? undefined : accent,
            padding: compact ? '1px 6px' : '2px 7px',
            fontWeight: 750,
            ...accentTextStyle(accent),
          }}
        >
          {position}
        </span>
      )}
    </>
  )
  const style: React.CSSProperties = isCompactSchedule ? {
    width,
    maxWidth: maxWidth ?? (shouldClamp ? '100%' : 'none'),
    minWidth: shouldClamp ? 0 : 'max-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: shrink ? 1 : 0,
    overflow: shouldClamp ? 'hidden' : 'visible',
    border: 0,
    borderRadius: 0,
    background: 'transparent',
    boxShadow: 'none',
    fontFamily: 'Inter, "SF Pro Display", var(--font-sans), system-ui, sans-serif',
    whiteSpace: 'nowrap',
  } : {
    width,
    maxWidth: maxWidth ?? (shouldClamp ? '100%' : 'none'),
    minWidth: shouldClamp ? 0 : 'max-content',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: shrink ? 1 : 0,
    overflow: shouldClamp ? 'hidden' : 'visible',
    border: '1px solid var(--border)',
    borderRadius: compact ? 5 : 6,
    background: 'color-mix(in oklab, var(--grid-pill-bg) 86%, var(--surface) 14%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    fontSize: compact ? 8.5 : 10,
    fontWeight: 650,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${department} ${position}`.trim()}
        className="cursor-pointer transition-opacity hover:opacity-85"
        style={{
          ...style,
          padding: 0,
        }}
      >
        {isCompactSchedule ? compactContent : content}
      </button>
    )
  }

  return <span style={style}>{isCompactSchedule ? compactContent : content}</span>
}

function CopyContactButton({ value, displayValue = value, compact = false, onCopied }: { value: string; displayValue?: string; compact?: boolean; onCopied?: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(value).catch(() => {})
        }
        onCopied?.()
      }}
      className="cursor-pointer transition-colors hover:text-accent"
      title={value}
      style={{
        background: 'transparent',
        border: 0,
        padding: 0,
        color: 'var(--foreground)',
        fontFamily: 'inherit',
        fontSize: compact ? 10 : 11,
        fontWeight: 650,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
        width: compact ? '100%' : undefined,
        textAlign: compact ? 'center' : 'right',
      }}
    >
      {displayValue}
    </button>
  )
}

/* ── Employee calendar overlay ─────────────────────────────────── */
function EmployeeCalendarOverlay({
  empName, emp, monthLabel, days, labels, statusOf,
  getEmpRoleKey, getEmpSpecialty, getRoleLabel, getRoleColor, getSpecialtyColor, onClose,
}: {
  empName: string | null
  emp: EmpDef | null
  monthLabel: string
  days: MonthDay[]
  labels: GridPreviewLabels
  statusOf: (name: string, dayIdx: number, base: string) => Status
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getEmpSpecialty: (emp: EmpDef) => string
  getRoleLabel: (key: RoleOrSectionKey) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  getSpecialtyColor: (role: string) => string
  onClose: () => void
}) {
  const open = !!empName && !!emp
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(open))
    return () => cancelAnimationFrame(id)
  }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !emp || !empName) return null

  // Build a calendar grid for the demo month, aligned to its real first weekday.
  const firstDowMon0 = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(days[0]?.k ?? 'mon')
  type CellData = { day: number; status: Status; isWeekend: boolean; idx: number }
  const cells: (CellData | null)[] = []
  for (let i = 0; i < firstDowMon0; i++) cells.push(null)
  for (let i = 0; i < days.length; i++) {
    const d = days[i]
    let code = statusOf(empName, i, emp.s)
    if (code === 'U' && i !== PROBLEM_DAY_IDX) code = 'W'
    cells.push({ day: d.n, status: code, isWeekend: d.k === 'sat' || d.k === 'sun', idx: i })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: (CellData | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  // Compute summary
  let workDays = 0, offDays = 0, vacationDays = 0, sickDays = 0, hours = 0
  for (const c of cells) {
    if (!c) continue
    if (c.status === 'W') {
      workDays++
      hours += workMeta(emp.shift, labels).hours
    } else if (c.status === 'V') vacationDays++
    else if (c.status === 'S') sickDays++
    else if (c.status === 'D' || c.status === '-' || c.status === undefined) offDays++
  }

  const dowKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

  function statusColor(s: Status, isWeekend?: boolean): { bg: string; fg: string; label: string } {
    if (s === 'W') {
      return { bg: 'color-mix(in oklab, var(--st-work) 22%, transparent)', fg: 'var(--foreground)', label: compactShiftWindow(emp!.shift) }
    }
    if (s === 'V') return { bg: 'color-mix(in oklab, var(--accent) 22%, transparent)', fg: 'var(--accent)', label: labels.empCalendarLegendVacation }
    if (s === 'S') return { bg: 'color-mix(in oklab, #d4604a 22%, transparent)', fg: '#d4604a', label: labels.empCalendarLegendSick }
    if (s === 'D') return { bg: 'color-mix(in oklab, var(--muted-foreground) 14%, transparent)', fg: 'var(--muted-foreground)', label: isWeekend ? labels.empCalendarLegendOff : labels.empCalendarLegendDayoff }
    if (s === 'U') return { bg: 'color-mix(in oklab, var(--accent) 22%, transparent)', fg: 'var(--accent)', label: '!' }
    return { bg: 'transparent', fg: 'var(--muted-foreground)', label: labels.empCalendarLegendOff }
  }

  const roleColor = getRoleColor(getEmpRoleKey(emp))
  const roleLabel = getRoleLabel(getEmpRoleKey(emp))
  const specialtyLabel = getEmpSpecialty(emp)
  const specialtyColor = getSpecialtyColor(specialtyLabel)
  const displayName = employeeDisplayName(emp, labels)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: mounted ? 'rgba(8,7,5,0.55)' : 'rgba(8,7,5,0)',
        backdropFilter: mounted ? 'blur(6px)' : 'blur(0)',
        transition: 'background 240ms ease, backdrop-filter 240ms ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={labels.empCalendarTitle}
        style={{
          width: '100%', maxWidth: 400,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: 'var(--surface)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.45)',
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 280ms cubic-bezier(.32,.72,0,1), opacity 220ms ease',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Avatar name={empName} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{displayName}</div>
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <DepartmentPositionCard
                department={roleLabel}
                position={specialtyLabel}
                departmentAccent={roleColor}
                accent={specialtyColor}
                maxWidth="100%"
                shrink
              />
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{monthLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.empCalendarClose}
            className="cursor-pointer hover:opacity-80"
            style={{
              flexShrink: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--grid-pill-bg)',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2.5 2.5 L11.5 11.5 M11.5 2.5 L2.5 11.5" />
            </svg>
          </button>
        </div>

        {/* Summary chips */}
        <div style={{ padding: '0 16px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <div style={{ padding: '7px 10px', borderRadius: 8, background: 'color-mix(in oklab, var(--st-work) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--st-work) 28%, transparent)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>{workDays}</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>{labels.empCalendarSummaryWorked}</div>
          </div>
          <div style={{ padding: '7px 10px', borderRadius: 8, background: 'color-mix(in oklab, var(--muted-foreground) 10%, transparent)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>{offDays + vacationDays + sickDays}</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>{labels.empCalendarSummaryOff}</div>
          </div>
          <div style={{ padding: '7px 10px', borderRadius: 8, background: 'color-mix(in oklab, var(--accent) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--accent) 24%, transparent)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>{hours}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted-foreground)', marginLeft: 2 }}>{labels.hourSuffix}</span></div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>{labels.empCalendarSummaryHours}</div>
          </div>
        </div>

        {/* Calendar grid */}
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
            {dowKeys.map((k) => (
              <div key={k} style={{ textAlign: 'center', fontSize: 9, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 0' }}>
                {labels.days[k]}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {cells.map((c, i) => {
              if (!c) return <div key={i} style={{ aspectRatio: '1 / 1.05' }} />
              const sc = statusColor(c.status, c.isWeekend)
              const isUnfilled = c.status === 'U'
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1 / 1.05',
                    borderRadius: 6,
                    background: sc.bg,
                    border: isUnfilled ? '1.5px dashed var(--accent)' : `1px solid ${c.isWeekend ? 'color-mix(in oklab, var(--accent) 12%, var(--border))' : 'var(--border)'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '4px 2px 3px',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, color: c.isWeekend && c.status !== 'W' ? 'var(--accent)' : 'var(--foreground)', opacity: c.status === 'W' || c.status === 'V' || c.status === 'S' ? 1 : 0.78 }}>
                    {c.day}
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: sc.fg, lineHeight: 1, textAlign: 'center' }}>
                    {sc.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: '6px 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 10, color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
          <LegendDot color="var(--st-work)" label={labels.empCalendarLegendWork} />
          <LegendDot color="var(--muted-foreground)" label={labels.empCalendarLegendDayoff} />
          <LegendDot color="var(--accent)" label={labels.empCalendarLegendVacation} />
          <LegendDot color="#d4604a" label={labels.empCalendarLegendSick} />
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}

function SettingRow({
  label, value, onChange, indent = false,
}: { label: string; value: boolean; onChange: (v: boolean) => void; indent?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5 text-foreground" style={{ paddingLeft: indent ? 14 : 0 }}>
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative h-5 w-9 rounded-full transition-colors"
        style={{ background: value ? 'var(--accent)' : 'var(--muted)' }}
        aria-pressed={value}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: value ? '18px' : '2px' }}
        />
      </button>
    </label>
  )
}

function AiOptimizeBar({
  labels, state, onRun,
}: {
  labels: GridPreviewLabels
  state: 'idle' | 'running' | 'done'
  onRun: () => void
}) {
  const locked = state !== 'idle'
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  const typingStartedRef = useRef(false)
  const [typedPrompt, setTypedPrompt] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [runHover, setRunHover] = useState(false)
  const [runActive, setRunActive] = useState(false)
  const runRaised = runHover && !runActive && !locked
  const runPressed = runActive && !locked

  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    typingStartedRef.current = false
    let timeoutId: number | null = null
    let observer: IntersectionObserver | null = null
    const fullPrompt = labels.aiPrompt
    const chars = Array.from(fullPrompt)

    const finishTyping = () => {
      setTypedPrompt(fullPrompt)
      setTypingDone(true)
    }

    const startTyping = () => {
      if (typingStartedRef.current) return
      typingStartedRef.current = true

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finishTyping()
        return
      }

      let index = 0
      setTypedPrompt('')
      setTypingDone(false)

      const tick = () => {
        index = Math.min(chars.length, index + (index < 5 ? 1 : 2))
        setTypedPrompt(chars.slice(0, index).join(''))

        if (index >= chars.length) {
          setTypingDone(true)
          return
        }

        timeoutId = window.setTimeout(tick, index < 5 ? 30 : 18)
      }

      timeoutId = window.setTimeout(tick, 110)
    }

    if (!('IntersectionObserver' in window)) {
      startTyping()
      return () => {
        if (timeoutId) window.clearTimeout(timeoutId)
      }
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        startTyping()
        observer?.disconnect()
      },
      { threshold: 0.28, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(toolbar)

    return () => {
      observer?.disconnect()
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [labels.aiPrompt])

  return (
    <div
      ref={toolbarRef}
      data-ai-toolbar
      className="mx-auto mb-5 mt-3 w-full max-w-[740px] px-1 sm:mb-6 sm:mt-4"
      data-ai-state={state}
    >
      <div
        className="smengo-ai-command"
        style={{
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: '10px',
          minHeight: '46px',
          padding: '5px 6px 5px 12px',
          border: '1px solid var(--ai-command-border)',
          borderRadius: '999px',
          background: 'var(--ai-command-bg)',
          boxShadow: 'var(--ai-command-shadow)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            zIndex: 2,
            top: 0,
            left: '5%',
            right: '5%',
            height: '1px',
            background: 'var(--ai-command-highlight)',
            pointerEvents: 'none',
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            zIndex: 0,
            inset: '1px',
            borderRadius: 'inherit',
            background: 'var(--ai-command-overlay)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="smengo-ai-input-wrap"
          style={{
            position: 'relative',
            zIndex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            height: '34px',
            padding: 0,
            borderRadius: '999px',
            background: 'transparent',
            color: 'var(--ai-command-text)',
          }}
        >
          <Sparkles
            className="smengo-ai-command-icon"
            size={15}
            strokeWidth={1.75}
            style={{
              flexShrink: 0,
              width: '30px',
              height: '30px',
              padding: '7px',
              borderRadius: '10px',
              color: 'var(--ai-icon-color)',
              background: 'var(--ai-icon-bg)',
              border: '1px solid var(--ai-icon-border)',
              boxShadow: 'var(--ai-icon-shadow)',
              boxSizing: 'border-box',
            }}
          />
          <span
            aria-label={labels.aiPrompt}
            className="smengo-ai-input"
            style={{
              minWidth: 0,
              width: '100%',
              background: 'transparent',
              color: 'var(--ai-command-text)',
              fontFamily: 'Inter, "SF Pro Display", var(--font-sans), system-ui, sans-serif',
              fontSize: '13.5px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span aria-hidden="true">{typedPrompt}</span>
            {!typingDone && typedPrompt.length > 0 && (
              <span className="smengo-ai-type-caret" aria-hidden="true" />
            )}
          </span>
        </div>
        <button
          type="button"
          disabled={locked}
          onClick={onRun}
          onMouseEnter={() => setRunHover(true)}
          onMouseLeave={() => {
            setRunHover(false)
            setRunActive(false)
          }}
          onMouseDown={() => setRunActive(true)}
          onMouseUp={() => setRunActive(false)}
          onTouchStart={() => setRunActive(true)}
          onTouchEnd={() => setRunActive(false)}
          onTouchCancel={() => setRunActive(false)}
          aria-label={locked ? labels.aiDone : labels.aiRun}
          className="smengo-ai-run-btn"
          style={{
            position: 'relative',
            zIndex: 1,
            height: '34px',
            minWidth: '86px',
            border: '1px solid var(--ai-run-border)',
            borderRadius: '999px',
            background: runRaised
              ? 'var(--ai-run-bg-hover)'
              : 'var(--ai-run-bg)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 18px',
            fontFamily: 'Inter, "SF Pro Display", var(--font-sans), system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            cursor: locked ? 'default' : 'pointer',
            boxShadow: runPressed
              ? 'var(--ai-run-shadow-active)'
              : runRaised
                ? 'var(--ai-run-shadow-hover)'
                : 'var(--ai-run-shadow)',
            transform: runRaised ? 'translateY(-1px)' : 'translateY(0)',
            transition: 'transform 160ms ease, box-shadow 160ms ease, background 160ms ease, opacity 160ms ease',
            opacity: 1,
          }}
        >
          {locked ? (
            <Check size={17} strokeWidth={2.8} />
          ) : (
            <span>{labels.aiRun}</span>
          )}
        </button>
      </div>
    </div>
  )
}

/* ── Detail / Extended mode ────────────────────────────────────── */
function DetailGrid({
  mode, groups, days, statusOf, labels, chipLbl, chipLblFull, chipBg, chipFg, contrast, weekendBg,
  showTimes, merged, showGrid, sticky, onShiftScope, onShiftScopeChange, showEmployeeRole, showEmployeeDepartment, showEmployeeDot, showTelegram, onEmpClick, onToggleProjects, onProjectClick, editMode, onCellEdit,
  getEmpRoleKey, getEmpSpecialty, getRoleLabel, getRoleColor, getSpecialtyColor, onOpenRolePicker,
  dragEmp, setDragEmp, dragOverEmp, setDragOverEmp, dragOverGroup, setDragOverGroup, onMoveEmp,
  optimizedCellKeys, shiftedFromCellKeys, shiftedToCellKeys, optimizationRun, optimizationState,
}: {
  mode: Mode
  groups: { key: string; name: string; shortName: string; min?: number; rows: EmpDef[] }[]
  days: MonthDay[]
  statusOf: (name: string, dayIdx: number, base: string) => Status
  labels: GridPreviewLabels
  chipLbl: Record<Exclude<Status, '-'>, string>
  chipLblFull: Record<Exclude<Status, '-'>, string>
  chipBg: (c: Exclude<Status, '-'>) => string
  chipFg: (c: Exclude<Status, '-'>) => string
  contrast: boolean
  weekendBg: string
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  sticky: boolean
  onShiftScope: string
  onShiftScopeChange: (value: string) => void
  showEmployeeRole: boolean
  showEmployeeDepartment: boolean
  showEmployeeDot: boolean
  showTelegram: boolean
  onEmpClick: (name: string) => void
  onToggleProjects: () => void
  onProjectClick: (name: string, pIdx: number) => void
  editMode: boolean
  onCellEdit: (name: string, day: number, px: number, py: number) => void
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getEmpSpecialty: (emp: EmpDef) => string
  getRoleLabel: (key: RoleOrSectionKey) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  getSpecialtyColor: (role: string) => string
  onOpenRolePicker: (name: string) => void
  dragEmp: string | null
  setDragEmp: (v: string | null) => void
  dragOverEmp: string | null
  setDragOverEmp: (v: string | null) => void
  dragOverGroup: string | null
  setDragOverGroup: (v: string | null) => void
  onMoveEmp: (srcName: string, targetName: string | null, targetGroupKey: RoleOrSectionKey | null) => void
  optimizedCellKeys: Record<string, true>
  shiftedFromCellKeys: Record<string, true>
  shiftedToCellKeys: Record<string, true>
  optimizationRun: number
  optimizationState: 'idle' | 'running' | 'done'
}) {
  const [hoveredRun, setHoveredRun] = useState<string | null>(null)
  const dayKey = (k: keyof GridPreviewLabels['days']) => labels.days[k]
  const isExt = mode === 'extended'
  const colW = isExt ? 86 : 56
  const colMinW = isExt ? 78 : 44
  const rowPad = isExt ? '3px' : '6px 5px'
  const detailCellFontSize = isExt ? 13 : 11.2
  const detailCellAltFontSize = isExt ? 11.5 : 12
  const detailInlineChipMinHeight = isExt ? 46 : 36
  const detailHeaderDayFontSize = isExt ? 11 : 14.5
  const detailHeaderWeekdayFontSize = isExt ? 9 : 11.5
  const nameColW = detailEmployeeNameColumnWidth({
    mode,
    sticky,
    showEmployeeRole,
    showEmployeeDepartment,
    showEmployeeDot,
    showTelegram,
  })
  const nameColTransition = 'width 160ms ease, min-width 160ms ease, max-width 160ms ease'
  const dndEnabled = false
  const showProblemColumn = optimizationRun <= 1
  const allRows = groups.flatMap((group) => group.rows)
  const onShiftGroup = groups.find((group) => group.key === onShiftScope && group.rows.length > 0)
  const onShiftRows = onShiftGroup?.rows ?? allRows

  function workLabel(emp: EmpDef): string {
    if (!showTimes) return isExt ? chipLblFull.W : chipLbl.W
    return compactShiftWindow(emp.shift)
  }

  function shiftWindowParts(window: string): string[] {
    return window
      .split('–')
      .map((part) => `${part.trim().padStart(2, '0')}:00`)
  }

  return (
    <div style={{ overflowX: 'auto' }}>
	      <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content', minWidth: 'max-content', fontSize: 11, tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th
              style={{
                position: 'sticky', left: 0, zIndex: 10,
                background: 'var(--grid-cell)',
                padding: '6px 12px 6px 10px', width: nameColW, minWidth: nameColW, maxWidth: nameColW,
                boxSizing: 'border-box',
                overflow: 'hidden',
                transition: nameColTransition,
                borderRight: '1px solid var(--border)',
                textAlign: 'left', fontWeight: 500,
                color: 'var(--muted-foreground)', fontSize: 10,
              }}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels.employee}</span>
                <button
                  type="button"
                  onClick={onToggleProjects}
                  className="hidden cursor-pointer transition-colors sm:inline-block"
                  style={{
                    background: showTelegram ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
                    color: showTelegram ? 'var(--accent)' : 'var(--muted-foreground)',
                    border: 0, borderRadius: 5, padding: '2px 7px',
                    fontSize: 9.5, fontWeight: 600,
                    textTransform: 'none', letterSpacing: 0,
                    minWidth: 76,
                    textAlign: 'center',
                  }}
                >
                  {showTelegram ? labels.telegramBtn : labels.projectsBtn}
                </button>
              </div>
            </th>
            {days.map((d, ci) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              const isProblem = ci === PROBLEM_DAY_IDX && showProblemColumn
              return (
                <th
                  key={d.n}
                  style={{
	                    width: colW, minWidth: colMinW, padding: isExt ? '4px 2px' : '7px 4px', textAlign: 'center',
                    background: isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--muted-foreground)',
                    position: 'relative',
                    overflow: 'hidden',
                    ...problemColumnStyle(ci, showProblemColumn),
                  }}
                >
	                  <div style={{ fontWeight: 600, fontSize: detailHeaderDayFontSize }}>{d.n}</div>
	                  <div style={{ fontSize: detailHeaderWeekdayFontSize, opacity: 0.65 }}>{dayKey(d.k)}</div>
                  {isProblem && (
                    <div
                      title={labels.shortageLabel}
                      aria-label={labels.shortageLabel}
                      style={{
                        marginTop: 2,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 14, height: 14, borderRadius: '50%',
                        background: 'var(--accent)', color: '#fff',
                      }}
                    >
                      <AlertCircle style={{ width: 9, height: 9 }} />
                    </div>
                  )}
                </th>
              )
            })}
            <th style={{ width: 40, minWidth: 40, padding: '4px 6px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '2px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colOffDays}
            </th>
            <th style={{ width: 48, minWidth: 48, padding: '4px 6px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colWorkHrs}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.flatMap((dept, di) => [
            ...(!dndEnabled && sticky ? [] : [(
            <tr key={`dept-${dept.key}-${di}`}>
              <td
                onDragOver={(e) => {
                  if (dndEnabled && dragEmp) {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setDragOverGroup(dept.key)
                  }
                }}
                onDragLeave={() => setDragOverGroup(null)}
                onDrop={(e) => {
                  if (!dndEnabled) return
                  e.preventDefault()
                  if (dragEmp) onMoveEmp(dragEmp, null, dept.key as RoleOrSectionKey)
                  setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                }}
                style={{
                  position: 'sticky', left: 0, zIndex: 6,
                  padding: '4px 12px 4px 10px',
                  background: dndEnabled && dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)',
                  width: nameColW, minWidth: nameColW, maxWidth: nameColW,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  transition: `${nameColTransition}, background 0.12s`,
                  textOverflow: 'ellipsis',
                  borderRight: '1px solid var(--border)',
                  fontSize: 10, fontWeight: 600,
                  color: 'var(--grid-dept-fg)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  outline: dndEnabled && dragOverGroup === dept.key ? '2px dashed var(--accent)' : 'none',
                  outlineOffset: -2,
                }}
              >
                <DepartmentDot
                  color={compactDepartmentAccent(dept.name, getRoleColor(dept.key as RoleOrSectionKey))}
                  outer={14}
                  inner={8}
                  marginRight={6}
                />
                ▸ {dept.name}
                {dept.min && (
                  <span style={{ marginLeft: 8, opacity: 0.6, fontWeight: 400, textTransform: 'none' }}>
                    · {labels.minDay.replace('{n}', String(dept.min))}
                  </span>
                )}
              </td>
              <td colSpan={days.length + 2} style={{ background: dndEnabled && dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)' }} />
            </tr>
            )]),
            ...dept.rows.map((emp, ei) => (
              <tr key={`${dept.key}-${ei}`} data-employee-row={emp.name} style={{ borderBottom: '1px solid var(--grid-row-divider)' }}>
                <td
                  onDragOver={(e) => {
                    if (dndEnabled && dragEmp && dragEmp !== emp.name) {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      setDragOverEmp(emp.name)
                    }
                  }}
                  onDragLeave={() => { if (dragOverEmp === emp.name) setDragOverEmp(null) }}
                  onDrop={(e) => {
                    if (!dndEnabled) return
                    e.preventDefault()
                    if (dragEmp && dragEmp !== emp.name) onMoveEmp(dragEmp, emp.name, dept.key as RoleOrSectionKey)
                    setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                  }}
                  style={{
                    position: sticky ? 'sticky' : 'static', left: 0, zIndex: 20,
                    background: isExt
                      ? 'linear-gradient(180deg, color-mix(in oklab, var(--grid-cell) 96%, var(--muted) 4%), var(--grid-cell))'
                      : 'var(--grid-cell)',
	                    padding: isExt ? '8px 10px' : '10px 12px',
                    fontWeight: 500,
                    width: nameColW,
                    minWidth: nameColW,
                    maxWidth: nameColW,
                    boxSizing: 'border-box',
                    transition: nameColTransition,
                    color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden',
                    borderRight: '1px solid var(--border)',
                    boxShadow: sticky ? '1px 0 0 var(--border)' : 'none',
                    borderTop: dndEnabled && dragOverEmp === emp.name ? '2px solid var(--accent)' : '2px solid transparent',
                    opacity: dndEnabled && dragEmp === emp.name ? 0.4 : 1,
                  }}
                >
                  {isExt ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '28px minmax(0, 1fr)',
                        alignItems: 'center',
                        gap: 9,
                        minWidth: 0,
                      }}
                    >
                      <Avatar name={emp.name} size={28} />
                      <div style={{ minWidth: 0, lineHeight: 1.18 }}>
                        <button
                          type="button"
                          draggable={dndEnabled}
                          onClick={() => { if (!dndEnabled) onEmpClick(emp.name) }}
                          onDragStart={(e) => {
                            if (!dndEnabled) {
                              e.preventDefault()
                              return
                            }
                            setDragEmp(emp.name)
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', emp.name)
                            setEmployeeRowDragImage(e, e.currentTarget.closest('[data-employee-row]') as HTMLElement | null)
                          }}
                          onDragEnd={() => { setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null) }}
                          className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
                          style={{
                            display: 'block',
                            maxWidth: '100%',
                            border: 0,
                            color: 'var(--foreground)',
                            cursor: dndEnabled ? 'grab' : 'pointer',
                            fontFamily: 'inherit',
                                  fontSize: detailCellFontSize,
                            fontWeight: 650,
                            letterSpacing: 0,
                            userSelect: dndEnabled ? 'none' : 'auto',
                          }}
                        >
                          {employeeDisplayName(emp, labels)}
                        </button>
                        <div style={{ marginTop: 4, minWidth: 0 }}>
                          {showTelegram ? (
                            <DepartmentPositionCard
                              department={labels.telegramBtn}
                              position={emp.tg}
                              accent="#3884de"
                              maxWidth="100%"
                              shrink
                              onClick={() => onProjectClick(emp.name, emp.pIdx)}
                            />
                          ) : (
                            <DepartmentPositionCard
                              department={getRoleLabel(getEmpRoleKey(emp))}
                              position={getEmpSpecialty(emp)}
                              departmentAccent={getRoleColor(getEmpRoleKey(emp))}
                              accent={getSpecialtyColor(getEmpSpecialty(emp))}
                              showDepartment={sticky && showEmployeeDepartment}
                              showPosition={showEmployeeRole}
                              showDot={showEmployeeDot}
                              maxWidth="100%"
                              shrink
                              onClick={() => onOpenRolePicker(emp.name)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
	                  ) : (
	                    <div
	                      style={{
	                        cursor: 'default',
	                        maxWidth: '100%',
	                        overflow: 'hidden',
	                        display: 'grid',
	                        gridTemplateColumns: '20px minmax(0, 1fr)',
	                        alignItems: 'center',
	                        columnGap: 8,
	                      }}
	                    >
	                      <Avatar name={emp.name} size={20} />
	                      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
	                        <button
	                          type="button"
	                          draggable={dndEnabled}
	                          onClick={() => { if (!dndEnabled) onEmpClick(emp.name) }}
	                          onDragStart={(e) => {
	                            if (!dndEnabled) {
	                              e.preventDefault()
	                              return
	                            }
	                            setDragEmp(emp.name)
	                            e.dataTransfer.effectAllowed = 'move'
	                            e.dataTransfer.setData('text/plain', emp.name)
	                            setEmployeeRowDragImage(e, e.currentTarget.closest('[data-employee-row]') as HTMLElement | null)
	                          }}
	                          onDragEnd={() => { setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null) }}
	                          className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
	                          style={{
	                            minWidth: 0,
	                            border: 0,
	                            color: 'inherit',
	                            cursor: dndEnabled ? 'grab' : 'pointer',
	                            fontFamily: 'inherit',
	                            fontSize: 14,
	                            fontWeight: 600,
	                            lineHeight: 1.08,
	                            userSelect: dndEnabled ? 'none' : 'auto',
	                          }}
	                        >
	                          {employeeDisplayName(emp, labels)}
	                        </button>
	                        <button
	                          type="button"
	                          onClick={() => showTelegram ? onProjectClick(emp.name, emp.pIdx) : onOpenRolePicker(emp.name)}
	                          className="truncate bg-transparent p-0 text-left"
	                          style={{
	                            minWidth: 0,
	                            border: 0,
	                            color: 'var(--muted-foreground)',
	                            cursor: 'pointer',
	                            fontFamily: 'inherit',
	                            fontSize: 11,
	                            fontWeight: 600,
	                            lineHeight: 1.08,
	                            display: 'inline-flex',
	                            alignItems: 'center',
	                            gap: 5,
	                          }}
	                        >
	                          <span
	                            aria-hidden="true"
	                            style={{
	                              width: 7,
	                              height: 7,
	                              borderRadius: '50%',
	                              flexShrink: 0,
	                              background: showTelegram ? '#3884de' : getRoleColor(getEmpRoleKey(emp)),
	                              boxShadow: `0 0 0 2px color-mix(in oklab, ${showTelegram ? '#3884de' : getRoleColor(getEmpRoleKey(emp))} 18%, transparent)`,
	                            }}
	                          />
	                          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
	                            {showTelegram ? `${labels.telegramBtn} › ${emp.tg}` : `${dept.name} › ${getEmpSpecialty(emp)}`}
	                          </span>
	                        </button>
	                      </div>
	                    </div>
	                  )}
                </td>
                {merged ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  days.forEach((_d, ci) => {
                    let code = statusOf(emp.name, ci, emp.s)
                    if (code === 'U' && ci !== PROBLEM_DAY_IDX) code = 'W'
                    const last = runs[runs.length - 1]
                    if (last && last.code === code) { last.indices.push(ci) }
                    else { runs.push({ code, indices: [ci] }) }
                  })
                  return runs.map((run, ri) => {
                    const { code, indices } = run
                    const span = indices.length
                    const isOff = code === '-' || code === undefined
                    const allWkd = indices.every(i => { const d = days[i]; return d.k === 'sat' || d.k === 'sun' })
                    const raw = code as Exclude<Status, '-'>
                    const runKey = `${emp.name}-${ri}`
                    const isHovered = hoveredRun === runKey
                    const isOptimizedRun = optimizationState !== 'idle' && optimizationRun > 1 && indices.some((i) => optimizedCellKeys[`${emp.name}-${i}`])
                    return (
                      <td
                        key={`run-${ri}`}
                        colSpan={span}
                        onMouseEnter={() => setHoveredRun(runKey)}
                        onMouseLeave={() => setHoveredRun(null)}
                        style={{
                          padding: rowPad, textAlign: 'center',
                          position: 'relative',
                          background: allWkd ? weekendBg : 'var(--grid-cell)',
                          borderRight: showGrid ? '1px solid var(--border)' : 'none',
                          animation: isOptimizedRun ? 'smengo-ai-cell-pop 760ms cubic-bezier(.22,1,.36,1)' : 'none',
                        }}
                      >
                        {isHovered && span > 1 && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}%))`,
                          }} />
                        )}
                        {!isOff && (isExt ? (() => {
                          const runCode = raw as Exclude<Status, '-'>
                          const wm = workMeta(emp.shift, labels)
                          const bg = runCode === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(runCode)
                          const isU = runCode === 'U'

                          if (runCode === 'W') {
                            const ShiftIcon = emp.shift === 'night' ? Moon : Sun
                            const [shiftStart, shiftEnd] = shiftWindowParts(wm.window)
                            return (
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: bg,
                                  color: '#fff',
                                  padding: '5px 6px',
                                  borderRadius: 8,
                                  minHeight: 46,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                  textAlign: 'center',
                                }}
                              >
                                <span
                                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
                                  style={{ position: 'absolute', top: 5, left: 6, width: 16, height: 16 }}
                                >
                                  <ShiftIcon size={10} strokeWidth={2.5} className="text-white" />
                                </span>
                                <span
                                  style={{
                                    minWidth: 0,
                                    maxWidth: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: detailCellFontSize,
                                    fontWeight: 700,
                                    lineHeight: 1.02,
                                    whiteSpace: 'nowrap',
                                    transform: 'translateX(8px)',
                                  }}
                                >
                                  {showTimes ? (
                                    <>
                                      <span>{shiftStart}</span>
                                      <span>{shiftEnd}</span>
                                    </>
                                  ) : wm.name}
                                </span>
                              </div>
                            )
                          }

                          if (runCode === 'D') {
                            return (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: 46,
                                  background: bg,
                                  color: 'var(--chip-d-fg)',
                                  padding: '5px 7px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 750,
                                  lineHeight: 1.05,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                  textAlign: 'center',
                                }}
                              >
                                {labels.shifts.dayoff}
                              </div>
                            )
                          }

                          if (runCode === 'V' || runCode === 'S') {
                            const LeaveIcon = runCode === 'S' ? Thermometer : TreePalm
                            const label = runCode === 'S' ? labels.shifts.sick : labels.shifts.vacation
                            return (
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: 46,
                                  background: bg,
                                  color: '#fff',
                                  padding: '5px 7px',
                                  borderRadius: 8,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                  textAlign: 'center',
                                }}
                              >
                                <span
                                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
                                  style={{ position: 'absolute', top: 5, left: 6, width: 16, height: 16 }}
                                >
                                  <LeaveIcon size={10} strokeWidth={2.5} className="text-white" />
                                </span>
                                <span
                                  style={{
                                    color: '#fff',
                                    fontSize: 11.5,
                                    fontWeight: 750,
                                    lineHeight: 1.05,
                                    whiteSpace: 'normal',
                                    overflowWrap: 'anywhere',
                                    transform: 'translateY(7px)',
                                  }}
                                >
                                  {label}
                                </span>
                              </div>
                            )
                          }

                          const label = labels.statusUncovered
                          return (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                width: '100%',
                                minHeight: 46,
                                background: isU ? 'transparent' : bg,
                                color: isU ? 'var(--st-uncovered)' : '#fff',
                                border: isU ? '1.5px dashed var(--st-uncovered)' : 'none',
                                padding: '5px 7px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 750,
                                lineHeight: 1,
                                textAlign: 'center',
                                boxShadow: isU ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                              }}
                            >
                              {isU && <AlertCircle size={11} strokeWidth={2.4} />}
                              <span>{label}</span>
                            </div>
                          )
                        })() : (
	                          <div style={{
	                            display: 'flex', alignItems: 'center', justifyContent: 'center',
	                            background: chipBg(raw), color: chipFg(raw),
	                            width: 'calc(100% - 4px)',
	                            maxWidth: '100%',
	                            boxSizing: 'border-box',
	                            margin: '0 auto',
	                            padding: '1px 5px', borderRadius: 3,
	                            minWidth: 0,
	                            minHeight: detailInlineChipMinHeight,
	                            fontSize: (code === 'W' || code === 'S') && showTimes ? detailCellFontSize : detailCellAltFontSize,
	                            fontWeight: 500, whiteSpace: 'nowrap',
	                          }}>
                            {code === 'W' ? workLabel(emp) : chipLbl[raw]}
                          </div>
                        ))}
                      </td>
                    )
                  })
                })() : days.map((d, ci) => {
                  let raw = statusOf(emp.name, ci, emp.s)
                  if (raw === 'U' && ci !== PROBLEM_DAY_IDX) raw = 'W'
                  const isWkd = d.k === 'sat' || d.k === 'sun'
                  const isOff = raw === '-' || raw === undefined
                  const cellInteractive = editMode
                  const tip = isOff || (isExt && raw === 'W') ? '' : cellTooltip(raw, emp.shift, labels)
                  const aiCellKey = `${emp.name}-${ci}`
                  const aiCanAnimate = optimizationState !== 'idle' && optimizationRun > 1
                  const isOptimizedCell = aiCanAnimate && optimizedCellKeys[aiCellKey]
                  const isShiftSourceCell = aiCanAnimate && shiftedFromCellKeys[aiCellKey]
                  const isShiftTargetCell = aiCanAnimate && shiftedToCellKeys[aiCellKey]
                  const isAiAnimatedCell = isOptimizedCell || isShiftSourceCell || isShiftTargetCell
                  return (
	                    <td
	                      key={d.n}
	                      className={editMode ? 'smengo-schedule-edit-cell' : undefined}
	                      title={tip || undefined}
	                      onClick={cellInteractive ? (e) => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        onCellEdit(emp.name, ci, r.left + r.width / 2, r.bottom + 6)
                      } : undefined}
                      style={{
                        padding: rowPad, textAlign: 'center',
	                        background: isWkd ? weekendBg : 'var(--grid-cell)',
	                        position: 'relative',
	                        borderRight: showGrid ? '1px solid var(--border)' : 'none',
	                        cursor: cellInteractive ? 'pointer' : 'default',
	                        animation: aiCellAnimation(!!isOptimizedCell, !!isShiftSourceCell, !!isShiftTargetCell),
	                        transformOrigin: 'center',
	                        willChange: isAiAnimatedCell ? 'box-shadow' : 'auto',
	                        contain: isAiAnimatedCell ? 'paint' : undefined,
	                      }}
                    >
                      {isOff ? (
                        <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
                      ) : (() => {
                        const code = raw as Exclude<Status, '-'>
                        const wm = workMeta(emp.shift, labels)
                        const WIcon = wm.Icon
                        const StIcon = statusIcon(code)
                        const bg = code === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(code)
                        const fg = chipFg(code)
                        const isU = code === 'U'
                        if (isExt) {
                          if (code === 'W') {
                            const ShiftIcon = emp.shift === 'night' ? Moon : Sun
                            const [shiftStart, shiftEnd] = shiftWindowParts(wm.window)
                            return (
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: bg,
                                  color: '#fff',
                                  padding: '5px 6px',
                                  borderRadius: 8,
                                  minHeight: 46,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                  textAlign: 'center',
                                }}
                              >
                                <span
                                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
                                  style={{ position: 'absolute', top: 5, left: 6, width: 16, height: 16 }}
                                >
                                  <ShiftIcon size={10} strokeWidth={2.5} className="text-white" />
                                </span>
                                <span
                                  style={{
                                    minWidth: 0,
                                    maxWidth: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: detailCellFontSize,
                                    fontWeight: 700,
                                    lineHeight: 1.02,
                                    whiteSpace: 'nowrap',
                                    transform: 'translateX(8px)',
                                  }}
                                >
                                  {showTimes ? (
                                    <>
                                      <span>{shiftStart}</span>
                                      <span>{shiftEnd}</span>
                                    </>
                                  ) : wm.name}
                                </span>
                              </div>
                            )
                          }

                          if (code === 'D') {
                            return (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: 46,
                                  background: bg,
                                  color: 'var(--chip-d-fg)',
                                  padding: '5px 7px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 750,
                                  lineHeight: 1.05,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                  textAlign: 'center',
                                }}
                              >
                                {labels.shifts.dayoff}
                              </div>
                            )
                          }

                          if (code === 'V' || code === 'S') {
                            const LeaveIcon = code === 'S' ? Thermometer : TreePalm
                            const label = code === 'S' ? labels.shifts.sick : labels.shifts.vacation
                            return (
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: 46,
                                  background: bg,
                                  color: '#fff',
                                  padding: '5px 7px',
                                  borderRadius: 8,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                  textAlign: 'center',
                                }}
                              >
                                <span
                                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
                                  style={{ position: 'absolute', top: 5, left: 6, width: 16, height: 16 }}
                                >
                                  <LeaveIcon size={10} strokeWidth={2.5} className="text-white" />
                                </span>
                                <span
                                  style={{
                                    color: '#fff',
                                    fontSize: 11.5,
                                    fontWeight: 750,
                                    lineHeight: 1.05,
                                    whiteSpace: 'normal',
                                    overflowWrap: 'anywhere',
                                    transform: 'translateY(7px)',
                                  }}
                                >
                                  {label}
                                </span>
                              </div>
                            )
                          }

                          const label = labels.statusUncovered

                          return (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                width: '100%',
                                minHeight: 46,
                                background: isU ? 'transparent' : bg,
                                color: isU ? 'var(--st-uncovered)' : '#fff',
                                border: isU ? '1.5px dashed var(--st-uncovered)' : 'none',
                                padding: '5px 7px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 750,
                                lineHeight: 1,
                                textAlign: 'center',
                                boxShadow: isU ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                              }}
                            >
                              {isU && <AlertCircle size={11} strokeWidth={2.4} />}
                              <span>{label}</span>
                            </div>
                          )
                        }
                        return (
                          <div
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              background: isU ? 'transparent' : bg,
                              color: isU ? 'var(--st-uncovered)' : fg,
                              border: isU ? '1.5px dashed var(--st-uncovered)' : 'none',
	                              width: 'calc(100% - 4px)',
	                              maxWidth: '100%',
	                              boxSizing: 'border-box',
	                              margin: '0 auto',
	                              padding: '1px 5px', borderRadius: 3,
	                              minWidth: 0,
	                              minHeight: detailInlineChipMinHeight,
	                              fontSize: (code === 'W' || code === 'S') && showTimes ? detailCellFontSize : detailCellAltFontSize,
	                              fontWeight: 500, whiteSpace: 'nowrap',
	                            }}
                          >
                            {code === 'W' ? (
                              <>
                                <WIcon size={9} strokeWidth={2.4} />
                                {showTimes ? workLabel(emp) : null}
                              </>
	                            ) : StIcon ? (
	                              <>
	                                <StIcon size={11} />
	                                {code === 'S' ? labels.statusSick : chipLbl[code]}
	                              </>
	                            ) : (
	                              chipLbl[code]
	                            )}
                          </div>
                        )
                      })()}
                    </td>
                  )
                })}
                {(() => {
                  let off = 0, work = 0
                  days.forEach((_d, ci) => {
                    let s = statusOf(emp.name, ci, emp.s)
                    if (s === 'U' && ci !== PROBLEM_DAY_IDX) s = 'W'
                    if (s === 'V' || s === 'S' || s === 'D') off++
                    else if (s === 'W') work++
                  })
                  const wm = workMeta(emp.shift, labels)
                  const hrs = work * wm.hours
                  return (
                    <>
                      <td style={{ borderLeft: '2px solid var(--border)', width: 40, minWidth: 40, textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px' }}>
                        <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 600 }}>{off || '—'}</span>
                      </td>
                      <td style={{ borderLeft: '1px solid var(--border)', width: 48, minWidth: 48, textAlign: 'center', background: 'var(--grid-cell)', padding: '4px 2px' }}>
                        <span style={{ fontSize: 10, color: 'var(--foreground)', fontWeight: 600 }}>{hrs > 0 ? `${hrs}${labels.hourSuffix}` : '—'}</span>
                      </td>
                    </>
                  )
                })()}
              </tr>
            )),
          ])}
        </tbody>
        <tfoot>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td
                style={{
                  position: sticky ? 'sticky' : 'static',
                  left: 0,
                  zIndex: 4,
	                  padding: isExt ? '6px 10px' : '8px 12px',
                  width: nameColW,
                  minWidth: nameColW,
                  maxWidth: nameColW,
                  boxSizing: 'border-box',
                  background: 'var(--grid-cell)',
                  color: 'var(--muted-foreground)',
                  borderRight: '1px solid var(--border)',
	                  fontSize: isExt ? 10 : 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minWidth: 0 }}>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{labels.onShiftRowLabel}</span>
                  <OnShiftScopePicker labels={labels} groups={groups} value={onShiftScope} onChange={onShiftScopeChange} />
                </div>
              </td>
              {onShiftCountsForRows(onShiftRows, statusOf, days).map((count, ci) => {
                const isWkd = days[ci].k === 'sat' || days[ci].k === 'sun'
                return (
                  <td
                    key={ci}
                    style={{
                      width: colW,
                      minWidth: colMinW,
	                      padding: isExt ? '5px 2px' : '7px 4px',
                      textAlign: 'center',
                      background: isWkd ? weekendBg : 'var(--grid-cell)',
                      borderRight: showGrid ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <OnShiftCountCell count={count} total={onShiftRows.length} compact={!isExt} />
                  </td>
                )
              })}
              <td style={{ borderLeft: '2px solid var(--border)', width: 40, minWidth: 40, background: 'var(--grid-cell)' }} />
              <td style={{ borderLeft: '1px solid var(--border)', width: 48, minWidth: 48, background: 'var(--grid-cell)' }} />
            </tr>
          </tfoot>
      </table>
    </div>
  )
}

/* ── Compact mode ──────────────────────────────────────────────── */
function CompactGrid({
  groups, days, statusOf, weekendBg, chipBg, chipFg, contrast, labels,
  showTimes, merged, showGrid, sticky, onShiftScope, onShiftScopeChange, showEmployeeRole, showEmployeeDepartment, showEmployeeDot, showTelegram, onEmpClick, editMode, onToggleProjects, onProjectClick, onCellEdit,
  getEmpRoleKey, getEmpSpecialty, getRoleColor, getSpecialtyColor, onOpenRolePicker,
  dragEmp, setDragEmp, dragOverEmp, setDragOverEmp, dragOverGroup, setDragOverGroup, onMoveEmp,
  optimizedCellKeys, shiftedFromCellKeys, shiftedToCellKeys, optimizationRun, optimizationState,
}: {
  groups: { key: string; name: string; shortName: string; min?: number; rows: EmpDef[] }[]
  days: MonthDay[]
  statusOf: (name: string, dayIdx: number, base: string) => Status
  weekendBg: string
  chipBg: (c: Exclude<Status, '-'>) => string
  chipFg: (c: Exclude<Status, '-'>) => string
  contrast: boolean
  labels: GridPreviewLabels
  showTimes: boolean
  merged: boolean
  showGrid: boolean
  sticky: boolean
  onShiftScope: string
  onShiftScopeChange: (value: string) => void
  showEmployeeRole: boolean
  showEmployeeDepartment: boolean
  showEmployeeDot: boolean
  showTelegram: boolean
  onEmpClick: (name: string) => void
  editMode: boolean
  onToggleProjects: () => void
  onProjectClick: (name: string, pIdx: number) => void
  onCellEdit: (name: string, day: number, px: number, py: number) => void
  getEmpRoleKey: (emp: EmpDef) => RoleOrSectionKey
  getEmpSpecialty: (emp: EmpDef) => string
  getRoleColor: (key: RoleOrSectionKey) => string
  getSpecialtyColor: (role: string) => string
  onOpenRolePicker: (name: string) => void
  dragEmp: string | null
  setDragEmp: (v: string | null) => void
  dragOverEmp: string | null
  setDragOverEmp: (v: string | null) => void
  dragOverGroup: string | null
  setDragOverGroup: (v: string | null) => void
  onMoveEmp: (srcName: string, targetName: string | null, targetGroupKey: RoleOrSectionKey | null) => void
  optimizedCellKeys: Record<string, true>
  shiftedFromCellKeys: Record<string, true>
  shiftedToCellKeys: Record<string, true>
  optimizationRun: number
  optimizationState: 'idle' | 'running' | 'done'
}) {
  const [hoveredRun, setHoveredRun] = useState<string | null>(null)
  const nameColW = compactEmployeeNameColumnWidth({
    sticky,
    showEmployeeRole,
    showEmployeeDepartment,
    showEmployeeDot,
    showTelegram,
  })
  const nameColTransition = 'width 160ms ease, min-width 160ms ease, max-width 160ms ease'
  const dayMinW = 32
  const offColW = 60
  const hoursColW = 60
  const minTableW = nameColW + days.length * dayMinW + offColW + hoursColW
  const dndEnabled = false
  const showProblemColumn = optimizationRun <= 1
  const allRows = groups.flatMap((group) => group.rows)
  const onShiftGroup = groups.find((group) => group.key === onShiftScope && group.rows.length > 0)
  const onShiftRows = onShiftGroup?.rows ?? allRows
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: minTableW, fontSize: 10, tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: nameColW }} />
          {days.map((d) => (
            <col key={d.n} />
          ))}
          <col style={{ width: offColW }} />
          <col style={{ width: hoursColW }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th
              style={{
                position: 'sticky', left: 0, zIndex: 10,
                background: 'var(--grid-cell)',
                padding: '6px 12px 6px 10px',
                width: nameColW,
                minWidth: nameColW,
                maxWidth: nameColW,
                boxSizing: 'border-box',
                overflow: 'hidden',
                transition: nameColTransition,
                borderRight: '1px solid var(--border)',
                textAlign: 'left', fontWeight: 500,
                color: 'var(--muted-foreground)', fontSize: 9.5,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels.employee}</span>
                <button
                  type="button"
                  onClick={onToggleProjects}
                  className="hidden cursor-pointer transition-colors sm:inline-block"
                  style={{
                    background: showTelegram ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
                    color: showTelegram ? 'var(--accent)' : 'var(--muted-foreground)',
                    border: 0, borderRadius: 5, padding: '2px 6px',
                    fontSize: 9, fontWeight: 600,
                    textTransform: 'none', letterSpacing: 0,
                    minWidth: 74,
                    textAlign: 'center',
                  }}
                >
                  {showTelegram ? labels.telegramBtn : labels.projectsBtn}
                </button>
              </div>
            </th>
            {days.map((d, ci) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              const isProblem = ci === PROBLEM_DAY_IDX && showProblemColumn
              return (
                <th
                  key={d.n}
                  style={{
                    padding: '4px 0', textAlign: 'center',
                    background: isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--muted-foreground)',
                    fontWeight: 500, fontSize: 9.5,
                    position: 'relative',
                    overflow: 'hidden',
                    ...problemColumnStyle(ci, showProblemColumn),
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 9.5 }}>{d.n}</div>
                  <div style={{ fontSize: 8, opacity: 0.65 }}>{labels.days[d.k]}</div>
                  {isProblem && (
                    <div
                      title={labels.shortageLabel}
                      aria-label={labels.shortageLabel}
                      style={{
                        marginTop: 2,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 12, height: 12, borderRadius: '50%',
                        background: 'var(--accent)', color: '#fff',
                      }}
                    >
                      <AlertCircle style={{ width: 8, height: 8 }} />
                    </div>
                  )}
                </th>
              )
            })}
            <th style={{ width: offColW, minWidth: offColW, maxWidth: offColW, padding: '4px 4px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '2px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colOffDays}
            </th>
            <th style={{ width: hoursColW, minWidth: hoursColW, maxWidth: hoursColW, padding: '4px 4px', textAlign: 'center', background: 'var(--grid-cell)', color: 'var(--muted-foreground)', fontSize: 9, fontWeight: 600, borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              {labels.colWorkHrs}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.flatMap((dept, di) => [
            ...(!dndEnabled && sticky ? [] : [(
            <tr key={`dept-${dept.key}-${di}`}>
              <td
                onDragOver={(e) => {
                  if (dndEnabled && dragEmp) {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setDragOverGroup(dept.key)
                  }
                }}
                onDragLeave={() => setDragOverGroup(null)}
                onDrop={(e) => {
                  if (!dndEnabled) return
                  e.preventDefault()
                  if (dragEmp) onMoveEmp(dragEmp, null, dept.key as RoleOrSectionKey)
                  setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                }}
                style={{
                  position: 'sticky', left: 0, zIndex: 6,
                  padding: '3px 12px 3px 10px',
                  background: dndEnabled && dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)',
                  width: nameColW,
                  minWidth: nameColW,
                  maxWidth: nameColW,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  transition: `${nameColTransition}, background 0.12s`,
                  textOverflow: 'ellipsis',
                  borderRight: '1px solid var(--border)',
                  fontSize: 9.5, fontWeight: 600,
                  color: 'var(--grid-dept-fg)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  outline: dndEnabled && dragOverGroup === dept.key ? '2px dashed var(--accent)' : 'none',
                  outlineOffset: -2,
                }}
              >
                <DepartmentDot
                  color={compactDepartmentAccent(dept.name, getRoleColor(dept.key as RoleOrSectionKey))}
                  outer={14}
                  inner={8}
                  marginRight={5}
                />
                ▸ {dept.name}
              </td>
              <td colSpan={days.length + 2} style={{ background: dndEnabled && dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)' }} />
            </tr>
            )]),
            ...dept.rows.map((emp, ei) => (
              <tr key={`${dept.key}-${ei}`} data-employee-row={emp.name} style={{ borderBottom: '1px solid var(--grid-row-divider)' }}>
                <td
                  onDragOver={(e) => {
                    if (dndEnabled && dragEmp && dragEmp !== emp.name) {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      setDragOverEmp(emp.name)
                    }
                  }}
                  onDragLeave={() => { if (dragOverEmp === emp.name) setDragOverEmp(null) }}
                  onDrop={(e) => {
                    if (!dndEnabled) return
                    e.preventDefault()
                    if (dragEmp && dragEmp !== emp.name) onMoveEmp(dragEmp, emp.name, dept.key as RoleOrSectionKey)
                    setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null)
                  }}
                  style={{
                    position: sticky ? 'sticky' : 'static', left: 0, zIndex: 5,
                    background: 'var(--grid-cell)',
                    padding: '3px 12px 3px 10px', fontWeight: 500,
                    width: nameColW,
                    minWidth: nameColW,
                    maxWidth: nameColW,
                    boxSizing: 'border-box',
                    transition: nameColTransition,
                    borderRight: '1px solid var(--border)',
                    color: 'var(--foreground)', whiteSpace: 'nowrap', fontSize: 11, overflow: 'hidden',
                    borderTop: dndEnabled && dragOverEmp === emp.name ? '2px solid var(--accent)' : '2px solid transparent',
                    opacity: dndEnabled && dragEmp === emp.name ? 0.4 : 1,
                  }}
                >
                  <div
                    className="flex min-w-0 items-center gap-2"
                    style={{ cursor: 'default', maxWidth: '100%', overflow: 'hidden' }}
                  >
                    <Avatar name={emp.name} size={16} />
                    <button
                      type="button"
                      draggable={dndEnabled}
                      onClick={() => { if (!dndEnabled) onEmpClick(emp.name) }}
                      onDragStart={(e) => {
                        if (!dndEnabled) {
                          e.preventDefault()
                          return
                        }
                        setDragEmp(emp.name)
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', emp.name)
                        setEmployeeRowDragImage(e, e.currentTarget.closest('[data-employee-row]') as HTMLElement | null)
                      }}
                      onDragEnd={() => { setDragEmp(null); setDragOverEmp(null); setDragOverGroup(null) }}
                      className="cursor-pointer truncate bg-transparent p-0 text-left transition-colors hover:text-accent"
                      style={{
                        flex: '0 1 auto',
                        minWidth: 0,
                        border: 0,
                        color: 'inherit',
                        cursor: dndEnabled ? 'grab' : 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 14.5 * 0.85,
                        lineHeight: 1.1,
                        userSelect: dndEnabled ? 'none' : 'auto',
                      }}
                    >
                      {employeeDisplayName(emp, labels)}
                    </button>
                    {showTelegram ? (
                      <DepartmentPositionCard
                        department={labels.telegramBtn}
                        position={emp.tg}
                        accent="#3884de"
                        compact
                        maxWidth={146}
                        shrink
                        onClick={() => onProjectClick(emp.name, emp.pIdx)}
                      />
                    ) : (
                      <DepartmentPositionCard
                        department={dept.name}
                        departmentShort={dept.shortName}
                        position={getEmpSpecialty(emp)}
                        departmentAccent={getRoleColor(getEmpRoleKey(emp))}
                        accent={getSpecialtyColor(getEmpSpecialty(emp))}
                        compact
                        variant="compactSchedule"
                        maxWidth={178}
                        textScale={0.85}
                        showDepartment={sticky && showEmployeeDepartment}
                        showPosition={showEmployeeRole}
                        showDot={showEmployeeDot}
                        shrink
                        onClick={() => onOpenRolePicker(emp.name)}
                      />
                    )}
                  </div>
                </td>
                {merged ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  days.forEach((_d, ci) => {
                    let code = statusOf(emp.name, ci, emp.s)
                    if (code === 'U' && ci !== PROBLEM_DAY_IDX) code = 'W'
                    const last = runs[runs.length - 1]
                    if (last && last.code === code) { last.indices.push(ci) }
                    else { runs.push({ code, indices: [ci] }) }
                  })
                  return runs.map((run, ri) => {
                    const { code, indices } = run
                    const span = indices.length
                    const isOff = code === '-' || code === undefined
                    const allWkd = indices.every(i => { const d = days[i]; return d.k === 'sat' || d.k === 'sun' })
                    const runKey = `${emp.name}-${ri}`
                    const isHovered = hoveredRun === runKey
                    const isOptimizedRun = optimizationState !== 'idle' && optimizationRun > 1 && indices.some((i) => optimizedCellKeys[`${emp.name}-${i}`])
                    return (
                      <td
                        key={`run-${ri}`}
                        colSpan={span}
                        onMouseEnter={() => setHoveredRun(runKey)}
                        onMouseLeave={() => setHoveredRun(null)}
                        style={{
                          padding: '2px 1px',
                          position: 'relative',
                          textAlign: 'center',
                          background: allWkd ? weekendBg : 'var(--grid-cell)',
                          borderRight: showGrid ? '1px solid var(--border)' : 'none',
                          animation: isOptimizedRun ? 'smengo-ai-cell-pop 760ms cubic-bezier(.22,1,.36,1)' : 'none',
                        }}
                      >
                        {isHovered && span > 1 && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}%))`,
                          }} />
                        )}
                        {!isOff && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 'calc(100% - 4px)',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            margin: '0 auto',
                            minWidth: 0,
                            background: chipBg(code as Exclude<Status, '-'>),
                            color: chipFg(code as Exclude<Status, '-'>),
                            borderRadius: 4,
                            fontSize: (code === 'W' || code === 'S') && showTimes ? 7.5 : 9,
                            fontWeight: 600,
                            padding: '3px 2px',
                            lineHeight: 1.1,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                          }}>
                            {code === 'W' && showTimes
                              ? compactShiftWindow(emp.shift)
                              : code === 'S'
                                ? labels.statusSick
                                : code}
                          </div>
                        )}
                      </td>
                    )
                  })
                })() : days.map((d, ci) => {
                  let code = statusOf(emp.name, ci, emp.s)
                  if (code === 'U' && ci !== PROBLEM_DAY_IDX) code = 'W'
                  const isWkd = d.k === 'sat' || d.k === 'sun'
                  const isOff = code === '-' || code === undefined
                  const tip = isOff ? '' : cellTooltip(code, emp.shift, labels)
                  const aiCellKey = `${emp.name}-${ci}`
                  const aiCanAnimate = optimizationState !== 'idle' && optimizationRun > 1
                  const isOptimizedCell = aiCanAnimate && optimizedCellKeys[aiCellKey]
                  const isShiftSourceCell = aiCanAnimate && shiftedFromCellKeys[aiCellKey]
                  const isShiftTargetCell = aiCanAnimate && shiftedToCellKeys[aiCellKey]
                  const isAiAnimatedCell = isOptimizedCell || isShiftSourceCell || isShiftTargetCell
                  return (
	                    <td
	                      key={d.n}
	                      className={editMode ? 'smengo-schedule-edit-cell' : undefined}
	                      title={tip || undefined}
	                      onClick={editMode ? (e) => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        onCellEdit(emp.name, ci, r.left + r.width / 2, r.bottom + 4)
                      } : undefined}
                      style={{
	                        padding: 2, textAlign: 'center',
	                        background: isWkd ? weekendBg : 'var(--grid-cell)',
	                        position: 'relative',
	                        borderRight: showGrid ? '1px solid var(--border)' : 'none',
	                        cursor: editMode ? 'pointer' : 'default',
	                        animation: aiCellAnimation(!!isOptimizedCell, !!isShiftSourceCell, !!isShiftTargetCell),
	                        transformOrigin: 'center',
	                        willChange: isAiAnimatedCell ? 'box-shadow' : 'auto',
	                        contain: isAiAnimatedCell ? 'paint' : undefined,
	                      }}
                    >
                      {isOff ? (
                        <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
                      ) : (() => {
                        const cc = code as Exclude<Status, '-'>
                        const wm = workMeta(emp.shift, labels)
                        const bg = cc === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(cc)
                        const isU = cc === 'U'
                        const timeText = cc === 'W' && showTimes
                          ? compactShiftWindow(emp.shift)
                          : ''
                        const sickText = cc === 'S' ? labels.statusSick : ''
                        return (
                          <div
	                            style={{
	                              display: 'inline-flex',
	                              alignItems: 'center',
	                              justifyContent: 'center',
	                              width: 'calc(100% - 4px)',
	                              maxWidth: '100%',
	                              boxSizing: 'border-box',
	                              margin: '0 auto',
	                              minWidth: 0,
	                              background: isU ? 'transparent' : bg,
	                              color: isU ? 'var(--st-uncovered)' : cc === 'W' ? (contrast ? 'var(--st-work-fg)' : chipFg('W')) : chipFg(cc),
	                              border: isU ? '1px dashed var(--st-uncovered)' : 'none',
                              borderRadius: 4,
                              fontSize: (cc === 'W' || cc === 'S') && showTimes ? 9 : 10.5,
                              fontWeight: 600,
                              padding: '3px 2px', lineHeight: 1.15,
                              minHeight: 16,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                            }}
                          >
                            {isU ? '?' : cc === 'S' ? sickText : timeText}
                          </div>
                        )
                      })()}
                    </td>
                  )
                })}
                {(() => {
                  let off = 0, work = 0
                  days.forEach((_d, ci) => {
                    let s = statusOf(emp.name, ci, emp.s)
                    if (s === 'U' && ci !== PROBLEM_DAY_IDX) s = 'W'
                    if (s === 'V' || s === 'S' || s === 'D') off++
                    else if (s === 'W') work++
                  })
                  const wm = workMeta(emp.shift, labels)
                  const hrs = work * wm.hours
                  return (
                    <>
                      <td style={{ borderLeft: '2px solid var(--border)', width: offColW, minWidth: offColW, maxWidth: offColW, textAlign: 'center', background: 'var(--grid-cell)', padding: '2px 2px' }}>
                        <span style={{ fontSize: 9, color: 'var(--muted-foreground)', fontWeight: 600 }}>{off || '—'}</span>
                      </td>
                      <td style={{ borderLeft: '1px solid var(--border)', width: hoursColW, minWidth: hoursColW, maxWidth: hoursColW, textAlign: 'center', background: 'var(--grid-cell)', padding: '2px 2px' }}>
                        <span style={{ fontSize: 9, color: 'var(--foreground)', fontWeight: 600 }}>{hrs > 0 ? `${hrs}${labels.hourSuffix}` : '—'}</span>
                      </td>
                    </>
                  )
                })()}
              </tr>
            )),
          ])}
        </tbody>
        <tfoot>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td
                style={{
                  position: sticky ? 'sticky' : 'static',
                  left: 0,
                  zIndex: 4,
                  padding: '4px 12px 4px 10px',
                  width: nameColW,
                  minWidth: nameColW,
                  maxWidth: nameColW,
                  boxSizing: 'border-box',
                  background: 'var(--grid-cell)',
                  color: 'var(--muted-foreground)',
                  borderRight: '1px solid var(--border)',
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, minWidth: 0 }}>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{labels.onShiftRowLabel}</span>
                  <OnShiftScopePicker labels={labels} groups={groups} value={onShiftScope} onChange={onShiftScopeChange} />
                </div>
              </td>
              {onShiftCountsForRows(onShiftRows, statusOf, days).map((count, ci) => {
                const isWkd = days[ci].k === 'sat' || days[ci].k === 'sun'
                return (
                  <td
                    key={ci}
                    style={{
                      padding: '4px 0',
                      textAlign: 'center',
                      background: isWkd ? weekendBg : 'var(--grid-cell)',
                      borderRight: showGrid ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <OnShiftCountCell count={count} total={onShiftRows.length} compact />
                  </td>
                )
              })}
              <td style={{ borderLeft: '2px solid var(--border)', width: offColW, minWidth: offColW, maxWidth: offColW, background: 'var(--grid-cell)' }} />
              <td style={{ borderLeft: '1px solid var(--border)', width: hoursColW, minWidth: hoursColW, maxWidth: hoursColW, background: 'var(--grid-cell)' }} />
            </tr>
          </tfoot>
      </table>
    </div>
  )
}
