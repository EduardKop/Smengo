'use client'

import { useMemo, useState } from 'react'

type Dept = 'kitchen' | 'hall' | 'bar'

interface Shift {
  start: string
  end: string
  hours: number
  counts: boolean
}

interface Employee {
  id: string
  name: string
  role: string
  dept: Dept
  /** 7 entries for the week, null = day off */
  week: (Shift | null)[]
}

// Restaurant sample data — realistic but compact
const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Анна П.',     role: 'Шеф-повар',  dept: 'kitchen', week: [s('09:00','21:00',12), s('09:00','21:00',12), null,                 s('09:00','21:00',12), s('09:00','21:00',12), null,                 null] },
  { id: 'e2', name: 'Игорь М.',    role: 'Повар',      dept: 'kitchen', week: [null,                 s('10:00','22:00',12), s('10:00','22:00',12), null,                 s('14:00','02:00',12), s('14:00','02:00',12), s('10:00','18:00',8 )] },
  { id: 'e3', name: 'Лиза К.',     role: 'Хостес',     dept: 'hall',    week: [s('17:00','23:00',6 ), s('17:00','23:00',6 ), s('17:00','23:00',6 ), null,                 s('17:00','23:00',6 ), null,                 s('17:00','23:00',6 )] },
  { id: 'e4', name: 'Дмитрий В.',  role: 'Официант',   dept: 'hall',    week: [s('10:00','18:00',8 ), null,                 s('10:00','18:00',8 ), s('10:00','18:00',8 ), s('10:00','18:00',8 ), null,                 s('10:00','18:00',8 )] },
  { id: 'e5', name: 'Мария Н.',    role: 'Официант',   dept: 'hall',    week: [null,                 s('14:00','22:00',8 ), s('14:00','22:00',8 ), s('14:00','22:00',8 ), null,                 s('14:00','22:00',8 ), s('14:00','22:00',8 )] },
  { id: 'e6', name: 'Алексей Р.',  role: 'Бариста',    dept: 'bar',     week: [s('08:00','16:00',8 ), s('08:00','16:00',8 ), null,                 s('08:00','16:00',8 ), s('08:00','16:00',8 ), s('08:00','16:00',8 ), null] },
  { id: 'e7', name: 'Олег С.',     role: 'Бармен',     dept: 'bar',     week: [s('18:00','02:00',8 ), null,                 s('18:00','02:00',8 ), s('18:00','02:00',8 ), s('18:00','02:00',8 ), null,                 s('18:00','02:00',8 )] },
]

function s(start: string, end: string, hours: number, counts = true): Shift {
  return { start, end, hours, counts }
}

const DEPT_STYLE: Record<Dept, { chip: string; ring: string; dot: string; pill: string }> = {
  kitchen: {
    chip: 'bg-[#2f9e6f] text-white',
    ring: 'ring-[#2f9e6f]/40',
    dot:  'bg-[#2f9e6f]',
    pill: 'bg-[#e7f5ee] text-[#1f5e44]',
  },
  hall: {
    chip: 'bg-[#3b6fd4] text-white',
    ring: 'ring-[#3b6fd4]/40',
    dot:  'bg-[#3b6fd4]',
    pill: 'bg-[#e8eefb] text-[#1f3f7e]',
  },
  bar: {
    chip: 'bg-[#7c5cc4] text-white',
    ring: 'ring-[#7c5cc4]/40',
    dot:  'bg-[#7c5cc4]',
    pill: 'bg-[#efe9f7] text-[#4a3380]',
  },
}

interface DemoDict {
  eyebrow: string
  title: string
  subtitle: string
  week: string
  month: string
  departmentLabel: string
  deptAll: string
  deptKitchen: string
  deptHall: string
  deptBar: string
  coverageLabel: string
  coverageGood: string
  coverageGapPrefix: string
  off: string
  hoursShort: string
  weekdays: string[]
  tooltipRole: string
  tooltipHours: string
  tooltipCoverage: string
}

interface Props {
  dict: DemoDict
}

export function InteractiveScheduleDemo({ dict }: Props) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [dept, setDept] = useState<Dept | 'all'>('all')
  const [hover, setHover] = useState<{ empId: string; day: number } | null>(null)

  const filtered = useMemo(
    () => (dept === 'all' ? EMPLOYEES : EMPLOYEES.filter((e) => e.dept === dept)),
    [dept],
  )

  // Coverage: count Saturday (index 5) shifts. Need 4, missing = 4 − count.
  const satRequired = 4
  const satFilled = filtered.reduce((acc, e) => acc + (e.week[5] ? 1 : 0), 0)
  const satGap = Math.max(0, satRequired - satFilled)

  // For month view we just expand to ~28 cells by repeating the week pattern.
  const days = view === 'week' ? 7 : 28

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_24px_80px_-32px_rgba(31,30,28,0.30)] sm:p-6">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-[#f5f3ef] p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setView('week')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              view === 'week' ? 'bg-[#1f1e1c] text-white' : 'text-[#1f1e1c]/70 hover:text-[#1f1e1c]'
            }`}
          >
            {dict.week}
          </button>
          <button
            type="button"
            onClick={() => setView('month')}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              view === 'month' ? 'bg-[#1f1e1c] text-white' : 'text-[#1f1e1c]/70 hover:text-[#1f1e1c]'
            }`}
          >
            {dict.month}
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="demo-dept" className="text-[#1f1e1c]/60">
            {dict.departmentLabel}:
          </label>
          <select
            id="demo-dept"
            value={dept}
            onChange={(e) => setDept(e.target.value as Dept | 'all')}
            className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[#1f1e1c] focus:border-[#3b6fd4] focus:outline-none"
          >
            <option value="all">{dict.deptAll}</option>
            <option value="kitchen">{dict.deptKitchen}</option>
            <option value="hall">{dict.deptHall}</option>
            <option value="bar">{dict.deptBar}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
              satGap > 0
                ? 'bg-[#fff1e8] text-[#b54a14]'
                : 'bg-[#e7f5ee] text-[#1f5e44]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${satGap > 0 ? 'bg-[#e0772d]' : 'bg-[#2f9e6f]'}`}
            />
            {dict.coverageLabel}: {satGap > 0 ? `${dict.coverageGapPrefix} ${satGap}` : dict.coverageGood}
          </span>
        </div>
      </div>

      {/* Grid — scrolls horizontally on mobile */}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[640px] text-[12.5px]"
          style={{ gridTemplateColumns: `180px repeat(${days}, minmax(82px,1fr))` }}
        >
          {/* Header row */}
          <div className="sticky left-0 z-10 border-b border-black/10 bg-white px-3 py-2 font-semibold text-[#1f1e1c]/60">
            &nbsp;
          </div>
          {Array.from({ length: days }).map((_, d) => {
            const wd = d % 7
            const isWeekend = wd >= 5
            return (
              <div
                key={d}
                className={`border-b border-black/10 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider ${
                  isWeekend ? 'bg-[#faf4ea] text-[#b54a14]' : 'text-[#1f1e1c]/55'
                }`}
              >
                {dict.weekdays[wd]}
              </div>
            )
          })}

          {/* Rows */}
          {filtered.map((emp) => (
            <RowFragment
              key={emp.id}
              emp={emp}
              days={days}
              hover={hover}
              setHover={setHover}
              dict={dict}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RowFragment({
  emp, days, hover, setHover, dict,
}: {
  emp: Employee
  days: number
  hover: { empId: string; day: number } | null
  setHover: (v: { empId: string; day: number } | null) => void
  dict: DemoDict
}) {
  const style = DEPT_STYLE[emp.dept]
  return (
    <>
      <div className="sticky left-0 z-10 flex items-center gap-3 border-b border-black/5 bg-white px-3 py-2.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${style.dot}`}
        >
          {emp.name.charAt(0)}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold text-[#1f1e1c]">{emp.name}</span>
          <span className={`inline-flex w-fit rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.pill}`}>
            {emp.role}
          </span>
        </span>
      </div>

      {Array.from({ length: days }).map((_, d) => {
        const wd = d % 7
        const isWeekend = wd >= 5
        const shift = emp.week[wd]
        const isHover = hover?.empId === emp.id && hover.day === d
        return (
          <div
            key={d}
            className={`relative border-b border-black/5 p-1.5 ${isWeekend ? 'bg-[#faf4ea]/60' : ''}`}
            onMouseEnter={() => setHover({ empId: emp.id, day: d })}
            onMouseLeave={() => setHover(null)}
          >
            {shift ? (
              <div
                className={`relative cursor-default rounded-lg px-2 py-1.5 text-[11px] font-semibold leading-tight ring-1 transition-transform ${style.chip} ${style.ring} ${
                  isHover ? 'scale-[1.04]' : ''
                }`}
              >
                <div>{shift.start}–{shift.end}</div>
                <div className="mt-0.5 text-[10px] font-medium opacity-80">
                  {shift.hours}{dict.hoursShort}
                </div>

                {isHover && (
                  <div className="absolute left-1/2 top-full z-30 mt-2 w-44 -translate-x-1/2 rounded-lg bg-[#1f1e1c] p-2.5 text-left text-[11px] font-medium text-white shadow-xl">
                    <div className="mb-1.5 font-semibold">{emp.name}</div>
                    <div className="text-white/70">{dict.tooltipRole}: <span className="text-white">{emp.role}</span></div>
                    <div className="text-white/70">{dict.tooltipHours}: <span className="text-white">{shift.hours}{dict.hoursShort}</span></div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#7ce0a8]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7ce0a8]" />
                      {dict.tooltipCoverage}
                    </div>
                    <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#1f1e1c]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[40px] items-center justify-center text-[10.5px] font-semibold uppercase tracking-wider text-[#1f1e1c]/30">
                {dict.off}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
