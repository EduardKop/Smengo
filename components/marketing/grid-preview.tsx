'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import {
  Settings2, Pencil, X, Check, ChevronDown, RotateCcw,
  Sun, Sunset, Moon, TreePalm, Thermometer, AlertCircle, AlertTriangle,
  Palette, Sparkles, LayoutGrid, List, Briefcase, Globe2, Clock3,
  CalendarDays, Send, Mail, Phone, LockKeyhole, Copy,
} from 'lucide-react'
import { CalendarDots, UsersThree } from '@phosphor-icons/react'
import {
  RolePickerModal, AddSectionModal,
  ROLE_COLORS, DEPARTMENT_ROLE_KEYS, SOLID_COLORS, type CustomSection, type RoleOrSectionKey,
} from './grid-shared'
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

const DEMO_MONTH_COUNT = 5
// The two employees whose shifts stay unassigned until the AI run closes them.
export const UNCOVERED_EMPLOYEES: readonly string[] = ['Daria Kos', 'Alex Novikov']

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
  iconColorsLabel: string
  iconColorLabel: string
  textColorLabel: string
  customByThemeLabel: string
  siteThemeLight: string
  siteThemeDark: string
  badgesLabel: string
  badgeAddLabel: string
  badgePlaceholder: string
  badgeRegister: string
  badgeHall: string
  badgeDelivery: string
  badgeVip: string
  badgeTraining: string
  customPhraseLabel: string
  customSectors2: string
  customSectors3: string
  customAnyPhrase: string
  customPhraseN: string
  customEmojiLabel: string
  customLogoLabel: string
  favoriteBtn: string
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

export function currentDemoMonthIdx(reference = new Date()): number | null {
  if (reference.getFullYear() !== DEMO_YEAR) return null
  const monthIdx = reference.getMonth() - DEMO_FIRST_MONTH
  return monthIdx >= 0 && monthIdx < DEMO_MONTH_COUNT ? monthIdx : null
}

export function todayDayIndexForMonth(monthIdx: number, reference = new Date()): number | null {
  if (currentDemoMonthIdx(reference) !== monthIdx) return null
  return reference.getDate() - 1
}

export function scheduleOffsetForMonth(monthIdx: number): number {
  const month = DEMO_FIRST_MONTH + monthIdx
  const firstDowMon0 = (new Date(DEMO_YEAR, month, 1).getDay() + 6) % 7
  return ((firstDowMon0 - 3) % 14 + 14) % 14
}

// The demo's coverage gap must always land on a working weekday (the morning
// crew is 5/2, weekends off), whatever month is on screen — so it follows the
// calendar: the second Wednesday of the month.
export function problemDayIdxForMonth(monthIdx: number): number {
  const firstDowMon0 = (new Date(DEMO_YEAR, DEMO_FIRST_MONTH + monthIdx, 1).getDay() + 6) % 7
  return ((2 - firstDowMon0 + 7) % 7) + 7
}

// 4-char patterns are continuous rotations (e.g. 'WWDD' = 2 on / 2 off).
// Real rotas don't restart on the 1st, so the cycle is anchored to the season
// start (March 1) and runs straight through month boundaries.
export function rotationStatus(base: string, monthIdx: number, dayIdx: number): Status {
  const monthStart = new Date(DEMO_YEAR, DEMO_FIRST_MONTH + monthIdx, 1)
  const seasonStart = new Date(DEMO_YEAR, DEMO_FIRST_MONTH, 1)
  const dayNumber = Math.round((monthStart.getTime() - seasonStart.getTime()) / 86_400_000) + dayIdx
  return base[dayNumber % base.length] as Status
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

// Two pattern kinds: 14-char weekly schedules (5/2, aligned to real weekdays
// via scheduleOffsetForMonth) and 4-char continuous rotations ('WWDD' = 2/2
// night rota, phase-shifted per person so the night line is always covered).
// The coverage gap of the demo lives on the month's second Wednesday (see
// problemDayIdxForMonth), so it exists in every month and never falls on a
// weekend.
// Default team: sales (6), development (2), HR, sales lead, and project manager.
export const BASE_EMPLOYEES: EmpDef[] = [
  { dept: 'sales',     name: 'Anna Petrov',     nameKey: 'annaPetrov',     tg: '@anna_p',   pIdx: 1, roleKey: 'salesDepartment',       specialty: 'sales',     s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'sales',     name: 'Kate Volkova',    nameKey: 'kateVolkova',    tg: '@kate_v',   pIdx: 1, roleKey: 'salesDepartment',       specialty: 'sales',     s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'sales',     name: 'Olga Romanenko',  nameKey: 'olgaRomanenko',  tg: '@olga_r',   pIdx: 1, roleKey: 'salesDepartment',       specialty: 'sales',     s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'sales',     name: 'Mark Sidorov',    nameKey: 'markSidorov',    tg: '@mark_s',   pIdx: 2, roleKey: 'salesDepartment',       specialty: 'retention', s: 'DDWW', shift: 'night' },
  { dept: 'sales',     name: 'Ivan Melnikov',   nameKey: 'ivanMelnikov',   tg: '@ivan_m',   pIdx: 3, roleKey: 'salesDepartment',       specialty: 'retention', s: 'WWDD', shift: 'night' },
  { dept: 'sales',     name: 'Pavel Yurov',     nameKey: 'pavelYurov',     tg: '@pavel_y',  pIdx: 6, roleKey: 'salesDepartment',       specialty: 'retention', s: 'DWWD', shift: 'night' },
  { dept: 'sales',     name: 'Roma Karpov',     nameKey: 'romaKarpov',     tg: '@roma_k',   pIdx: 5, roleKey: 'salesDepartment',       specialty: 'salesLead', s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'ops',       name: 'Daria Kos',       nameKey: 'dariaKos',       tg: '@daria_k',  pIdx: 1, roleKey: 'developmentDepartment', specialty: 'frontEnd',  s: 'WWDDWWWWWDDWWW', shift: 'morning' },
  { dept: 'ops',       name: 'Alex Novikov',    nameKey: 'alexNovikov',    tg: '@alex_n',   pIdx: 2, roleKey: 'developmentDepartment', specialty: 'backEnd',   s: 'WWDDWWWWWDDWWW', shift: 'morning' },
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


type CustomCellSector = { text: string; emoji: string; logo: string; color: string; textColor: string }
type CustomCellBody = {
  mode: 'single' | 'split'
  sectorCount: 1 | 2 | 3
  sectors: CustomCellSector[]
}
type CustomCellConfig = CustomCellBody & {
  themeMode?: 'single' | 'split'
  themes?: Partial<Record<SiteTone, CustomCellBody>>
}
type SiteTone = 'light' | 'dark'
type VisualCardColorKey = 'work' | 'vacation' | 'sick' | 'dayoff' | 'uncovered'
type VisualCardColorValue = { icon: string; text: string }
type VisualCardColorConfig = Record<VisualCardColorKey, VisualCardColorValue>
type VisualCardColorThemes = Record<SiteTone, VisualCardColorConfig>

const STATUS_OPTIONS: Exclude<Status, never>[] = ['W', 'V', 'S', 'D', '-']
const CUSTOM_CELL_FAVORITES_KEY = 'smengo:demo:customCellFavorites'
const CUSTOM_EMOJI_OPTIONS = ['', '⭐', '🔥', '☕', '🍕', '💬', '✅', '⚠️']
const CUSTOM_LOGO_OPTIONS = ['', 'SM', 'HR', 'POS', 'CRM', 'VIP', 'OPS']
const CUSTOM_COLOR_OPTIONS = [
  { label: 'Чёрный', value: '#000000' },
  { label: 'Графит', value: '#3f4247' },
  { label: 'Серый 700', value: '#676a6e' },
  { label: 'Серый 500', value: '#96999c' },
  { label: 'Серый 400', value: '#b8babd' },
  { label: 'Серый 300', value: '#cfcfd1' },
  { label: 'Серый 200', value: '#dedfe1' },
  { label: 'Серый 100', value: '#eff0f0' },
  { label: 'Белый', value: '#f8f8f6' },
  { label: 'Зелёный смены', value: '#19795f' },
  { label: 'Фиолетовый смены', value: '#5a3aa4' },
  { label: 'Красный', value: '#b50000' },
  { label: 'Алый', value: '#ff1414' },
  { label: 'Оранжевый', value: '#ff9b12' },
  { label: 'Жёлтый', value: '#fff10a' },
  { label: 'Лайм', value: '#00ed00' },
  { label: 'Бирюза', value: '#1ad9d2' },
  { label: 'Синий', value: '#4c86dd' },
  { label: 'Синий яркий', value: '#0800f5' },
  { label: 'Фиолетовый', value: '#8f00f4' },
  { label: 'Фуксия', value: '#ea0ee7' },
  { label: 'Розовый светлый', value: '#efb9ad' },
  { label: 'Пудра', value: '#f5c9c2' },
  { label: 'Персик светлый', value: '#f8dbb2' },
  { label: 'Крем', value: '#fff0c7' },
  { label: 'Мята светлая', value: '#d8efd2' },
  { label: 'Лёд', value: '#d4e7e9' },
  { label: 'Голубой светлый', value: '#c8dcf7' },
  { label: 'Небо', value: '#c2dcec' },
  { label: 'Лаванда светлая', value: '#d7cde3' },
  { label: 'Роза светлая', value: '#e8cad9' },
  { label: 'Коралловый', value: '#e37b66' },
  { label: 'Розовый', value: '#ee8d8d' },
  { label: 'Персик', value: '#fac58d' },
  { label: 'Песочный', value: '#ffdf94' },
  { label: 'Шалфей', value: '#acd09c' },
  { label: 'Серо-бирюзовый', value: '#9cc5c8' },
  { label: 'Голубой', value: '#9dbdea' },
  { label: 'Голубой 2', value: '#91bedf' },
  { label: 'Сирень', value: '#aa9bcf' },
  { label: 'Пыльная роза', value: '#d1a0b9' },
  { label: 'Терракота', value: '#dc4524' },
  { label: 'Лосось', value: '#e66364' },
  { label: 'Абрикос', value: '#f5ad60' },
  { label: 'Золотистый', value: '#ffd160' },
  { label: 'Зелёный мягкий', value: '#87bd75' },
  { label: 'Морская волна', value: '#75a9b3' },
  { label: 'Синий мягкий', value: '#6fa1e5' },
  { label: 'Лазурный', value: '#65a5dc' },
  { label: 'Пурпурный', value: '#8876bb' },
  { label: 'Мальва', value: '#c47ca7' },
  { label: 'Кирпичный', value: '#bd210c' },
  { label: 'Красный тёмный', value: '#dc0000' },
  { label: 'Мандарин', value: '#ec8b27' },
  { label: 'Горчица', value: '#f4bd2b' },
  { label: 'Трава', value: '#5ca147' },
  { label: 'Петроль', value: '#3c8793' },
  { label: 'Синий насыщенный', value: '#397bd6' },
  { label: 'Синяя сталь', value: '#327dbd' },
  { label: 'Индиго', value: '#6849a2' },
  { label: 'Ягодный', value: '#ad4779' },
  { label: 'Коричневый красный', value: '#97250e' },
  { label: 'Бордовый', value: '#b00000' },
  { label: 'Охра', value: '#bd6500' },
  { label: 'Жёлто-коричневый', value: '#d29b00' },
  { label: 'Золото смены', value: '#6d5724' },
  { label: 'Зелёный тёмный', value: '#2f7b20' },
  { label: 'Бирюза тёмная', value: '#155b68' },
  { label: 'Синий смены', value: '#2f5f9f' },
  { label: 'Синий глубокий', value: '#1d5dcc' },
  { label: 'Синий морской', value: '#0b5a9a' },
  { label: 'Бордо смены', value: '#743944' },
  { label: 'Фиолетовый тёмный', value: '#3d2275' },
  { label: 'Винный', value: '#7d1d4b' },
  { label: 'Марсала', value: '#6d1606' },
  { label: 'Гранат', value: '#740000' },
  { label: 'Кофе', value: '#864500' },
  { label: 'Золото тёмное', value: '#9b7500' },
  { label: 'Лес', value: '#1e5514' },
  { label: 'Нефть', value: '#0d3d45' },
  { label: 'Ночное синее', value: '#244b91' },
  { label: 'Полночь', value: '#06395e' },
  { label: 'Графит смены', value: '#27303c' },
  { label: 'Черника', value: '#28145a' },
  { label: 'Слива', value: '#4b0d33' },
]
const DEFAULT_CUSTOM_COLOR = '#19795f'
const DEFAULT_CUSTOM_TEXT_COLOR = '#ffffff'
const DEFAULT_CUSTOM_SECTOR_COLORS = ['#19795f', '#5a3aa4', '#743944']
const DEFAULT_CUSTOM_SECTOR_TEXT_COLORS = ['#ffffff', '#ffffff', '#ffffff']
const VISUAL_ICON_COLORS_KEY = 'smengo:demo:visualIconColors'
const DEFAULT_VISUAL_ICON_COLORS: VisualCardColorThemes = {
  light: {
    work: { icon: '#ffffff', text: '#ffffff' },
    vacation: { icon: '#ffffff', text: '#ffffff' },
    sick: { icon: '#ffffff', text: '#ffffff' },
    dayoff: { icon: '#7a8290', text: '#7a8290' },
    uncovered: { icon: '#d97757', text: '#d97757' },
  },
  dark: {
    work: { icon: '#ffffff', text: '#e4e4e7' },
    vacation: { icon: '#fcd34d', text: '#ffffff' },
    sick: { icon: '#fca5a5', text: '#ffffff' },
    dayoff: { icon: '#94a3b8', text: '#94a3b8' },
    uncovered: { icon: '#fb7c64', text: '#fb7c64' },
  },
}

function detectSiteTone(): SiteTone {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function normalizeVisualCardThemeConfig(tone: SiteTone, value?: Partial<Record<VisualCardColorKey, string | Partial<VisualCardColorValue>>>): VisualCardColorConfig {
  const defaults = DEFAULT_VISUAL_ICON_COLORS[tone]
  return (Object.keys(defaults) as VisualCardColorKey[]).reduce<VisualCardColorConfig>((acc, key) => {
    const incoming = value?.[key]
    acc[key] = typeof incoming === 'string'
      ? { ...defaults[key], icon: incoming }
      : { ...defaults[key], ...(incoming ?? {}) }
    return acc
  }, {} as VisualCardColorConfig)
}

function normalizeVisualIconColors(value: unknown): VisualCardColorThemes {
  const parsed = value as Partial<Record<SiteTone, Partial<Record<VisualCardColorKey, string | Partial<VisualCardColorValue>>>>> | null
  return {
    light: normalizeVisualCardThemeConfig('light', parsed?.light),
    dark: normalizeVisualCardThemeConfig('dark', parsed?.dark),
  }
}

function defaultCustomSector(index: number, text = index === 0 ? 'Кастом' : `Блок ${index + 1}`): CustomCellSector {
  return {
    text,
    emoji: '',
    logo: '',
    color: DEFAULT_CUSTOM_SECTOR_COLORS[index] ?? DEFAULT_CUSTOM_COLOR,
    textColor: DEFAULT_CUSTOM_SECTOR_TEXT_COLORS[index] ?? DEFAULT_CUSTOM_TEXT_COLOR,
  }
}

function makeDefaultCustomCell(): CustomCellConfig {
  return {
    mode: 'single',
    sectorCount: 1,
    sectors: [defaultCustomSector(0)],
    themeMode: 'single',
  }
}

function normalizeCustomCellBody(config?: Partial<CustomCellBody>): CustomCellBody {
  const count = config?.mode === 'single' ? 1 : (config?.sectorCount === 3 ? 3 : config?.sectorCount === 2 ? 2 : 1)
  const sectors = Array.from({ length: count }, (_, i) => {
    const fallbackColor = DEFAULT_CUSTOM_SECTOR_COLORS[i] ?? DEFAULT_CUSTOM_COLOR
    const fallbackTextColor = DEFAULT_CUSTOM_SECTOR_TEXT_COLORS[i] ?? DEFAULT_CUSTOM_TEXT_COLOR
    const sector = config?.sectors?.[i] ?? defaultCustomSector(i, '')
    return {
      text: sector.text.trim() || (count === 1 ? 'Кастом' : `Блок ${i + 1}`),
      emoji: sector.emoji,
      logo: sector.logo,
      color: sector.color || fallbackColor,
      textColor: sector.textColor || fallbackTextColor,
    }
  })
  return { mode: count === 1 ? 'single' : 'split', sectorCount: count as 1 | 2 | 3, sectors }
}

function normalizeCustomCellConfig(config: CustomCellConfig): CustomCellConfig {
  const base = normalizeCustomCellBody(config)
  if (config.themeMode === 'split') {
    return {
      ...base,
      themeMode: 'split',
      themes: {
        light: normalizeCustomCellBody(config.themes?.light ?? base),
        dark: normalizeCustomCellBody(config.themes?.dark ?? base),
      },
    }
  }
  return { ...base, themeMode: 'single' }
}

function customCellBodyForTone(config: CustomCellConfig, tone: SiteTone): CustomCellBody {
  const normalized = normalizeCustomCellConfig(config)
  if (normalized.themeMode === 'split') return normalized.themes?.[tone] ?? normalized
  return normalized
}

function resizeCustomCellBody(config: Partial<CustomCellBody>, count: 1 | 2 | 3): CustomCellBody {
  const normalized = normalizeCustomCellBody(config)
  const sectors = Array.from({ length: count }, (_, i) => normalized.sectors[i] ?? {
    text: `Блок ${i + 1}`,
    emoji: '',
    logo: '',
    color: DEFAULT_CUSTOM_SECTOR_COLORS[i] ?? DEFAULT_CUSTOM_COLOR,
    textColor: DEFAULT_CUSTOM_SECTOR_TEXT_COLORS[i] ?? DEFAULT_CUSTOM_TEXT_COLOR,
  })
  return { mode: count === 1 ? 'single' : 'split', sectorCount: count, sectors }
}

function customCellSummary(config: CustomCellConfig): string {
  const body = customCellBodyForTone(config, 'light')
  return body.sectors.map((sector) => `${sector.emoji}${sector.logo ? `${sector.emoji ? ' ' : ''}${sector.logo}` : ''}${sector.text ? `${sector.emoji || sector.logo ? ' ' : ''}${sector.text}` : ''}`.trim()).join(' / ')
}

function readableColorForHex(hex: string): '#111827' | '#ffffff' {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return '#ffffff'
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000
  return luminance > 170 ? '#111827' : '#ffffff'
}

function CustomScheduleChip({
  config,
  tone = 'light',
  compact = false,
  minHeight = 34,
}: {
  config: CustomCellConfig
  tone?: SiteTone
  compact?: boolean
  minHeight?: number
}) {
  const normalized = customCellBodyForTone(config, tone)
  const isSplit = normalized.mode === 'split'
  return (
    <div
      className="smengo-schedule-chip"
      style={{
        width: 'calc(100% - 4px)',
        maxWidth: '100%',
        minHeight,
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateRows: isSplit ? `repeat(${normalized.sectorCount}, minmax(0, 1fr))` : '1fr',
        overflow: 'hidden',
        borderRadius: compact ? 4 : 8,
        background: normalized.sectors[0]?.color ?? DEFAULT_CUSTOM_COLOR,
        color: normalized.sectors[0]?.textColor ?? DEFAULT_CUSTOM_TEXT_COLOR,
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      }}
    >
      {normalized.sectors.map((sector, index) => (
        <div
          key={`${sector.text}-${index}`}
          style={{
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: isSplit ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: compact ? 2 : 4,
            padding: compact ? '1px 2px' : (isSplit ? '2px 4px' : '5px 4px'),
            borderTop: index > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
            background: sector.color,
            color: sector.textColor,
            textAlign: 'center',
          }}
        >
          {(sector.emoji || sector.logo) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: compact ? 8 : 10, lineHeight: 1 }}>
              {sector.emoji && <span>{sector.emoji}</span>}
              {sector.logo && (
                <span style={{ borderRadius: 999, background: 'rgba(255,255,255,0.16)', color: sector.textColor, padding: '1px 4px', fontSize: compact ? 6.5 : 8, fontWeight: 700, letterSpacing: 0.02 }}>
                  {sector.logo}
                </span>
              )}
            </span>
          )}
          <span
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: sector.textColor,
              fontSize: compact ? 8.2 : 11,
              fontWeight: 650,
              lineHeight: 1.05,
            }}
          >
            {sector.text}
          </span>
        </div>
      ))}
    </div>
  )
}

function CustomChoiceDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <details style={{ position: 'relative' }}>
      <summary
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          minWidth: 42,
          borderRadius: 6,
          border: '1px solid var(--border)',
          background: 'var(--grid-pill-bg)',
          color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
          padding: '5px 7px',
          fontSize: 10,
          fontWeight: 650,
          textAlign: 'center',
        }}
      >
        {value || label}
      </summary>
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 4,
          minWidth: 150,
          padding: 6,
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: '0 14px 28px rgba(0,0,0,0.25)',
        }}
      >
        {options.map((option) => (
          <button
            key={option || 'none'}
            type="button"
            onClick={() => onChange(option)}
            style={{
              height: 28,
              border: 0,
              borderRadius: 6,
              cursor: 'pointer',
              background: option === value ? 'var(--accent)' : 'var(--grid-pill-bg)',
              color: option === value ? '#fff' : 'var(--foreground)',
              fontSize: option ? 11 : 10,
              fontWeight: 650,
            }}
          >
            {option || '—'}
          </button>
        ))}
      </div>
    </details>
  )
}

function CustomColorDropdown({
  value,
  onChange,
  title,
  align = 'right',
}: {
  value: string
  onChange: (value: string) => void
  title?: string
  align?: 'left' | 'right'
}) {
  const selected = CUSTOM_COLOR_OPTIONS.find((option) => option.value === value) ?? { label: 'Цвет', value }
  const checkColor = readableColorForHex(selected.value)
  return (
    <details style={{ position: 'relative' }}>
      <summary
        title={title ? `${title}: ${selected.label}` : selected.label}
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          width: 32,
          height: 32,
          borderRadius: 7,
          border: '1px solid var(--border)',
          background: 'var(--grid-pill-bg)',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 21,
            height: 21,
            borderRadius: '50%',
            background: selected.value,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
          }}
        />
      </summary>
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: align === 'right' ? 0 : 'auto',
          left: align === 'left' ? 0 : 'auto',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 24px)',
          gap: 6,
          width: 324,
          maxWidth: 'calc(100vw - 32px)',
          padding: 9,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: '0 14px 28px rgba(0,0,0,0.25)',
        }}
      >
        {CUSTOM_COLOR_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            title={option.label}
            onClick={() => onChange(option.value)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.16)',
              background: option.value,
              boxShadow: option.value === value ? '0 0 0 2px var(--surface), 0 0 0 4px color-mix(in oklab, var(--accent) 70%, #fff)' : 'none',
              color: readableColorForHex(option.value),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            {option.value === value && <Check size={16} strokeWidth={3} color={checkColor} />}
          </button>
        ))}
      </div>
    </details>
  )
}

function VisualIconSettings({
  labels,
  tone,
  colors,
  onColorChange,
}: {
  labels: GridPreviewLabels
  tone: SiteTone
  colors: VisualCardColorConfig
  onColorChange: (key: VisualCardColorKey, slot: keyof VisualCardColorValue, value: string) => void
}) {
  const items: Array<{ key: VisualCardColorKey; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number; color?: string }> }> = [
    { key: 'work', label: labels.statusWork, Icon: Sun },
    { key: 'vacation', label: labels.statusVac, Icon: TreePalm },
    { key: 'sick', label: labels.statusSick, Icon: Thermometer },
    { key: 'dayoff', label: labels.statusOff, Icon: CalendarDays },
    { key: 'uncovered', label: labels.statusUncovered, Icon: AlertCircle },
  ]
  return (
    <div
      className="smengo-pop absolute right-0 z-30 mt-2 p-2.5 text-[13px] max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2"
      style={{ width: 390, maxWidth: 'calc(100vw - 28px)' }}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1 pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {labels.themeLabel}
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {tone === 'dark' ? labels.siteThemeDark : labels.siteThemeLight}
        </span>
      </div>
      <div className="mb-2 px-1 text-[12px] font-semibold text-foreground">
        {labels.iconColorsLabel}
      </div>
      <div style={{ display: 'grid', gap: 7 }}>
        {items.map(({ key, label, Icon }) => {
          const color = colors[key]
          return (
            <div
              key={key}
              style={{
                display: 'grid',
                gridTemplateColumns: '26px minmax(0, 1fr) auto auto',
                alignItems: 'center',
                gap: 8,
                padding: '7px 8px',
                borderRadius: 9,
                background: 'var(--grid-pill-bg)',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: 'color-mix(in oklab, var(--muted) 45%, transparent)',
                }}
              >
                <Icon size={15} strokeWidth={2.4} color={color.icon} />
              </span>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: color.text, fontWeight: 650 }}>
                {label}
              </span>
              <CustomColorDropdown
                value={color.icon}
                title={labels.iconColorLabel}
                onChange={(next) => onColorChange(key, 'icon', next)}
              />
              <CustomColorDropdown
                value={color.text}
                title={labels.textColorLabel}
                onChange={(next) => onColorChange(key, 'text', next)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CustomCellBodyEditor({
  body,
  labels,
  onChange,
}: {
  body: CustomCellBody
  labels: GridPreviewLabels
  onChange: (next: CustomCellBody) => void
}) {
  const normalized = normalizeCustomCellBody(body)
  const updateSector = (index: number, patch: Partial<CustomCellSector>) => {
    onChange({
      ...normalized,
      sectors: normalized.sectors.map((sector, i) => i === index ? { ...sector, ...patch } : sector),
    })
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          gap: 3,
          padding: 3,
          borderRadius: 11,
          background: 'var(--grid-pill-bg)',
          border: '1px solid var(--border)',
        }}
      >
        {[
          { label: labels.customPhraseLabel, count: 1 as const },
          { label: labels.customSectors2, count: 2 as const },
          { label: labels.customSectors3, count: 3 as const },
        ].map((item) => {
          const active = normalized.sectorCount === item.count
          return (
            <button
              key={item.count}
              type="button"
              onClick={() => onChange(resizeCustomCellBody(normalized, item.count))}
              style={{
                flex: 1,
                border: 0,
                borderRadius: 8,
                background: active ? 'var(--surface)' : 'transparent',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                padding: '7px 8px',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.16), inset 0 0 0 1px var(--border)' : 'none',
                transition: 'background 140ms ease, color 140ms ease, box-shadow 140ms ease',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'grid', gap: 7 }}>
        {normalized.sectors.map((sector, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(128px, 1fr) auto auto auto auto',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <input
              value={sector.text}
              onChange={(e) => updateSector(index, { text: e.currentTarget.value })}
              placeholder={normalized.sectorCount === 1 ? labels.customAnyPhrase : fillTemplate(labels.customPhraseN, index + 1)}
              className="smengo-custom-input"
              style={{
                minWidth: 0,
                height: 34,
                borderRadius: 9,
                border: '1px solid var(--border)',
                background: 'var(--grid-cell)',
                color: 'var(--foreground)',
                padding: '0 11px',
                fontSize: 12,
                fontWeight: 550,
                outline: 'none',
              }}
            />
            <CustomChoiceDropdown label={labels.customEmojiLabel} value={sector.emoji} options={CUSTOM_EMOJI_OPTIONS} onChange={(value) => updateSector(index, { emoji: value })} />
            <CustomChoiceDropdown label={labels.customLogoLabel} value={sector.logo} options={CUSTOM_LOGO_OPTIONS} onChange={(value) => updateSector(index, { logo: value })} />
            <CustomColorDropdown value={sector.color} title={labels.colorLabel} onChange={(value) => updateSector(index, { color: value })} />
            <CustomColorDropdown value={sector.textColor} title={labels.textColorLabel} onChange={(value) => updateSector(index, { textColor: value })} />
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomCellPreview({
  config,
  tone,
  label,
}: {
  config: CustomCellConfig
  tone: SiteTone
  label: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 7,
        alignContent: 'start',
        justifyItems: 'center',
        padding: '9px 8px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'color-mix(in oklab, var(--grid-pill-bg) 76%, transparent)',
      }}
    >
      <span
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 10,
          fontWeight: 750,
          lineHeight: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      <div style={{ width: 104, height: 58, display: 'grid', alignItems: 'center' }}>
        <CustomScheduleChip config={config} tone={tone} minHeight={52} />
      </div>
    </div>
  )
}

function CustomCellEditor({
  draft,
  setDraft,
  labels,
  siteTone,
  onSave,
  onFavorite,
}: {
  draft: CustomCellConfig
  setDraft: (next: CustomCellConfig) => void
  labels: GridPreviewLabels
  siteTone: SiteTone
  onSave: () => void
  onFavorite: () => void
}) {
  const normalized = normalizeCustomCellConfig(draft)
  const splitByTheme = normalized.themeMode === 'split'
  const activeBody = customCellBodyForTone(normalized, siteTone)
  const lightBody = customCellBodyForTone(normalized, 'light')
  const darkBody = customCellBodyForTone(normalized, 'dark')
  const lightConfig: CustomCellConfig = { ...lightBody, themeMode: 'single' }
  const darkConfig: CustomCellConfig = { ...darkBody, themeMode: 'single' }

  const setSingleBody = (body: CustomCellBody) => {
    setDraft({ ...normalizeCustomCellBody(body), themeMode: 'single' })
  }
  const setThemeBody = (tone: SiteTone, body: CustomCellBody) => {
    const nextThemes: Record<SiteTone, CustomCellBody> = {
      light: lightBody,
      dark: darkBody,
      [tone]: normalizeCustomCellBody(body),
    }
    setDraft({ ...nextThemes.light, themeMode: 'split', themes: nextThemes })
  }
  const toggleThemeMode = () => {
    if (splitByTheme) {
      setDraft({ ...activeBody, themeMode: 'single' })
      return
    }
    setDraft({ ...activeBody, themeMode: 'split', themes: { light: activeBody, dark: activeBody } })
  }

  return (
    <div
      style={{
        marginTop: 10,
        width: splitByTheme ? 760 : 620,
        maxWidth: 'calc(100vw - 32px)',
        borderTop: '1px solid var(--border)',
        paddingTop: 10,
        overflowX: 'auto',
      }}
    >
      <button
        type="button"
        onClick={toggleThemeMode}
        role="switch"
        aria-checked={splitByTheme}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          border: `1px solid ${splitByTheme ? 'color-mix(in oklab, var(--accent) 45%, var(--border))' : 'var(--border)'}`,
          borderRadius: 11,
          background: splitByTheme ? 'color-mix(in oklab, var(--accent) 9%, var(--grid-pill-bg))' : 'var(--grid-pill-bg)',
          color: 'var(--foreground)',
          padding: '8px 11px',
          cursor: 'pointer',
          fontSize: 11.5,
          fontWeight: 700,
          marginBottom: 10,
          transition: 'background 140ms ease, border-color 140ms ease',
        }}
      >
        <span>{labels.customByThemeLabel}</span>
        <span
          aria-hidden="true"
          style={{
            width: 30,
            height: 17,
            borderRadius: 999,
            flexShrink: 0,
            background: splitByTheme ? 'var(--accent)' : 'color-mix(in oklab, var(--muted-foreground) 35%, transparent)',
            position: 'relative',
            transition: 'background 160ms ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: splitByTheme ? 15 : 2,
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              transition: 'left 160ms cubic-bezier(.34,1.3,.5,1)',
            }}
          />
        </span>
      </button>

      {splitByTheme ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 136px', gap: 12, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gap: 7 }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {labels.siteThemeLight}
              </span>
              <CustomCellBodyEditor body={lightBody} labels={labels} onChange={(next) => setThemeBody('light', next)} />
            </div>
            <div style={{ display: 'grid', gap: 7 }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {labels.siteThemeDark}
              </span>
              <CustomCellBodyEditor body={darkBody} labels={labels} onChange={(next) => setThemeBody('dark', next)} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10, position: 'sticky', top: 0 }}>
            <CustomCellPreview config={lightConfig} tone="light" label={labels.siteThemeLight} />
            <CustomCellPreview config={darkConfig} tone="dark" label={labels.siteThemeDark} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 136px', gap: 12, alignItems: 'start' }}>
          <CustomCellBodyEditor body={activeBody} labels={labels} onChange={setSingleBody} />
          <CustomCellPreview config={normalized} tone={siteTone} label={siteTone === 'dark' ? labels.siteThemeDark : labels.siteThemeLight} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <button
          type="button"
          onClick={onSave}
          className="transition-transform hover:-translate-y-px"
          style={{
            border: '1px solid color-mix(in oklab, #fff 18%, var(--accent))',
            borderRadius: 10,
            background: 'linear-gradient(180deg, color-mix(in oklab, var(--accent) 88%, #fff 12%), var(--accent))',
            color: '#fff',
            padding: '10px 12px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 750,
            boxShadow: '0 6px 14px -6px color-mix(in oklab, var(--accent) 65%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          {labels.saveBtn}
        </button>
        <button
          type="button"
          onClick={onFavorite}
          className="transition-colors hover:bg-muted"
          style={{ border: '1px solid var(--border)', borderRadius: 10, background: 'transparent', color: 'var(--foreground)', padding: '10px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 650 }}
        >
          {labels.favoriteBtn}
        </button>
      </div>
    </div>
  )
}

// Day indices follow the May rendering: with May's weekday offset of 1, the
// pattern char at position p lands on screen at dayIdx p − 1, so the moves
// below target Ivan's visible midweek D gaps.
// AI plan is computed at run time against the month on screen (see
// buildAiPlan inside GridPreview), so the optimization story always matches
// what the visitor is looking at.
type AiPlanCell = { name: string; day: number; status: Status; kind: 'fill' | 'vacate' }
type AiPlan = { cells: AiPlanCell[] }
// Month-agnostic story beats: Kate's vacation and Olga's sick leave. The two
// uncovered slots live on the month-aware problem weekday instead (see
// problemDayIdxForMonth + UNCOVERED_EMPLOYEES) and are closed by the AI run.
const DEFAULT_SCHEDULE_OVERRIDES: Record<string, Status> = {
  'Kate Volkova-21': 'V',
  'Kate Volkova-22': 'V',
  'Kate Volkova-23': 'V',
  'Kate Volkova-24': 'V',
  'Kate Volkova-25': 'V',
  'Kate Volkova-26': 'V',
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
  Icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties; color?: string }>
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

export function shiftWindowParts(window: string): [string, string] {
  const parts = window
    .split('–')
    .map((part) => `${part.trim().padStart(2, '0')}:00`)
  return [parts[0] ?? '', parts[1] ?? '']
}

function ShiftTimeStack({
  start,
  end,
  fontSize = 8.5,
  dividerWidth = '70%',
}: {
  start: string
  end: string
  fontSize?: number
  dividerWidth?: number | string
}) {
  return (
    <span
      style={{
        minWidth: 0,
        maxWidth: '100%',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: 'inherit',
        fontSize,
        fontWeight: 750,
        lineHeight: 1,
        letterSpacing: 0,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span>{start}</span>
      <span
        aria-hidden="true"
        style={{
          width: dividerWidth,
          minWidth: 18,
          height: 1,
          background: 'currentColor',
          opacity: 0.42,
        }}
      />
      <span>{end}</span>
    </span>
  )
}

function statusIcon(code: Status): ComponentType<{ size?: number; style?: React.CSSProperties; color?: string }> | null {
  if (code === 'V') return TreePalm
  if (code === 'S') return Thermometer
  if (code === 'U') return AlertCircle
  return null
}

export function isDefaultMergedLeaveStatus(code: Status | undefined): code is 'V' | 'S' {
  return code === 'V' || code === 'S'
}

export function scheduleLeaveLabel(code: Status | undefined, labels: GridPreviewLabels): string | null {
  if (code === 'V') return labels.shifts.vacation
  if (code === 'S') return labels.footerLegendSick
  return null
}

export function scheduleLeaveShortLabel(code: Status | undefined, labels: GridPreviewLabels): string | null {
  const label = code === 'V' ? labels.statusVac : code === 'S' ? labels.statusSick : null
  if (!label) return null
  return label.endsWith('.') ? label : `${label}.`
}

export function ScheduleLeaveLabelText({
  code,
  labels,
}: {
  code: Status | undefined
  labels: GridPreviewLabels
}) {
  const full = scheduleLeaveLabel(code, labels)
  const short = scheduleLeaveShortLabel(code, labels)
  if (!full || !short) return null

  return (
    <span className="smengo-leave-label" aria-label={full}>
      <span className="smengo-leave-label-full">{full}</span>
      <span className="smengo-leave-label-short">{short}</span>
    </span>
  )
}

function shouldMergeScheduleRun(code: Status | undefined, mergeAll: boolean): boolean {
  return mergeAll || isDefaultMergedLeaveStatus(code)
}

function scheduleRunClickTarget(e: React.MouseEvent<HTMLElement>, indices: number[]) {
  const rect = e.currentTarget.getBoundingClientRect()
  const count = Math.max(indices.length, 1)
  const ratio = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0
  const offset = Math.max(0, Math.min(count - 1, Math.floor(ratio * count)))

  return {
    dayIdx: indices[offset] ?? indices[0] ?? 0,
    anchorX: rect.left + ((offset + 0.5) * rect.width) / count,
    anchorBottom: rect.bottom,
  }
}

// Stagger by day so cells light up as a left-to-right wave instead of one
// simultaneous repaint of the whole table.
function aiWaveDelayMs(dayIdx: number): number {
  return Math.min(dayIdx * 18, 380)
}
function aiCellAnimation(isOptimized: boolean, isShiftSource: boolean, isShiftTarget: boolean, dayIdx = 0): string {
  const delay = aiWaveDelayMs(dayIdx)
  if (isShiftTarget) return `smengo-ai-shift-fill 640ms ease-out ${delay}ms backwards`
  if (isShiftSource) return `smengo-ai-shift-vacate 640ms ease-out ${delay}ms backwards`
  if (isOptimized) return `smengo-ai-cell-pop 680ms cubic-bezier(.22,1,.36,1) ${delay}ms backwards`
  return 'none'
}
// data-ai value for the cell's chip-level settle animation (CSS keys on it).
function aiCellKind(isShiftSource: boolean, isShiftTarget: boolean): 'fill' | 'vacate' | undefined {
  if (isShiftTarget) return 'fill'
  if (isShiftSource) return 'vacate'
  return undefined
}

/* ── Cell badges (extended mode) ─────────────────────────────────── */
export type CellBadgeDef = { id: string; text: string; color: string }
const BUILTIN_BADGE_PRESETS: { id: string; labelKey: 'badgeRegister' | 'badgeHall' | 'badgeDelivery' | 'badgeVip' | 'badgeTraining'; color: string }[] = [
  { id: 'register', labelKey: 'badgeRegister', color: '#10b981' },
  { id: 'hall',     labelKey: 'badgeHall',     color: '#0ea5e9' },
  { id: 'delivery', labelKey: 'badgeDelivery', color: '#f59e0b' },
  { id: 'vip',      labelKey: 'badgeVip',      color: '#8b5cf6' },
  { id: 'training', labelKey: 'badgeTraining', color: '#ec4899' },
]
const CELL_BADGE_PRESETS_KEY = 'smengo:demo:cellBadgePresets'
const MAX_BADGES_PER_CELL = 2
// Month-agnostic seeds so the extended view demos badges out of the box.
const DEFAULT_CELL_BADGES: Record<string, string[]> = {
  'Anna Petrov-1': ['register'],
  'Anna Petrov-8': ['register'],
  'Kate Volkova-2': ['training'],
  'Olga Romanenko-3': ['hall'],
  'Roma Karpov-4': ['vip'],
  'Daria Kos-16': ['delivery'],
  'Yulia Lebed-15': ['training'],
}

function CellBadgePill({ badge, compact = false }: { badge: CellBadgeDef; compact?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: compact ? '1.5px 5px' : '2px 7px',
        borderRadius: 999,
        background: badge.color,
        color: readableColorForHex(badge.color),
        fontSize: compact ? 7.8 : 8.6,
        fontWeight: 750,
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        boxShadow: '0 1px 2px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.14)',
      }}
    >
      {badge.text}
    </span>
  )
}

/* ── Apple-style horizontal scrollbar ────────────────────────────── */
// Custom draggable overlay scrollbar (macOS look). Reads the live scroller
// from a ref each frame, so it survives re-renders and target swaps.
function AppleHScrollbar({
  scrollerRef,
  size = 'md',
  style,
}: {
  scrollerRef: { current: HTMLElement | null }
  size?: 'sm' | 'md'
  style?: React.CSSProperties
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const thumbRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startScroll: number } | null>(null)

  useEffect(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return
    let raf = 0
    const tick = () => {
      const el = scrollerRef.current
      if (el && el.isConnected) {
        const sw = el.scrollWidth
        const cw = el.clientWidth
        const need = sw > cw + 2
        if (track.dataset.active !== String(need)) track.dataset.active = String(need)
        if (need) {
          const tw = track.clientWidth
          const w = Math.max(40, Math.round((cw / sw) * tw))
          const max = sw - cw
          const x = max > 0 ? (el.scrollLeft / max) * (tw - w) : 0
          if (thumb.style.width !== `${w}px`) thumb.style.width = `${w}px`
          thumb.style.transform = `translate3d(${x}px, 0, 0)`
        }
      } else if (track.dataset.active !== 'false') {
        track.dataset.active = 'false'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scrollerRef])

  function scrollFromDrag(clientX: number) {
    const drag = dragRef.current
    const el = scrollerRef.current
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!drag || !el || !track || !thumb) return
    const span = track.clientWidth - thumb.clientWidth
    if (span <= 0) return
    const max = el.scrollWidth - el.clientWidth
    el.scrollLeft = drag.startScroll + (clientX - drag.startX) * (max / span)
  }

  return (
    <div
      ref={trackRef}
      className={`smengo-hscroll smengo-hscroll--${size}`}
      data-active="false"
      style={style}
      onPointerDown={(e) => {
        const el = scrollerRef.current
        const track = trackRef.current
        const thumb = thumbRef.current
        if (!el || !track || !thumb) return
        e.preventDefault()
        track.setPointerCapture(e.pointerId)
        track.setAttribute('data-dragging', 'true')
        if (e.target !== thumb) {
          // Jump so the thumb centers on the pointer, then drag from there.
          const rect = track.getBoundingClientRect()
          const span = track.clientWidth - thumb.clientWidth
          const max = el.scrollWidth - el.clientWidth
          if (span > 0) {
            const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left - thumb.clientWidth / 2) / span))
            el.scrollLeft = ratio * max
          }
        }
        dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startScroll: el.scrollLeft }
      }}
      onPointerMove={(e) => {
        if (dragRef.current && e.pointerId === dragRef.current.pointerId) scrollFromDrag(e.clientX)
      }}
      onPointerUp={(e) => {
        if (dragRef.current?.pointerId === e.pointerId) {
          dragRef.current = null
          trackRef.current?.removeAttribute('data-dragging')
        }
      }}
      onPointerCancel={() => {
        dragRef.current = null
        trackRef.current?.removeAttribute('data-dragging')
      }}
    >
      <div ref={thumbRef} className="smengo-hscroll-thumb" />
    </div>
  )
}

function normalizedScheduleStatus(
  statusOf: (name: string, dayIdx: number, base: string) => Status,
  emp: EmpDef,
  dayIdx: number,
): Status {
  return statusOf(emp.name, dayIdx, emp.s)
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
        className="smengo-pop"
        style={{
          position: 'fixed',
          left: menuPos.left,
          top: menuPos.top,
          zIndex: 5000,
          width: ON_SHIFT_MENU_WIDTH,
          padding: 5,
          textTransform: 'none',
          ['--pop-origin' as string]: 'bottom right',
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
  const [visualOpen, setVisualOpen] = useState(false)
  const visualRef = useRef<HTMLDivElement | null>(null)
  const [siteTone, setSiteTone] = useState<SiteTone>('light')
  const [visualIconColors, setVisualIconColors] = useState<VisualCardColorThemes>(() => DEFAULT_VISUAL_ICON_COLORS)
  const [visualIconColorsLoaded, setVisualIconColorsLoaded] = useState(false)
  const [showTelegram, setShowTelegram] = useState(false)
  const [showEmployeeRole, setShowEmployeeRole] = useState(true)
  const [showEmployeeDepartment, setShowEmployeeDepartment] = useState(true)
  const [showEmployeeDot, setShowEmployeeDot] = useState(true)
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null)
  const [monthIdx, setMonthIdx] = useState(() => currentDemoMonthIdx() ?? 2)
  const [deptFilter, setDeptFilter] = useState<DeptKey>('all')
  const [deptOpen, setDeptOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [projectModal, setProjectModal] = useState<ProjectKey | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editCell, setEditCell] = useState<{ name: string; day: number; px: number; py: number } | null>(null)
  const [overrides, setOverrides] = useState<Record<string, Status>>({})
  const [customCells, setCustomCells] = useState<Record<string, CustomCellConfig>>({})
  const [customFavorites, setCustomFavorites] = useState<CustomCellConfig[]>([])
  const [customFavoritesLoaded, setCustomFavoritesLoaded] = useState(false)
  const [customEditorOpen, setCustomEditorOpen] = useState(false)
  const [customDraft, setCustomDraft] = useState<CustomCellConfig>(() => makeDefaultCustomCell())
  const [aiOverrides, setAiOverrides] = useState<Record<string, Status>>({})
  const [aiState, setAiState] = useState<'idle' | 'running' | 'done'>('idle')
  const [aiRun, setAiRun] = useState(0)
  const [aiMonthIdx, setAiMonthIdx] = useState<number | null>(null)
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null)
  const [cellBadges, setCellBadges] = useState<Record<string, string[]>>({})
  const [customBadgePresets, setCustomBadgePresets] = useState<CellBadgeDef[]>([])
  const [customBadgePresetsLoaded, setCustomBadgePresetsLoaded] = useState(false)
  const [badgeFormOpen, setBadgeFormOpen] = useState(false)
  const [newBadgeText, setNewBadgeText] = useState('')
  const [newBadgeColor, setNewBadgeColor] = useState('#10b981')
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
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(CUSTOM_CELL_FAVORITES_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as CustomCellConfig[]
          if (Array.isArray(parsed)) setCustomFavorites(parsed.map(normalizeCustomCellConfig).slice(0, 12))
        }
      } catch { /* ignore */ }
      setCustomFavoritesLoaded(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => {
    if (!customFavoritesLoaded) return
    try {
      localStorage.setItem(CUSTOM_CELL_FAVORITES_KEY, JSON.stringify(customFavorites.map(normalizeCustomCellConfig)))
    } catch { /* ignore */ }
  }, [customFavorites, customFavoritesLoaded])
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(CELL_BADGE_PRESETS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as CellBadgeDef[]
          if (Array.isArray(parsed)) {
            setCustomBadgePresets(parsed.filter((p) => p && typeof p.id === 'string' && typeof p.text === 'string' && typeof p.color === 'string').slice(0, 12))
          }
        }
      } catch { /* ignore */ }
      setCustomBadgePresetsLoaded(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => {
    if (!customBadgePresetsLoaded) return
    try {
      localStorage.setItem(CELL_BADGE_PRESETS_KEY, JSON.stringify(customBadgePresets))
    } catch { /* ignore */ }
  }, [customBadgePresets, customBadgePresetsLoaded])
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setSiteTone(detectSiteTone())
      try {
        const raw = localStorage.getItem(VISUAL_ICON_COLORS_KEY)
        setVisualIconColors(raw ? normalizeVisualIconColors(JSON.parse(raw)) : DEFAULT_VISUAL_ICON_COLORS)
      } catch {
        setVisualIconColors(DEFAULT_VISUAL_ICON_COLORS)
      }
      setVisualIconColorsLoaded(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const updateTone = () => setSiteTone(detectSiteTone())
    const observer = new MutationObserver(updateTone)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!visualIconColorsLoaded) return
    try {
      localStorage.setItem(VISUAL_ICON_COLORS_KEY, JSON.stringify(visualIconColors))
    } catch { /* ignore */ }
  }, [visualIconColors, visualIconColorsLoaded])
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
    try { localStorage.removeItem(VISUAL_ICON_COLORS_KEY) } catch { /* ignore */ }
    setCustomSections([])
    setEmpRoleOverrides({})
    setEmpSpecialtyOverrides({})
    setDepartmentRoleOverrides({})
    setDepartmentColorOverrides({})
    setSpecialtyColorOverrides({})
    setEmpOrder([])
    setCustomCells({})
    setCustomEditorOpen(false)
    setCustomDraft(makeDefaultCustomCell())
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
    // Reset returns to the same month the demo opened with (load === reset)
    setMonthIdx(currentDemoMonthIdx() ?? 2)
    setDeptFilter('all')
    setEditMode(false)
    setVisualOpen(false)
    setVisualIconColors(DEFAULT_VISUAL_ICON_COLORS)
    setOverrides({})
    setAiOverrides({})
    setAiState('idle')
    setAiRun(0)
    setAiMonthIdx(null)
    setAiPlan(null)
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
  const [popShift, setPopShift] = useState({ x: 0, y: 0 })

  function openEditCell(name: string, day: number, px: number, py: number) {
    const existing = customCells[`${name}-${day}-${monthIdx}`]
    const scrollX = typeof window === 'undefined' ? 0 : window.scrollX
    const scrollY = typeof window === 'undefined' ? 0 : window.scrollY
    setCustomDraft(normalizeCustomCellConfig(existing ?? makeDefaultCustomCell()))
    setCustomEditorOpen(false)
    setBadgeFormOpen(false)
    setPopShift({ x: 0, y: 0 })
    setEditCell({ name, day, px: px + scrollX, py: py + scrollY })
  }

  // Keep the edit popover inside the viewport: cells near the grid edges
  // would otherwise push it off-screen. Converges in one pass (guarded).
  useLayoutEffect(() => {
    const el = editCellRef.current
    if (!el || !editCell) return
    const pad = 10
    const r = el.getBoundingClientRect()
    let dx = 0
    let dy = 0
    if (r.right > window.innerWidth - pad) dx = window.innerWidth - pad - r.right
    if (r.left + dx < pad) dx = pad - r.left
    if (r.bottom > window.innerHeight - pad) dy = window.innerHeight - pad - r.bottom
    if (r.top + dy < pad) dy = pad - r.top
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      setPopShift((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    }
  }, [editCell, customEditorOpen, badgeFormOpen, popShift])

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
    if (!visualOpen) return
    function onDown(e: MouseEvent) {
      if (visualRef.current && !visualRef.current.contains(e.target as Node)) {
        setVisualOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [visualOpen])

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
        setCustomEditorOpen(false)
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
  const activeVisualIconColors = visualIconColors[siteTone]
  function setVisualCardColor(key: VisualCardColorKey, slot: keyof VisualCardColorValue, color: string) {
    setVisualIconColors((prev) => ({
      ...prev,
      [siteTone]: {
        ...prev[siteTone],
        [key]: {
          ...prev[siteTone][key],
          [slot]: color,
        },
      },
    }))
  }

  const weekendBg = strongWeekend ? 'var(--accent-soft)' : 'var(--grid-weekend)'
  const monthLabel = labels.months[monthIdx]
  const monthOffset = scheduleOffsetForMonth(monthIdx)
  const days = monthDays(monthIdx)
  const todayDayIdx = todayDayIndexForMonth(monthIdx)
  const lastMonthIdx = labels.months.length - 1

  const allEmps = [...BASE_EMPLOYEES, ...demoEmps]
  const aiOptimized = aiState === 'done' && aiMonthIdx === monthIdx
  const coverageSummary = aiOptimized ? labels.aiOptimizedSummary : labels.coverageSummary
  const problemDayIdx = problemDayIdxForMonth(monthIdx)
  const optimizedCellKeys: Record<string, true> = {}
  const shiftedFromCellKeys: Record<string, true> = {}
  const shiftedToCellKeys: Record<string, true> = {}
  for (const cell of aiPlan?.cells ?? []) {
    const key = `${cell.name}-${cell.day}`
    optimizedCellKeys[key] = true
    if (cell.kind === 'vacate') shiftedFromCellKeys[key] = true
    else shiftedToCellKeys[key] = true
  }

  function statusOf(name: string, dayIdx: number, base: string): Status {
    const key = `${name}-${dayIdx}-${monthIdx}`
    if (overrides[key]) return overrides[key]
    if (aiOverrides[key]) return aiOverrides[key]
    if (dayIdx === problemDayIdx && UNCOVERED_EMPLOYEES.includes(name)) return 'U'
    const defaultOverride = DEFAULT_SCHEDULE_OVERRIDES[`${name}-${dayIdx}`]
    if (defaultOverride) return defaultOverride
    if (base.length === 4) return rotationStatus(base, monthIdx, dayIdx)
    const rotated = rotateSchedule(base, monthOffset)
    return (rotated[dayIdx % 14] ?? 'W') as Status
  }

  // The red column highlight lives while either uncovered slot is still open.
  const problemColumnActive = UNCOVERED_EMPLOYEES.some((name) => {
    const emp = allEmps.find((e) => e.name === name)
    return emp ? statusOf(name, problemDayIdx, emp.s) === 'U' : false
  })

  function badgePresetById(id: string): CellBadgeDef | null {
    const builtin = BUILTIN_BADGE_PRESETS.find((p) => p.id === id)
    if (builtin) return { id, text: labels[builtin.labelKey], color: builtin.color }
    return customBadgePresets.find((p) => p.id === id) ?? null
  }
  function cellBadgeIdsOf(name: string, dayIdx: number): string[] {
    return cellBadges[`${name}-${dayIdx}-${monthIdx}`] ?? DEFAULT_CELL_BADGES[`${name}-${dayIdx}`] ?? []
  }
  function cellBadgesOf(name: string, dayIdx: number): CellBadgeDef[] {
    return cellBadgeIdsOf(name, dayIdx)
      .map(badgePresetById)
      .filter((b): b is CellBadgeDef => b !== null)
      .slice(0, MAX_BADGES_PER_CELL)
  }
  function toggleCellBadge(name: string, dayIdx: number, id: string) {
    const key = `${name}-${dayIdx}-${monthIdx}`
    setCellBadges((prev) => {
      const current = prev[key] ?? DEFAULT_CELL_BADGES[`${name}-${dayIdx}`] ?? []
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id].slice(-MAX_BADGES_PER_CELL)
      return { ...prev, [key]: next }
    })
  }
  function createBadgePreset() {
    const text = newBadgeText.trim()
    if (!text || !editCell) return
    const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
    const preset: CellBadgeDef = { id: `cb:${rand}`, text, color: newBadgeColor }
    setCustomBadgePresets((prev) => [...prev, preset].slice(-12))
    toggleCellBadge(editCell.name, editCell.day, preset.id)
    setNewBadgeText('')
    setBadgeFormOpen(false)
  }

  function setStatusOf(name: string, dayIdx: number, s: Status) {
    const key = `${name}-${dayIdx}-${monthIdx}`
    setCustomCells((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setOverrides((prev) => ({ ...prev, [key]: s }))
  }

  function customCellOf(name: string, dayIdx: number): CustomCellConfig | null {
    return customCells[`${name}-${dayIdx}-${monthIdx}`] ?? null
  }

  function applyCustomCell(config: CustomCellConfig) {
    if (!editCell) return
    const key = `${editCell.name}-${editCell.day}-${monthIdx}`
    const normalized = normalizeCustomCellConfig(config)
    setCustomCells((prev) => ({ ...prev, [key]: normalized }))
    setOverrides((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setEditCell(null)
    setCustomEditorOpen(false)
  }

  function saveCustomDraft() {
    applyCustomCell(customDraft)
  }

  function addCustomDraftToFavorites() {
    const normalized = normalizeCustomCellConfig(customDraft)
    const signature = JSON.stringify(normalized)
    setCustomFavorites((prev) => {
      const withoutDuplicate = prev.filter((item) => JSON.stringify(normalizeCustomCellConfig(item)) !== signature)
      return [normalized, ...withoutDuplicate].slice(0, 12)
    })
    applyCustomCell(normalized)
  }

  // The plan is built against the month on screen: assign the two uncovered
  // slots on the problem weekday, then even out the night line — give the
  // thinnest nights (one person on shift) a second pair of hands, and return
  // those hours on later double-covered nights so nobody's totals drift and
  // no new gap ever opens.
  function buildAiPlan(): AiPlan {
    const baseOf = (name: string) => allEmps.find((e) => e.name === name)?.s ?? 'WWDDWWWWWDDWWW'
    const cells: AiPlanCell[] = UNCOVERED_EMPLOYEES.map((name) => ({
      name, day: problemDayIdx, status: 'W' as Status, kind: 'fill' as const,
    }))

    const nightCrew = allEmps.filter((e) => e.shift === 'night')
    const nightCoverage = (i: number) =>
      nightCrew.reduce((n, e) => n + (statusOf(e.name, i, e.s) === 'W' ? 1 : 0), 0)

    // Reinforce the first two thin nights after the opening week.
    const fills: { name: string; day: number }[] = []
    for (let i = 4; i < days.length - 1 && fills.length < 2; i++) {
      if (nightCoverage(i) !== 1) continue
      const candidate = nightCrew.find((e) =>
        statusOf(e.name, i, e.s) === 'D' && !fills.some((f) => f.name === e.name))
      if (!candidate) continue
      fills.push({ name: candidate.name, day: i })
      cells.push({ name: candidate.name, day: i, status: 'W', kind: 'fill' })
    }

    // Pay each extra night back on a later double-covered night, one vacate
    // per day, so coverage never drops below one.
    const vacatedDays = new Set<number>()
    for (const fill of fills) {
      for (let i = Math.max(18, fill.day + 6); i < days.length; i++) {
        if (vacatedDays.has(i) || nightCoverage(i) < 2) continue
        if (statusOf(fill.name, i, baseOf(fill.name)) !== 'W') continue
        cells.push({ name: fill.name, day: i, status: 'D', kind: 'vacate' })
        vacatedDays.add(i)
        break
      }
    }
    return { cells }
  }

  function runAiOptimization() {
    if (aiState !== 'idle') return
    if (aiApplyTimer.current) window.clearTimeout(aiApplyTimer.current)
    if (aiDoneTimer.current) window.clearTimeout(aiDoneTimer.current)
    const plan = buildAiPlan()
    setSelectedEmp(null)
    setEditCell(null)
    setEditMode(false)
    setAiPlan(plan)
    setAiState('running')
    setAiMonthIdx(monthIdx)
    setAiRun((n) => n + 1)

    aiApplyTimer.current = window.setTimeout(() => {
      setAiOverrides((prev) => {
        const next = { ...prev }
        for (const cell of plan.cells) {
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
  if (todayDayIdx !== null) {
    for (const emp of allEmps) {
      const s = statusOf(emp.name, todayDayIdx, emp.s)
      if (s === 'W') todayOnShift++
      else if (s === 'V' || s === 'S' || s === 'D') todayOff++
    }
  }
  const rolePickerEmp = rolePickerFor ? allEmps.find((e) => e.name === rolePickerFor) ?? null : null

  return (
    <div style={{ position: 'relative' }}>
      {/* Top controls: mode toggle + settings */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <ModeSegmented
          mode={mode}
          onChange={setMode}
          labels={{ compact: labels.modeCompact, detail: labels.modeDetail, extended: labels.modeExtended }}
        />

        <div className="flex items-center gap-2">

        <div ref={settingsRef} className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label={labels.displayLabel}
            className="smengo-tool smengo-tool--icon"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          {settingsOpen && (
            <div className="smengo-pop absolute right-0 z-30 mt-2 w-72 p-1.5 text-[13px] max-sm:right-auto max-sm:left-1/2 max-sm:-translate-x-1/2">
              <div className="smengo-pop-label">{labels.displayLabel}</div>
              <SettingRow label={labels.highContrastLabel} value={contrast} onChange={setContrast} />
              <SettingRow label={labels.highlightWeekendsLabel} value={strongWeekend} onChange={setStrongWeekend} />
              <SettingRow label={labels.showTimesLabel} value={showTimes} onChange={setShowTimes} />
              <SettingRow label={labels.mergedLabel} value={merged} onChange={setMerged} />
              <SettingRow label={labels.gridLabel} value={showGrid} onChange={setShowGrid} />
              <SettingRow label={labels.stickyLabel} value={sticky} onChange={setSticky} />
              <SettingRow label={labels.timerLabel} value={showTimer} onChange={setShowTimer} />
              <SettingRow label={labels.todayLabel} value={showToday} onChange={setShowToday} />
              <div className="smengo-pop-sep" />
              {sticky && (
                <SettingRow label={labels.showEmployeeDepartmentLabel} value={showEmployeeDepartment} onChange={setShowEmployeeDepartment} disabled={mode === 'compact'} />
              )}
              <SettingRow label={labels.showEmployeeRoleLabel} value={showEmployeeRole} onChange={setShowEmployeeRole} disabled={mode === 'compact'} />
              <SettingRow label={labels.showEmployeeDotLabel} value={showEmployeeDot} onChange={setShowEmployeeDot} />
            </div>
          )}
        </div>

        <div ref={visualRef} className="relative">
          <button
            type="button"
            onClick={() => setVisualOpen((v) => !v)}
            aria-label={labels.themeLabel}
            className="smengo-tool smengo-tool--icon"
          >
            <Palette className="h-4 w-4" />
          </button>
          {visualOpen && (
            <VisualIconSettings
              labels={labels}
              tone={siteTone}
              colors={activeVisualIconColors}
              onColorChange={setVisualCardColor}
            />
          )}
        </div>

          <button
            type="button"
            onClick={handleReset}
            title={labels.resetBtn}
            className="smengo-tool smengo-tool--icon"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="smengo-ai-grid-stage" data-ai-state={aiState} style={{ position: 'relative' }}>
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
                  className="smengo-pop absolute right-0 z-30 mt-2"
                  style={{ top: '100%', width: 268, padding: 6, fontSize: 12 }}
                >
                  <div className="smengo-pop-label">{labels.shortageLabel}</div>
                  <div style={{
                    display: 'flex', gap: 8, padding: '9px 10px',
                    borderRadius: 9, background: 'var(--accent-soft)',
                    color: 'var(--foreground)', lineHeight: 1.4,
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
                  className="smengo-pop absolute right-0 z-30 mt-2"
                  style={{ top: '100%', width: 212, padding: 6, fontSize: 12 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px 8px' }}>
                    <Avatar name="Olga Romanenko" size={30} />
                    <div style={{ lineHeight: 1.3, minWidth: 0 }}>
                      <div style={{ fontWeight: 650, color: 'var(--foreground)', fontSize: 12.5 }}>{labels.employeeNames.olgaRomanenko}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>olga@smengo.app</div>
                    </div>
                  </div>
                  <div className="smengo-pop-sep" />
                  {[labels.editBtn, labels.exportBtn].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setUserOpen(false)}
                      className="smengo-pop-item"
                      style={{ fontSize: 12.5 }}
                    >
                      {item}
                    </button>
                  ))}
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
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            background: 'var(--grid-cell)', flexWrap: 'wrap',
          }}
        >
          {/* Month switcher */}
          {activeTab === 'schedule' && (
            <div className="smengo-tool" style={{ padding: '0 4px', gap: 2, cursor: 'default' }}>
              <button
                type="button"
                onClick={() => setMonthIdx((m) => Math.max(0, m - 1))}
                disabled={monthIdx === 0}
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label={labels.ariaPrevMonth}
                style={{ background: 'transparent', border: 0, color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1 }}
              >
                ‹
              </button>
              <span style={{ minWidth: 86, textAlign: 'center', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{monthLabel}</span>
              <button
                type="button"
                onClick={() => setMonthIdx((m) => Math.min(lastMonthIdx, m + 1))}
                disabled={monthIdx === lastMonthIdx}
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label={labels.ariaNextMonth}
                style={{ background: 'transparent', border: 0, color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1 }}
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
              className="smengo-tool"
            >
              {deptFilter === 'all' ? labels.allDepts : deptLabel(deptFilter)}
              <ChevronDown style={{ width: 11, height: 11 }} />
            </button>
            {deptOpen && (
              <div
                className="smengo-pop absolute left-0 z-30 mt-1.5 w-48 p-1.5"
                style={{ ['--pop-origin' as string]: 'top left' }}
              >
                {deptOptions.map((d) => {
                  const active = deptFilter === d.k
                  return (
                    <button
                      key={d.k}
                      type="button"
                      onClick={() => onDeptPick(d.k)}
                      className="smengo-pop-item justify-between"
                      style={{ fontSize: 12.5 }}
                    >
                      <span className="min-w-0 truncate" style={{ fontWeight: active ? 650 : 500 }}>{d.label}</span>
                      {active && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />}
                    </button>
                  )
                })}
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
                className="smengo-tool max-sm:hidden"
              >
                {labels.addSectionBtn}
              </button>

              {/* Edit toggle */}
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="smengo-tool"
                data-active={editMode}
              >
                <Pencil style={{ width: 11, height: 11 }} />
                {editMode ? labels.editDone : labels.editBtn}
              </button>

              {/* Export */}
              <button
                type="button"
                onClick={() => showToast(labels.toastExported)}
                className="smengo-tool"
              >
                {labels.exportBtn}
              </button>

              {/* Add employee */}
              <button
                type="button"
                onClick={onAddEmployee}
                disabled={demoEmps.length >= 4}
                className="smengo-tool smengo-tool--primary"
                style={{
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
            todayDayIdx={todayDayIdx}
            customCellOf={customCellOf}
            statusOf={statusOf}
            weekendBg={weekendBg}
            chipBg={chipBg}
            visualColors={activeVisualIconColors}
            siteTone={siteTone}
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
            onCellEdit={openEditCell}
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
            problemDayIdx={problemColumnActive ? problemDayIdx : null}
          />
        ) : (
          <DetailGrid
            mode={mode}
            groups={groups}
            days={days}
            todayDayIdx={todayDayIdx}
            customCellOf={customCellOf}
            statusOf={statusOf}
            visualColors={activeVisualIconColors}
            siteTone={siteTone}
            labels={labels}
            chipLbl={CHIP_LBL}
            chipLblFull={CHIP_LBL_FULL}
            chipBg={chipBg}
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
            onCellEdit={openEditCell}
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
            problemDayIdx={problemColumnActive ? problemDayIdx : null}
            cellBadgesOf={cellBadgesOf}
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

        {/* Cell-edit popover — portaled above overflow-hidden tables, anchored to page coords */}
        {activeTab === 'schedule' && editCell && typeof document !== 'undefined' && createPortal(
          <div
            ref={editCellRef}
            className="absolute z-[9999]"
            style={{ top: editCell.py + popShift.y, left: editCell.px + popShift.x, transform: 'translateX(-50%)' }}
          >
            <div className="smengo-pop p-2.5" style={{ ['--pop-origin' as string]: 'top center', borderRadius: 14 }}>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <span className="max-w-[180px] truncate text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>
                {displayNameForKey(editCell.name)}
              </span>
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                style={{ background: 'var(--grid-pill-bg)', color: 'var(--muted-foreground)' }}
              >
                {String(editCell.day + 1).padStart(2, '0')}.{String(DEMO_FIRST_MONTH + monthIdx + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusOf(editCell.name, editCell.day, s)
                    setEditCell(null)
                  }}
                  className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:scale-105"
                  style={{
                    width: 44, height: 34, border: 0, borderRadius: 10,
                    background: s === '-' ? 'var(--muted)' : chipBg(s as Exclude<Status, '-'>),
                    color: s === '-' ? 'var(--muted-foreground)' : chipFg(s as Exclude<Status, '-'>),
                    fontSize: 10.5, fontWeight: 700,
                    boxShadow: s === '-' ? 'none' : '0 1px 2px rgba(0,0,0,0.12)',
                  }}
                >
                  {s === '-' ? '—' : CHIP_LBL[s as Exclude<Status, '-'>]}
                </button>
              ))}
              {customFavorites.map((favorite, index) => (
                <button
                  key={`${customCellSummary(favorite)}-${index}`}
                  type="button"
                  onClick={() => applyCustomCell(favorite)}
                  className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:scale-105"
                  style={{
                    minWidth: 58,
                    maxWidth: 92,
                    height: 34,
                    border: 0,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 28%, #1f2530), color-mix(in oklab, var(--grid-cell) 75%, var(--accent)))',
                    color: '#fff',
                    padding: '0 7px',
                    fontSize: 9.5,
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {customCellSummary(favorite)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCustomEditorOpen((value) => !value)}
                className="cursor-pointer transition-transform hover:-translate-y-0.5 hover:scale-105"
                style={{
                  minWidth: 70,
                  height: 34,
                  border: '1px solid color-mix(in oklab, var(--accent) 45%, transparent)',
                  borderRadius: 10,
                  background: customEditorOpen ? 'var(--accent)' : 'var(--grid-pill-bg)',
                  color: customEditorOpen ? '#fff' : 'var(--foreground)',
                  padding: '0 10px',
                  fontSize: 10,
                  fontWeight: 750,
                }}
              >
                {labels.customBadge}
              </button>
            </div>
            {mode === 'extended' && !customEditorOpen && (() => {
              const appliedIds = cellBadgeIdsOf(editCell.name, editCell.day)
              const presets: CellBadgeDef[] = [
                ...BUILTIN_BADGE_PRESETS.map((p) => ({ id: p.id, text: labels[p.labelKey], color: p.color })),
                ...customBadgePresets,
              ]
              return (
                <div className="mt-2.5" style={{ borderTop: '1px solid var(--pop-border)', paddingTop: 8 }}>
                  <div className="mb-1.5 px-1 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    {labels.badgesLabel}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5" style={{ maxWidth: 300 }}>
                    {presets.map((p) => {
                      const active = appliedIds.includes(p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleCellBadge(editCell.name, editCell.day, p.id)}
                          className="cursor-pointer transition-transform hover:-translate-y-0.5"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            height: 26,
                            padding: '0 10px',
                            borderRadius: 999,
                            border: active ? `1px solid ${p.color}` : '1px solid var(--pop-border)',
                            background: active ? p.color : 'transparent',
                            color: active ? readableColorForHex(p.color) : 'var(--foreground)',
                            fontSize: 10.5,
                            fontWeight: 700,
                            boxShadow: active ? `0 3px 8px -3px color-mix(in oklab, ${p.color} 60%, transparent)` : 'none',
                          }}
                        >
                          {!active && (
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                          )}
                          {p.text}
                          {active && <Check size={11} strokeWidth={3} />}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setBadgeFormOpen((v) => !v)}
                      className="cursor-pointer transition-colors hover:bg-muted"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        height: 26,
                        padding: '0 10px',
                        borderRadius: 999,
                        border: '1px dashed color-mix(in oklab, var(--muted-foreground) 45%, transparent)',
                        background: 'transparent',
                        color: 'var(--muted-foreground)',
                        fontSize: 10.5,
                        fontWeight: 650,
                      }}
                    >
                      + {labels.badgeAddLabel}
                    </button>
                  </div>
                  {badgeFormOpen && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <input
                        value={newBadgeText}
                        autoFocus
                        onChange={(e) => setNewBadgeText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') createBadgePreset() }}
                        placeholder={labels.badgePlaceholder}
                        className="smengo-custom-input"
                        style={{
                          minWidth: 0,
                          flex: 1,
                          height: 28,
                          borderRadius: 9,
                          border: '1px solid var(--pop-border)',
                          background: 'var(--grid-cell)',
                          color: 'var(--foreground)',
                          padding: '0 9px',
                          fontSize: 11,
                          fontWeight: 600,
                          outline: 'none',
                        }}
                      />
                      <div className="flex shrink-0 items-center gap-1">
                        {SOLID_COLORS.slice(0, 6).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            aria-label={c.id}
                            onClick={() => setNewBadgeColor(c.value)}
                            className="cursor-pointer"
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              border: 0,
                              padding: 0,
                              background: c.value,
                              boxShadow: newBadgeColor === c.value
                                ? '0 0 0 2px var(--surface), 0 0 0 3.5px ' + c.value
                                : 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                            }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={createBadgePreset}
                        disabled={!newBadgeText.trim()}
                        className="cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                        style={{
                          height: 28,
                          flexShrink: 0,
                          border: 0,
                          borderRadius: 9,
                          padding: '0 10px',
                          background: 'var(--accent)',
                          color: '#fff',
                          fontSize: 10.5,
                          fontWeight: 750,
                        }}
                      >
                        {labels.createBtn}
                      </button>
                    </div>
                  )}
                </div>
              )
            })()}
            {customEditorOpen && (
              <CustomCellEditor
                draft={customDraft}
                setDraft={setCustomDraft}
                labels={labels}
                siteTone={siteTone}
                onSave={saveCustomDraft}
                onFavorite={addCustomDraftToFavorites}
              />
            )}
            </div>
          </div>,
          document.body,
        )}

        {/* Project modal */}
        {activeTab === 'schedule' && projectModal && (
          <div
            className="smengo-overlay-scrim absolute inset-0 z-40 flex items-center justify-center"
            onClick={() => setProjectModal(null)}
          >
            <div
              className="smengo-modal-panel p-5"
              style={{ width: 332, maxWidth: '90%' }}
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
  const avatarSize = compact ? 36 : extended ? 46 : 42
  const cardPad = compact ? 14 : extended ? 20 : 16
  const statGap = compact ? 12 : extended ? 20 : 16
  const nameSize = compact ? 14 : extended ? 16 : 15
  const roleIconColor = solidAccent(row.specialtyColor)
  const isTrainee = row.profile.kind === 'trainee'

  return (
    <article
      style={{
        minWidth: 0,
        border: classic ? '1px solid var(--classic-grid-line, var(--border))' : '1px solid var(--pop-border)',
        borderRadius: classic ? 8 : 14,
        background: 'var(--surface)',
        boxShadow: classic ? '0 1px 0 rgba(0,0,0,0.04)' : 'var(--tool-shadow)',
        overflow: 'hidden',
        transition: 'box-shadow 160ms ease, transform 160ms ease',
      }}
    >
      <div
        style={{
          padding: cardPad,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: compact ? 10 : 14,
          alignItems: 'start',
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: compact ? 10 : 12 }}>
          <EmployeeAvatarWithPresence name={row.emp.name} size={avatarSize} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <span
                style={{
                  color: 'var(--foreground)',
                  fontSize: nameSize,
                  lineHeight: 1.2,
                  fontWeight: 650,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: classic ? 'ui-serif, Georgia, "Times New Roman", serif' : undefined,
                }}
              >
                {row.displayName}
              </span>
              {isTrainee && (
                <span
                  style={{
                    flexShrink: 0,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: 'color-mix(in oklab, #8b5cf6 12%, transparent)',
                    color: '#8b5cf6',
                    fontSize: 10,
                    fontWeight: 650,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.kindLabel}
                </span>
              )}
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
                marginTop: 4,
                maxWidth: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--muted-foreground)',
                fontFamily: 'inherit',
                fontSize: compact ? 11.5 : 12,
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.emp.tg} · {row.ageText}
              </span>
              <Copy size={11} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.6 }} />
            </button>
          </div>
        </div>

        <EmployeeStatusBadge label={labels.employeeActive} accent="var(--success)" mode={mode} />
      </div>

      <div
        style={{
          paddingTop: 2,
          paddingRight: cardPad,
          paddingBottom: cardPad,
          paddingLeft: cardPad,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: statGap,
          rowGap: compact ? 12 : 14,
        }}
      >
        <EmployeeProfileStat label={row.roleLabel} value={row.specialtyLabel} Icon={Briefcase} iconColor={roleIconColor} mode={mode} />
        <EmployeeProfileStat label={labels.employeeProject} value={row.projectName} Icon={Globe2} iconColor="#8b5cf6" mode={mode} />
        <EmployeeProfileStat label={labels.employeeCompanyDays} value={row.companyDays} Icon={Clock3} iconColor="var(--muted-foreground)" mode={mode} />
        <EmployeeProfileStat label={labels.employeeBirthday} value={row.birthdayDate} detail={row.birthdaySoon} Icon={CalendarDays} iconColor="var(--muted-foreground)" mode={mode} />
      </div>

      <div
        style={{
          padding: compact ? '8px 12px' : extended ? '10px 16px' : '9px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 4 : 6,
          borderTop: '1px solid var(--pop-border)',
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
  label, accent, mode = 'compact',
}: {
  label: string
  accent: string
  mode?: Mode
}) {
  const compact = mode === 'compact'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: compact ? '3px 9px' : '4px 10px',
        borderRadius: 999,
        background: `color-mix(in oklab, ${accent} 11%, transparent)`,
        color: accent,
        fontSize: compact ? 11 : 11.5,
        fontWeight: 600,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }}
      />
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
          color: 'color-mix(in oklab, var(--muted-foreground) 80%, transparent)',
          fontSize: compact ? 10 : extended ? 11 : 10.5,
          fontWeight: 600,
          letterSpacing: '0.05em',
          lineHeight: 1.2,
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
          marginTop: compact ? 5 : 7,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          minWidth: 0,
          color: 'var(--foreground)',
          fontSize: compact ? 12.5 : extended ? 14 : 13,
          fontWeight: 600,
          lineHeight: 1.25,
        }}
      >
        <Icon size={compact ? 13 : 14} strokeWidth={2} style={{ color: iconColor, flexShrink: 0, opacity: 0.85 }} />
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      </div>
      {detail && (
        <div
          style={{
            marginTop: 3,
            paddingLeft: compact ? 20 : 21,
            color: 'var(--muted-foreground)',
            fontSize: compact ? 10.5 : 11,
            fontWeight: 500,
            lineHeight: 1.3,
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
      className="cursor-pointer transition-colors hover:bg-muted hover:text-foreground"
      style={{
        width: compact ? 26 : 30,
        height: compact ? 26 : 30,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        borderRadius: 8,
        background: 'transparent',
        color: danger ? 'color-mix(in oklab, var(--st-alert, #fb7185) 80%, var(--muted-foreground))' : 'var(--muted-foreground)',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <Icon size={compact ? 15 : 16} strokeWidth={2} />
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
  if (showTelegram) return 280

  // Long role labels scroll horizontally inside the column instead of
  // truncating, so the column can stay tight around the names.
  const meta = employeeMetaParts(sticky, showEmployeeDepartment, showEmployeeRole)
  if (meta.count === 0) return showEmployeeDot ? 212 : 198
  if (meta.count === 1) return meta.role ? 248 : 236
  return showEmployeeDot ? 254 : 246
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
              flexShrink: 0,
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
            flexShrink: 0,
            whiteSpace: 'nowrap',
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
  // compactSchedule renders as a small badge pill: dot + department › role.
  const style: React.CSSProperties = isCompactSchedule ? {
    width,
    maxWidth: maxWidth ?? (shouldClamp ? '100%' : 'none'),
    minWidth: shouldClamp ? 0 : 'max-content',
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    flexShrink: shrink ? 1 : 0,
    overflow: shouldClamp ? 'hidden' : 'visible',
    border: '1px solid color-mix(in oklab, var(--border) 82%, transparent)',
    borderRadius: 999,
    background: 'color-mix(in oklab, var(--grid-pill-bg) 88%, var(--surface) 12%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    padding: hasText ? '2.5px 8px 2.5px 6px' : 3,
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
          ...(isCompactSchedule ? {} : { padding: 0 }),
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
    const code = statusOf(empName, i, emp.s)
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
        background: mounted ? 'var(--overlay-scrim)' : 'transparent',
        backdropFilter: mounted ? 'blur(8px)' : 'blur(0)',
        WebkitBackdropFilter: mounted ? 'blur(8px)' : 'blur(0)',
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
          border: '1px solid var(--pop-border)',
          borderRadius: 18,
          boxShadow: 'var(--modal-shadow)',
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
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

// Apple-style segmented control: the white thumb slides under the active
// option (measured from the real button rects so labels of any length work).
function ModeSegmented({
  mode, onChange, labels,
}: {
  mode: Mode
  onChange: (m: Mode) => void
  labels: Record<Mode, string>
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const btnRefs = useRef<Partial<Record<Mode, HTMLButtonElement | null>>>({})
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const update = () => {
      const btn = btnRefs.current[mode]
      if (!btn) return
      setThumb({ left: btn.offsetLeft, width: btn.offsetWidth })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [mode])

  return (
    <div ref={wrapRef} data-mode-pill className="smengo-seg w-full justify-center sm:w-auto">
      {thumb && <span className="smengo-seg-thumb" style={{ left: thumb.left, width: thumb.width }} aria-hidden="true" />}
      {(['compact', 'detail', 'extended'] as const).map((m) => (
        <button
          key={m}
          ref={(el) => { btnRefs.current[m] = el }}
          type="button"
          data-active={mode === m}
          onClick={() => onChange(m)}
          className="flex-1 sm:flex-none"
        >
          {labels[m]}
        </button>
      ))}
    </div>
  )
}

function SettingRow({
  label, value, onChange, disabled = false,
}: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onChange(!value) }}
      aria-pressed={value}
      aria-disabled={disabled}
      className="smengo-pop-item justify-between"
      style={{ opacity: disabled ? 0.45 : 1, cursor: disabled ? 'default' : 'pointer' }}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="smengo-switch" aria-pressed={value} aria-hidden="true" />
    </button>
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
  mode, groups, days, todayDayIdx, customCellOf, statusOf, visualColors, siteTone, labels, chipLbl, chipBg, contrast, weekendBg,
  showTimes, merged, showGrid, sticky, onShiftScope, onShiftScopeChange, showEmployeeRole, showEmployeeDepartment, showEmployeeDot, showTelegram, onEmpClick, onToggleProjects, onProjectClick, editMode, onCellEdit,
  getEmpRoleKey, getEmpSpecialty, getRoleLabel, getRoleColor, getSpecialtyColor, onOpenRolePicker,
  dragEmp, setDragEmp, dragOverEmp, setDragOverEmp, dragOverGroup, setDragOverGroup, onMoveEmp,
  optimizedCellKeys, shiftedFromCellKeys, shiftedToCellKeys, optimizationRun, optimizationState,
  problemDayIdx, cellBadgesOf,
}: {
  mode: Mode
  groups: { key: string; name: string; shortName: string; min?: number; rows: EmpDef[] }[]
  days: MonthDay[]
  todayDayIdx: number | null
  problemDayIdx: number | null
  cellBadgesOf: (name: string, dayIdx: number) => CellBadgeDef[]
  customCellOf: (name: string, dayIdx: number) => CustomCellConfig | null
  statusOf: (name: string, dayIdx: number, base: string) => Status
  visualColors: VisualCardColorConfig
  siteTone: SiteTone
  labels: GridPreviewLabels
  chipLbl: Record<Exclude<Status, '-'>, string>
  chipLblFull: Record<Exclude<Status, '-'>, string>
  chipBg: (c: Exclude<Status, '-'>) => string
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
  const gridScrollerRef = useRef<HTMLDivElement | null>(null)
  const nameScrollersRef = useRef(new Set<HTMLDivElement>())
  const namePrimaryRef = useRef<HTMLDivElement | null>(null)
  const nameSyncingRef = useRef(false)
  const registerNameScroller = (el: HTMLDivElement | null) => {
    if (!el) return
    nameScrollersRef.current.add(el)
    const primary = namePrimaryRef.current
    if (!primary || !primary.isConnected || el.scrollWidth > primary.scrollWidth) namePrimaryRef.current = el
  }
  const handleNameScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (nameSyncingRef.current) return
    nameSyncingRef.current = true
    const left = e.currentTarget.scrollLeft
    for (const el of nameScrollersRef.current) {
      if (el !== e.currentTarget && el.isConnected) el.scrollLeft = left
    }
    requestAnimationFrame(() => { nameSyncingRef.current = false })
  }
  const dayKey = (k: keyof GridPreviewLabels['days']) => labels.days[k]
  const isExt = mode === 'extended'
  const colW = isExt ? 86 : 56
  const colMinW = isExt ? 78 : 44
  const rowPad = isExt ? '3px' : '6px 5px'
  const detailCellFontSize = isExt ? 13 : 11.2
  const detailCellAltFontSize = isExt ? 11.5 : 12
  const detailInlineChipMinHeight = isExt ? 46 : 36
  const detailHeaderDayFontSize = 13
  const detailHeaderWeekdayFontSize = 8.5
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
  const allRows = groups.flatMap((group) => group.rows)
  const onShiftGroup = groups.find((group) => group.key === onShiftScope && group.rows.length > 0)
  const onShiftRows = onShiftGroup?.rows ?? allRows

  function shiftWindowParts(window: string): string[] {
    return window
      .split('–')
      .map((part) => `${part.trim().padStart(2, '0')}:00`)
  }
  function visualForCode(code: Exclude<Status, '-'>): VisualCardColorValue {
    if (code === 'W') return visualColors.work
    if (code === 'V') return visualColors.vacation
    if (code === 'S') return visualColors.sick
    if (code === 'D') return visualColors.dayoff
    return visualColors.uncovered
  }

  // Extended mode renders informative cards: header row (shift icon + hours
  // chip), the time window, and any cell badges pinned to the bottom row.
  const renderExtWorkCard = (emp: EmpDef, dayIdx: number) => {
    const wm = workMeta(emp.shift, labels)
    const bg = contrast ? wm.bg : 'var(--chip-w-bg)'
    const visual = visualColors.work
    const ShiftIcon = emp.shift === 'night' ? Moon : Sun
    const [shiftStart, shiftEnd] = shiftWindowParts(wm.window)
    const badges = cellBadgesOf(emp.name, dayIdx)
    const hasBadges = badges.length > 0
    return (
      <div
        className="smengo-schedule-chip"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: bg,
          color: visual.text,
          padding: '5px 6px 6px',
          borderRadius: 8,
          minHeight: 46,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}
      >
        <span style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <span
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
            style={{ width: 16, height: 16 }}
          >
            <ShiftIcon size={10} strokeWidth={2.5} color={visual.icon} />
          </span>
          <span
            style={{
              padding: '2.5px 6px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.15)',
              fontSize: 8,
              fontWeight: 750,
              lineHeight: 1,
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {wm.hours}{labels.hourSuffix}
          </span>
        </span>
        <span
          style={{
            minWidth: 0,
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: visual.text,
            fontSize: detailCellFontSize,
            fontWeight: 700,
            lineHeight: 1.02,
            whiteSpace: 'nowrap',
          }}
        >
          {showTimes ? (
            <>
              <span>{shiftStart}</span>
              <span>{shiftEnd}</span>
            </>
          ) : wm.name}
        </span>
        {hasBadges && (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 0, maxWidth: '100%' }}>
            {badges.map((b) => <CellBadgePill key={b.id} badge={b} />)}
          </span>
        )}
      </div>
    )
  }

  // Detail mode: compact two-line card — icon + window on top, hours and
  // shift name underneath. Informative, no badges.
  const renderDetailWorkChip = (emp: EmpDef) => {
    const wm = workMeta(emp.shift, labels)
    const bg = contrast ? wm.bg : 'var(--chip-w-bg)'
    const WIcon = wm.Icon
    return (
      <div
        className="smengo-schedule-chip"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          background: bg,
          color: visualColors.work.text,
          width: 'calc(100% - 4px)',
          maxWidth: '100%',
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: '4px 3px',
          borderRadius: 6,
          minWidth: 0,
          minHeight: detailInlineChipMinHeight,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5, fontSize: 10.5, fontWeight: 750, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          <WIcon size={10} strokeWidth={2.4} color={visualColors.work.icon} />
          {showTimes ? compactShiftWindow(emp.shift) : wm.name}
        </span>
        <span style={{ fontSize: 8.2, fontWeight: 650, lineHeight: 1, opacity: 0.78, letterSpacing: '0.02em' }}>
          {wm.hours}{labels.hourSuffix}{showTimes ? ` · ${wm.name}` : ''}
        </span>
      </div>
    )
  }

  const renderExtDayoffCard = (emp: EmpDef, dayIdx: number) => {
    const badges = cellBadgesOf(emp.name, dayIdx)
    const hasBadges = badges.length > 0
    return (
      <div
        className="smengo-schedule-chip"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          width: '100%',
          minHeight: 46,
          background: chipBg('D'),
          color: visualColors.dayoff.text,
          padding: hasBadges ? '24px 7px 6px' : '5px 7px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 750,
          lineHeight: 1.05,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}
      >
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/15"
          style={{ position: 'absolute', top: 5, left: 6, width: 16, height: 16 }}
        >
          <CalendarDays size={10} strokeWidth={2.4} color={visualColors.dayoff.icon} />
        </span>
        {labels.shifts.dayoff}
        {hasBadges && (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 0, maxWidth: '100%' }}>
            {badges.map((b) => <CellBadgePill key={b.id} badge={b} />)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div>
      <AppleHScrollbar
        scrollerRef={gridScrollerRef}
        style={{ marginLeft: nameColW, marginRight: 6 }}
      />
      <div ref={gridScrollerRef} style={{ overflowX: 'auto' }}>
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
              <div className="flex min-w-0 items-center gap-2">
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels.employee}</span>
                <button
                  type="button"
                  onClick={onToggleProjects}
                  className="hidden cursor-pointer transition-colors sm:inline-block"
                  style={{
                    background: showTelegram ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
                    color: showTelegram ? 'var(--accent)' : 'var(--muted-foreground)',
                    border: 0, borderRadius: 5, padding: '2px 9px',
                    fontSize: 9.5, fontWeight: 600,
                    textTransform: 'none', letterSpacing: 0,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {showTelegram ? labels.telegramBtn : labels.projectsBtn}
                </button>
              </div>
              <AppleHScrollbar scrollerRef={namePrimaryRef} size="sm" style={{ marginTop: 2 }} />
            </th>
            {days.map((d, ci) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              const isToday = ci === todayDayIdx
              const isProblemCol = problemDayIdx !== null && ci === problemDayIdx
              const isWeekBoundary = ci > 0 && (d.k === 'mon' || d.k === 'sat')
              return (
                <th
                  key={d.n}
                  style={{
                    width: colW,
                    minWidth: colMinW,
                    height: 54,
                    padding: '8px 4px',
                    textAlign: 'center',
                    background: isProblemCol
                      ? 'var(--grid-problem-col)'
                      : isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--foreground)',
                    position: 'relative',
                    overflow: 'hidden',
                    borderLeft: isWeekBoundary ? '1px solid var(--border)' : 'none',
                    borderRight: d.k === 'sun' ? '1px solid var(--border)' : 'none',
                    boxShadow: isProblemCol ? 'inset 0 -2px 0 color-mix(in oklab, var(--st-alert) 55%, transparent)' : 'none',
                    transition: 'background 360ms ease, box-shadow 360ms ease',
                  }}
                >
                  <div style={{ display: 'flex', minHeight: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: isToday ? 27 : 'auto',
                        height: isToday ? 28 : 'auto',
                        padding: isToday ? '0 5px' : 0,
                        borderRadius: isToday ? 8 : 0,
                        background: isToday ? 'var(--accent)' : 'transparent',
                        color: isToday ? '#fff' : isProblemCol ? 'var(--st-alert)' : (isWkd ? 'var(--muted-foreground)' : 'var(--foreground)'),
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif',
                        fontWeight: 650,
                        fontSize: detailHeaderDayFontSize,
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {d.n}
                    </span>
                    <span
                      style={{
                        color: 'var(--muted-foreground)',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif',
                        fontSize: detailHeaderWeekdayFontSize,
                        fontWeight: 520,
                        lineHeight: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {dayKey(d.k)}
                    </span>
                  </div>
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
                        <div className="smengo-name-scroll" ref={registerNameScroller} onScroll={handleNameScroll} style={{ marginTop: 4 }}>
                          {showTelegram ? (
                            <DepartmentPositionCard
                              department={labels.telegramBtn}
                              position={emp.tg}
                              accent="#3884de"
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
                              onClick={() => onOpenRolePicker(emp.name)}
                            />
                          )}
                        </div>
                        {/* Extended mode adds the month summary right next to the name */}
                        {(() => {
                          let off = 0, work = 0
                          days.forEach((_d, ci) => {
                            const s = statusOf(emp.name, ci, emp.s)
                            if (s === 'V' || s === 'S' || s === 'D') off++
                            else if (s === 'W') work++
                          })
                          const hrs = work * workMeta(emp.shift, labels).hours
                          const chip: React.CSSProperties = {
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            borderRadius: 6, padding: '2px 7px',
                            fontSize: 10, fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
                          }
                          return (
                            <div style={{ marginTop: 5, display: 'flex', gap: 4, minWidth: 0 }}>
                              <span title={labels.colWorkHrs} style={{ ...chip, background: 'color-mix(in oklab, var(--st-work) 16%, transparent)', color: 'var(--foreground)' }}>
                                {hrs}{labels.hourSuffix}
                              </span>
                              <span title={labels.colOffDays} style={{ ...chip, background: 'var(--grid-pill-bg)', color: 'var(--muted-foreground)' }}>
                                {labels.colOffDays} {off}
                              </span>
                            </div>
                          )
                        })()}
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
	                        <div className="smengo-name-scroll" ref={registerNameScroller} onScroll={handleNameScroll}>
	                        <button
	                          type="button"
	                          onClick={() => showTelegram ? onProjectClick(emp.name, emp.pIdx) : onOpenRolePicker(emp.name)}
	                          className="bg-transparent p-0 text-left"
	                          style={{
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
	                            whiteSpace: 'nowrap',
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
	                          <span style={{ whiteSpace: 'nowrap' }}>
	                            {showTelegram ? `${labels.telegramBtn} › ${emp.tg}` : `${dept.name} › ${getEmpSpecialty(emp)}`}
	                          </span>
	                        </button>
	                        </div>
	                      </div>
	                    </div>
	                  )}
                </td>
                {(merged || days.some((_d, ci) => {
                  const code = statusOf(emp.name, ci, emp.s)
                  return isDefaultMergedLeaveStatus(code)
                })) ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  days.forEach((_d, ci) => {
                    const code = statusOf(emp.name, ci, emp.s)
                    const last = runs[runs.length - 1]
                    if (last && last.code === code && shouldMergeScheduleRun(code, merged)) { last.indices.push(ci) }
                    else { runs.push({ code, indices: [ci] }) }
                  })
	                  return runs.map((run, ri) => {
	                    const { code, indices } = run
	                    const span = indices.length
	                    const customCell = span === 1 ? customCellOf(emp.name, indices[0] ?? 0) : null
	                    const isOff = code === '-' || code === undefined
                    const allWkd = indices.every(i => { const d = days[i]; return d.k === 'sat' || d.k === 'sun' })
                    const raw = code as Exclude<Status, '-'>
                    const isProblemRun = problemDayIdx !== null && span === 1 && indices[0] === problemDayIdx
                    const runKey = `${emp.name}-${ri}`
                    const isHovered = hoveredRun === runKey
                    const isOptimizedRun = optimizationState !== 'idle' && optimizationRun > 1 && indices.some((i) => optimizedCellKeys[`${emp.name}-${i}`])
                    return (
	                      <td
	                        key={`run-${ri}`}
	                        className={editMode ? 'smengo-schedule-cell smengo-schedule-edit-cell' : 'smengo-schedule-cell'}
	                        colSpan={span}
	                        onClick={editMode ? (e) => {
	                          const target = scheduleRunClickTarget(e, indices)
	                          onCellEdit(emp.name, target.dayIdx, target.anchorX, target.anchorBottom + 6)
	                        } : undefined}
	                        onMouseEnter={() => setHoveredRun(runKey)}
	                        onMouseLeave={() => setHoveredRun(null)}
	                        style={{
	                          padding: rowPad, textAlign: 'center',
	                          position: 'relative',
	                          background: isProblemRun
	                            ? 'var(--grid-problem-col)'
	                            : allWkd ? weekendBg : 'var(--grid-cell)',
	                          borderRight: showGrid ? '1px solid var(--border)' : 'none',
	                          cursor: editMode ? 'pointer' : 'default',
	                          transition: 'background 360ms ease',
	                          animation: isOptimizedRun ? 'smengo-ai-cell-pop 760ms cubic-bezier(.22,1,.36,1)' : 'none',
	                        }}
	                      >
                        {isHovered && span > 1 && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}%))`,
                          }} />
                        )}
	                        {customCell ? (
		                          <CustomScheduleChip config={customCell} tone={siteTone} compact={!isExt} minHeight={isExt ? 46 : detailInlineChipMinHeight} />
	                        ) : isOff ? (
	                          <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
	                        ) : (isExt ? (() => {
                          const runCode = raw as Exclude<Status, '-'>
                          const wm = workMeta(emp.shift, labels)
                          const bg = runCode === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(runCode)
                          const visual = visualForCode(runCode)
                          const isU = runCode === 'U'

                          if (runCode === 'W') return renderExtWorkCard(emp, indices[0] ?? 0)

                          if (runCode === 'D') return renderExtDayoffCard(emp, indices[0] ?? 0)

	                          if (runCode === 'V' || runCode === 'S') {
	                            const LeaveIcon = runCode === 'S' ? Thermometer : TreePalm
	                            return (
	                              <div
	                                className="smengo-schedule-chip smengo-leave-chip"
	                                style={{
	                                  position: 'relative',
	                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: 46,
                                  background: bg,
                                  color: visual.text,
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
		                                  <LeaveIcon size={10} strokeWidth={2.5} color={runCode === 'S' ? visualColors.sick.icon : visualColors.vacation.icon} />
                                </span>
                                <span
                                  style={{
	                                    color: visual.text,
	                                    fontSize: 11.5,
	                                    fontWeight: 750,
	                                    lineHeight: 1.05,
	                                    minWidth: 0,
	                                    maxWidth: '100%',
	                                    overflow: 'hidden',
	                                    whiteSpace: 'nowrap',
	                                    transform: 'translateY(7px)',
	                                  }}
	                                >
	                                  <ScheduleLeaveLabelText code={runCode} labels={labels} />
	                                </span>
	                              </div>
	                            )
	                          }

                          const label = labels.statusUncovered
                          return (
                            <div
	                                className="smengo-schedule-chip"
	                                style={{
                                      position: 'relative',
	                                  display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                width: '100%',
                                minHeight: 46,
                                background: isU ? 'transparent' : bg,
                                color: visual.text,
                                border: isU ? `1.5px dashed ${visual.text}` : 'none',
                                padding: '5px 7px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 750,
                                lineHeight: 1,
                                textAlign: 'center',
                                boxShadow: isU ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                              }}
                            >
		                              {isU && <AlertCircle size={11} strokeWidth={2.4} color={visualColors.uncovered.icon} />}
                              <span>{label}</span>
                            </div>
                          )
	                        })() : (() => {
	                          if (raw === 'W') return renderDetailWorkChip(emp)
	                          const isLeave = isDefaultMergedLeaveStatus(raw)
	                          const visual = visualForCode(raw)
	                          return (
		                          <div className={`smengo-schedule-chip${isLeave ? ' smengo-leave-chip' : ''}`} style={{
		                            display: 'flex', alignItems: 'center', justifyContent: 'center',
		                            background: chipBg(raw), color: visual.text,
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
	                            {isLeave ? <ScheduleLeaveLabelText code={raw} labels={labels} /> : chipLbl[raw]}
	                          </div>
	                          )
	                        })())}
                      </td>
                    )
                  })
                })() : days.map((d, ci) => {
                  const raw = statusOf(emp.name, ci, emp.s)
	                  const isWkd = d.k === 'sat' || d.k === 'sun'
	                  const isOff = raw === '-' || raw === undefined
	                  const isProblemCol = problemDayIdx !== null && ci === problemDayIdx
	                  const customCell = customCellOf(emp.name, ci)
	                  const cellInteractive = editMode
                  const aiCellKey = `${emp.name}-${ci}`
                  const aiCanAnimate = optimizationState !== 'idle' && optimizationRun > 1
                  const isOptimizedCell = aiCanAnimate && optimizedCellKeys[aiCellKey]
                  const isShiftSourceCell = aiCanAnimate && shiftedFromCellKeys[aiCellKey]
                  const isShiftTargetCell = aiCanAnimate && shiftedToCellKeys[aiCellKey]
                  const isAiAnimatedCell = isOptimizedCell || isShiftSourceCell || isShiftTargetCell
                  return (
	                    <td
	                      key={d.n}
	                      className={editMode ? 'smengo-schedule-cell smengo-schedule-edit-cell' : 'smengo-schedule-cell'}
	                      data-ai={isAiAnimatedCell ? aiCellKind(!!isShiftSourceCell, !!isShiftTargetCell) : undefined}
	                      onClick={cellInteractive ? (e) => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        onCellEdit(emp.name, ci, r.left + r.width / 2, r.bottom + 6)
                      } : undefined}
                      style={{
                        padding: rowPad, textAlign: 'center',
	                        background: isProblemCol
	                          ? 'var(--grid-problem-col)'
	                          : isWkd ? weekendBg : 'var(--grid-cell)',
	                        position: 'relative',
	                        borderRight: showGrid ? '1px solid var(--border)' : 'none',
	                        cursor: cellInteractive ? 'pointer' : 'default',
	                        transition: 'background 360ms ease',
	                        animation: aiCellAnimation(!!isOptimizedCell, !!isShiftSourceCell, !!isShiftTargetCell, ci),
	                        ...(isAiAnimatedCell ? { ['--ai-delay' as string]: `${aiWaveDelayMs(ci)}ms` } : {}),
	                        transformOrigin: 'center',
	                        willChange: isAiAnimatedCell ? 'box-shadow' : 'auto',
	                      }}
                    >
	                      {customCell ? (
	                        <CustomScheduleChip config={customCell} tone={siteTone} compact={!isExt} minHeight={isExt ? 46 : detailInlineChipMinHeight} />
	                      ) : isOff ? (
	                        <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
	                      ) : (() => {
                        const code = raw as Exclude<Status, '-'>
                        const wm = workMeta(emp.shift, labels)
                        const StIcon = statusIcon(code)
                        const bg = code === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(code)
                        const visual = visualForCode(code)
                        const fg = visual.text
                        const isU = code === 'U'
                        if (isExt) {
                          if (code === 'W') return renderExtWorkCard(emp, ci)

                          if (code === 'D') return renderExtDayoffCard(emp, ci)

	                          if (code === 'V' || code === 'S') {
	                            const LeaveIcon = code === 'S' ? Thermometer : TreePalm
	                            return (
	                              <div
	                                className="smengo-schedule-chip smengo-leave-chip"
	                                style={{
	                                  position: 'relative',
	                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: 46,
                                  background: bg,
                                  color: visual.text,
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
	                                  <LeaveIcon size={10} strokeWidth={2.5} color={code === 'S' ? visualColors.sick.icon : visualColors.vacation.icon} />
                                </span>
                                <span
                                  style={{
	                                    color: visual.text,
	                                    fontSize: 11.5,
	                                    fontWeight: 750,
	                                    lineHeight: 1.05,
	                                    minWidth: 0,
	                                    maxWidth: '100%',
	                                    overflow: 'hidden',
	                                    whiteSpace: 'nowrap',
	                                    transform: 'translateY(7px)',
	                                  }}
	                                >
	                                  <ScheduleLeaveLabelText code={code} labels={labels} />
	                                </span>
	                              </div>
	                            )
	                          }

                          const label = labels.statusUncovered

                          return (
                            <div
                              className="smengo-schedule-chip"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                width: '100%',
                                minHeight: 46,
                                background: isU ? 'transparent' : bg,
                                color: visual.text,
                                border: isU ? `1.5px dashed ${visual.text}` : 'none',
                                padding: '5px 7px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 750,
                                lineHeight: 1,
                                textAlign: 'center',
                                boxShadow: isU ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                              }}
                            >
	                              {isU && <AlertCircle size={11} strokeWidth={2.4} color={visualColors.uncovered.icon} />}
                              <span>{label}</span>
                            </div>
                          )
                        }
	                        if (code === 'W') return renderDetailWorkChip(emp)
	                        const isLeave = isDefaultMergedLeaveStatus(code)
	                        return (
	                          <div
	                            className={`smengo-schedule-chip${isLeave ? ' smengo-leave-chip' : ''}`}
	                            style={{
	                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2,
	                              background: isU ? 'transparent' : bg,
                              color: fg,
                              border: isU ? `1.5px dashed ${fg}` : 'none',
	                              width: 'calc(100% - 4px)',
	                              maxWidth: '100%',
	                              boxSizing: 'border-box',
	                              margin: '0 auto',
	                              padding: '1px 5px', borderRadius: 3,
	                              minWidth: 0,
	                              minHeight: detailInlineChipMinHeight,
	                              fontSize: code === 'S' && showTimes ? detailCellFontSize : detailCellAltFontSize,
	                              fontWeight: 500, whiteSpace: 'nowrap',
	                            }}
                          >
                            {StIcon ? (
	                              <>
		                                <StIcon size={11} color={visualForCode(code).icon} />
		                                {isLeave ? <ScheduleLeaveLabelText code={code} labels={labels} /> : chipLbl[code]}
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
                    const s = statusOf(emp.name, ci, emp.s)
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{labels.onShiftRowLabel}</span>
                  <OnShiftScopePicker labels={labels} groups={groups} value={onShiftScope} onChange={onShiftScopeChange} />
                </div>
              </td>
              {onShiftCountsForRows(onShiftRows, statusOf, days).map((count, ci) => {
                const isWkd = days[ci].k === 'sat' || days[ci].k === 'sun'
                const isProblemCol = problemDayIdx !== null && ci === problemDayIdx
                return (
                  <td
                    key={ci}
                    style={{
                      width: colW,
                      minWidth: colMinW,
	                      padding: isExt ? '5px 2px' : '7px 4px',
                      textAlign: 'center',
                      background: isProblemCol ? 'var(--grid-problem-col)' : isWkd ? weekendBg : 'var(--grid-cell)',
                      borderRight: showGrid ? '1px solid var(--border)' : 'none',
                      transition: 'background 360ms ease',
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
    </div>
  )
}

/* ── Compact mode ──────────────────────────────────────────────── */
function CompactGrid({
  groups, days, todayDayIdx, customCellOf, statusOf, weekendBg, chipBg, visualColors, siteTone, contrast, labels,
  showTimes, merged, showGrid, sticky, onShiftScope, onShiftScopeChange, showEmployeeRole, showEmployeeDepartment, showEmployeeDot, showTelegram, onEmpClick, editMode, onToggleProjects, onProjectClick, onCellEdit,
  getEmpRoleKey, getEmpSpecialty, getRoleColor, getSpecialtyColor, onOpenRolePicker,
  dragEmp, setDragEmp, dragOverEmp, setDragOverEmp, dragOverGroup, setDragOverGroup, onMoveEmp,
  optimizedCellKeys, shiftedFromCellKeys, shiftedToCellKeys, optimizationRun, optimizationState,
  problemDayIdx,
}: {
  groups: { key: string; name: string; shortName: string; min?: number; rows: EmpDef[] }[]
  days: MonthDay[]
  todayDayIdx: number | null
  problemDayIdx: number | null
  customCellOf: (name: string, dayIdx: number) => CustomCellConfig | null
  statusOf: (name: string, dayIdx: number, base: string) => Status
  weekendBg: string
  chipBg: (c: Exclude<Status, '-'>) => string
  visualColors: VisualCardColorConfig
  siteTone: SiteTone
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
  const gridScrollerRef = useRef<HTMLDivElement | null>(null)
  const nameScrollersRef = useRef(new Set<HTMLDivElement>())
  const namePrimaryRef = useRef<HTMLDivElement | null>(null)
  const nameSyncingRef = useRef(false)
  const registerNameScroller = (el: HTMLDivElement | null) => {
    if (!el) return
    nameScrollersRef.current.add(el)
    const primary = namePrimaryRef.current
    if (!primary || !primary.isConnected || el.scrollWidth > primary.scrollWidth) namePrimaryRef.current = el
  }
  const handleNameScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (nameSyncingRef.current) return
    nameSyncingRef.current = true
    const left = e.currentTarget.scrollLeft
    for (const el of nameScrollersRef.current) {
      if (el !== e.currentTarget && el.isConnected) el.scrollLeft = left
    }
    requestAnimationFrame(() => { nameSyncingRef.current = false })
  }
  const nameColW = compactEmployeeNameColumnWidth({
    sticky,
    showEmployeeRole,
    showEmployeeDepartment,
    showEmployeeDot,
    showTelegram,
  })
  const nameColTransition = 'width 160ms ease, min-width 160ms ease, max-width 160ms ease'
  const dayMinW = 44
  const scheduleChipMinHeight = 34
  // Compact mode is a pure overview: no totals columns, the month gets the full width.
  const minTableW = nameColW + days.length * dayMinW
  const dndEnabled = false
  const allRows = groups.flatMap((group) => group.rows)
  const onShiftGroup = groups.find((group) => group.key === onShiftScope && group.rows.length > 0)
  const onShiftRows = onShiftGroup?.rows ?? allRows
  function visualForCode(code: Exclude<Status, '-'>): VisualCardColorValue {
    if (code === 'W') return visualColors.work
    if (code === 'V') return visualColors.vacation
    if (code === 'S') return visualColors.sick
    if (code === 'D') return visualColors.dayoff
    return visualColors.uncovered
  }
  return (
    <div>
      <AppleHScrollbar
        scrollerRef={gridScrollerRef}
        style={{ marginLeft: nameColW, marginRight: 6 }}
      />
      <div ref={gridScrollerRef} style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: minTableW, fontSize: 10, tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: nameColW }} />
          {days.map((d) => (
            <col key={d.n} style={{ width: dayMinW }} />
          ))}
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
              <div className="flex min-w-0 items-center gap-2">
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels.employee}</span>
                <button
                  type="button"
                  onClick={onToggleProjects}
                  className="hidden cursor-pointer transition-colors sm:inline-block"
                  style={{
                    background: showTelegram ? 'var(--accent-soft)' : 'var(--grid-pill-bg)',
                    color: showTelegram ? 'var(--accent)' : 'var(--muted-foreground)',
                    border: 0, borderRadius: 5, padding: '2px 8px',
                    fontSize: 9, fontWeight: 600,
                    textTransform: 'none', letterSpacing: 0,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {showTelegram ? labels.telegramBtn : labels.projectsBtn}
                </button>
              </div>
              <AppleHScrollbar scrollerRef={namePrimaryRef} size="sm" style={{ marginTop: 2 }} />
            </th>
            {days.map((d, ci) => {
              const isWkd = d.k === 'sat' || d.k === 'sun'
              const isToday = ci === todayDayIdx
              const isProblemCol = problemDayIdx !== null && ci === problemDayIdx
              const isWeekBoundary = ci > 0 && (d.k === 'mon' || d.k === 'sat')
              return (
                <th
                  key={d.n}
                  style={{
                    height: 44,
                    padding: '5px 0',
                    textAlign: 'center',
                    background: isProblemCol
                      ? 'var(--grid-problem-col)'
                      : isWkd ? weekendBg : 'var(--grid-cell)',
                    color: 'var(--foreground)',
                    fontWeight: 500,
                    fontSize: 9.5,
                    position: 'relative',
                    overflow: 'hidden',
                    borderLeft: isWeekBoundary ? '1px solid var(--border)' : 'none',
                    borderRight: d.k === 'sun' ? '1px solid var(--border)' : 'none',
                    boxShadow: isProblemCol ? 'inset 0 -2px 0 color-mix(in oklab, var(--st-alert) 55%, transparent)' : 'none',
                    transition: 'background 360ms ease, box-shadow 360ms ease',
                  }}
                >
                  <div style={{ display: 'flex', minHeight: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: isToday ? 22 : 'auto',
                        height: isToday ? 23 : 'auto',
                        padding: isToday ? '0 4px' : 0,
                        borderRadius: isToday ? 7 : 0,
                        background: isToday ? 'var(--accent)' : 'transparent',
                        color: isToday ? '#fff' : isProblemCol ? 'var(--st-alert)' : (isWkd ? 'var(--muted-foreground)' : 'var(--foreground)'),
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: 10.5,
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {d.n}
                    </span>
                    <span
                      style={{
                        color: 'var(--muted-foreground)',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif',
                        fontSize: 7.2,
                        fontWeight: 500,
                        lineHeight: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {labels.days[d.k]}
                    </span>
                  </div>
                </th>
              )
            })}
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
              <td colSpan={days.length} style={{ background: dndEnabled && dragOverGroup === dept.key ? 'var(--accent-soft)' : 'var(--grid-dept-bg)' }} />
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
                    className="min-w-0"
                    style={{
                      cursor: 'default',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      display: 'grid',
                      gridTemplateColumns: '16px minmax(0, 1fr)',
                      alignItems: 'center',
                      columnGap: 8,
                    }}
                  >
                    <Avatar name={emp.name} size={16} />
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
                          width: '100%',
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
                      <div className="smengo-name-scroll" ref={registerNameScroller} onScroll={handleNameScroll}>
                        {showTelegram ? (
                          <DepartmentPositionCard
                            department={labels.telegramBtn}
                            position={emp.tg}
                            accent="#3884de"
                            compact
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
                            textScale={0.85}
                            showDepartment={sticky && showEmployeeDepartment}
                            showPosition={showEmployeeRole}
                            showDot={showEmployeeDot}
                            onClick={() => onOpenRolePicker(emp.name)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                {(merged || days.some((_d, ci) => {
                  const code = statusOf(emp.name, ci, emp.s)
                  return isDefaultMergedLeaveStatus(code)
                })) ? (() => {
                  type Run = { code: Status | undefined; indices: number[] }
                  const runs: Run[] = []
                  days.forEach((_d, ci) => {
                    const code = statusOf(emp.name, ci, emp.s)
                    const last = runs[runs.length - 1]
                    if (last && last.code === code && shouldMergeScheduleRun(code, merged)) { last.indices.push(ci) }
                    else { runs.push({ code, indices: [ci] }) }
                  })
	                  return runs.map((run, ri) => {
	                    const { code, indices } = run
	                    const span = indices.length
	                    const customCell = span === 1 ? customCellOf(emp.name, indices[0] ?? 0) : null
	                    const isOff = code === '-' || code === undefined
                    const allWkd = indices.every(i => { const d = days[i]; return d.k === 'sat' || d.k === 'sun' })
                    const isProblemRun = problemDayIdx !== null && span === 1 && indices[0] === problemDayIdx
                    const runKey = `${emp.name}-${ri}`
                    const isHovered = hoveredRun === runKey
                    const isOptimizedRun = optimizationState !== 'idle' && optimizationRun > 1 && indices.some((i) => optimizedCellKeys[`${emp.name}-${i}`])
                    return (
	                      <td
	                        key={`run-${ri}`}
	                        className={editMode ? 'smengo-schedule-cell smengo-schedule-edit-cell' : 'smengo-schedule-cell'}
	                        colSpan={span}
	                        onClick={editMode ? (e) => {
	                          const target = scheduleRunClickTarget(e, indices)
	                          onCellEdit(emp.name, target.dayIdx, target.anchorX, target.anchorBottom + 4)
	                        } : undefined}
	                        onMouseEnter={() => setHoveredRun(runKey)}
	                        onMouseLeave={() => setHoveredRun(null)}
	                        style={{
	                          padding: '2px 1px',
	                          position: 'relative',
	                          textAlign: 'center',
	                          background: isProblemRun
	                            ? 'var(--grid-problem-col)'
	                            : allWkd ? weekendBg : 'var(--grid-cell)',
	                          borderRight: showGrid ? '1px solid var(--border)' : 'none',
	                          cursor: editMode ? 'pointer' : 'default',
	                          transition: 'background 360ms ease',
	                          animation: isOptimizedRun ? 'smengo-ai-cell-pop 760ms cubic-bezier(.22,1,.36,1)' : 'none',
	                        }}
	                      >
                        {isHovered && span > 1 && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}% - 0.5px), var(--border) calc(${100 / span}%))`,
                          }} />
                        )}
		                        {customCell ? (
		                          <CustomScheduleChip config={customCell} tone={siteTone} compact minHeight={scheduleChipMinHeight} />
		                        ) : isOff ? (
		                          <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
		                        ) : (() => {
	                          const runCode = code as Exclude<Status, '-'>
	                          const wm = workMeta(emp.shift, labels)
	                          const shiftParts = runCode === 'W' && showTimes ? shiftWindowParts(wm.window) : null
	                          const isLeave = isDefaultMergedLeaveStatus(runCode)
	                          const visual = visualForCode(runCode)
	                          return (
	                          <div className={`smengo-schedule-chip${isLeave ? ' smengo-leave-chip' : ''}`} style={{
	                            display: 'inline-flex',
	                            alignItems: 'center',
	                            justifyContent: 'center',
                            width: 'calc(100% - 4px)',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            margin: '0 auto',
                            minWidth: 0,
                            background: chipBg(code as Exclude<Status, '-'>),
                            color: visual.text,
                            borderRadius: 4,
                            fontSize: shiftParts ? 8.2 : (runCode === 'S' && showTimes ? 7.5 : 9),
                            fontWeight: 600,
                            padding: shiftParts ? '4px 2px' : '3px 2px',
                            lineHeight: 1.1,
                            textAlign: 'center',
                            minHeight: scheduleChipMinHeight,
                            whiteSpace: shiftParts ? 'normal' : 'nowrap',
	                            overflow: 'hidden',
	                          }}>
	                            {shiftParts ? (
	                              <ShiftTimeStack start={shiftParts[0]} end={shiftParts[1]} fontSize={8.2} />
	                            ) : isLeave ? (
	                              <ScheduleLeaveLabelText code={runCode} labels={labels} />
	                            ) : runCode === 'U' ? '?' : null}
	                          </div>
	                          )
	                        })()}
                      </td>
                    )
                  })
                })() : days.map((d, ci) => {
                  const code = statusOf(emp.name, ci, emp.s)
	                  const isWkd = d.k === 'sat' || d.k === 'sun'
	                  const isOff = code === '-' || code === undefined
	                  const isProblemCol = problemDayIdx !== null && ci === problemDayIdx
	                  const customCell = customCellOf(emp.name, ci)
	                  const aiCellKey = `${emp.name}-${ci}`
                  const aiCanAnimate = optimizationState !== 'idle' && optimizationRun > 1
                  const isOptimizedCell = aiCanAnimate && optimizedCellKeys[aiCellKey]
                  const isShiftSourceCell = aiCanAnimate && shiftedFromCellKeys[aiCellKey]
                  const isShiftTargetCell = aiCanAnimate && shiftedToCellKeys[aiCellKey]
                  const isAiAnimatedCell = isOptimizedCell || isShiftSourceCell || isShiftTargetCell
                  return (
	                    <td
	                      key={d.n}
	                      className={editMode ? 'smengo-schedule-cell smengo-schedule-edit-cell' : 'smengo-schedule-cell'}
	                      data-ai={isAiAnimatedCell ? aiCellKind(!!isShiftSourceCell, !!isShiftTargetCell) : undefined}
	                      onClick={editMode ? (e) => {
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        onCellEdit(emp.name, ci, r.left + r.width / 2, r.bottom + 4)
                      } : undefined}
                      style={{
	                        padding: 2, textAlign: 'center',
	                        background: isProblemCol
	                          ? 'var(--grid-problem-col)'
	                          : isWkd ? weekendBg : 'var(--grid-cell)',
	                        position: 'relative',
	                        borderRight: showGrid ? '1px solid var(--border)' : 'none',
	                        cursor: editMode ? 'pointer' : 'default',
	                        transition: 'background 360ms ease',
	                        animation: aiCellAnimation(!!isOptimizedCell, !!isShiftSourceCell, !!isShiftTargetCell, ci),
	                        ...(isAiAnimatedCell ? { ['--ai-delay' as string]: `${aiWaveDelayMs(ci)}ms` } : {}),
	                        transformOrigin: 'center',
	                        willChange: isAiAnimatedCell ? 'box-shadow' : 'auto',
	                      }}
                    >
	                      {customCell ? (
	                        <CustomScheduleChip config={customCell} tone={siteTone} compact minHeight={scheduleChipMinHeight} />
	                      ) : isOff ? (
	                        <span style={{ fontSize: 9, color: 'var(--grid-empty-fg)' }}>—</span>
	                      ) : (() => {
                        const cc = code as Exclude<Status, '-'>
                        const wm = workMeta(emp.shift, labels)
	                        const bg = cc === 'W' ? (contrast ? wm.bg : 'var(--chip-w-bg)') : chipBg(cc)
	                        const visual = visualForCode(cc)
	                        const isU = cc === 'U'
	                        const shiftParts = cc === 'W' && showTimes ? shiftWindowParts(wm.window) : null
	                        const isLeave = isDefaultMergedLeaveStatus(cc)
	                        return (
	                          <div
	                            className={`smengo-schedule-chip${isLeave ? ' smengo-leave-chip' : ''}`}
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
	                              color: visual.text,
                              border: isU ? `1px dashed ${visual.text}` : 'none',
                              borderRadius: 4,
                              fontSize: shiftParts ? 8.5 : ((cc === 'W' || cc === 'S') && showTimes ? 9 : 10.5),
                              fontWeight: 600,
                              padding: shiftParts ? '4px 2px' : '3px 2px',
                              lineHeight: 1.15,
                              minHeight: scheduleChipMinHeight,
                              whiteSpace: shiftParts ? 'normal' : 'nowrap',
                              overflow: 'hidden',
	                            }}
	                          >
	                            {isU ? '?' : isLeave ? (
	                              <ScheduleLeaveLabelText code={cc} labels={labels} />
	                            ) : shiftParts ? (
	                              <ShiftTimeStack start={shiftParts[0]} end={shiftParts[1]} fontSize={8.5} />
	                            ) : null}
	                          </div>
                        )
                      })()}
                    </td>
                  )
                })}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{labels.onShiftRowLabel}</span>
                  <OnShiftScopePicker labels={labels} groups={groups} value={onShiftScope} onChange={onShiftScopeChange} />
                </div>
              </td>
              {onShiftCountsForRows(onShiftRows, statusOf, days).map((count, ci) => {
                const isWkd = days[ci].k === 'sat' || days[ci].k === 'sun'
                const isProblemCol = problemDayIdx !== null && ci === problemDayIdx
                return (
                  <td
                    key={ci}
                    style={{
                      padding: '4px 0',
                      textAlign: 'center',
                      background: isProblemCol ? 'var(--grid-problem-col)' : isWkd ? weekendBg : 'var(--grid-cell)',
                      borderRight: showGrid ? '1px solid var(--border)' : 'none',
                      transition: 'background 360ms ease',
                    }}
                  >
                    <OnShiftCountCell count={count} total={onShiftRows.length} compact />
                  </td>
                )
              })}
            </tr>
          </tfoot>
      </table>
      </div>
    </div>
  )
}
