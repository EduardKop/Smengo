import { type CSSProperties } from 'react'

import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'

type ShiftTone = 'day' | 'night' | 'off'

export type ScheduleMarqueeShift = {
  name: string
  role: string
  time: string
  tone: ShiftTone
}

export type ScheduleMarqueeAlert = {
  name: string
  role: string
  status: string
}

type ScheduleMarqueeItem =
  | { type: 'shift'; shift: ScheduleMarqueeShift }
  | { type: 'alert'; alert: ScheduleMarqueeAlert }

const COLUMN_MOTION = [
  { reverse: false, className: '[--duration:31s] translate-y-0' },
  { reverse: true, className: '[--duration:43s] -translate-y-16' },
  { reverse: false, className: '[--duration:37s] translate-y-9' },
  { reverse: true, className: '[--duration:49s] -translate-y-28' },
]

const TONES: Record<
  ShiftTone,
  {
    accent: string
  }
> = {
  day: {
    accent: '#2f9e6f',
  },
  night: {
    accent: '#3b6fd4',
  },
  off: {
    accent: '#d4604a',
  },
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #d8d45d 0%, #35e07f 72%, #22d3a6 100%)',
  'linear-gradient(135deg, #5b4dff 0%, #7c3aed 45%, #d41468 100%)',
  'linear-gradient(135deg, #dbeafe 0%, #d8b4fe 45%, #fb7185 100%)',
  'linear-gradient(135deg, #fef3c7 0%, #86efac 50%, #2dd4bf 100%)',
  'linear-gradient(135deg, #60a5fa 0%, #4f46e5 52%, #a855f7 100%)',
  'linear-gradient(135deg, #c084fc 0%, #f472b6 56%, #fb7185 100%)',
  'linear-gradient(135deg, #fde68a 0%, #fb923c 50%, #ef4444 100%)',
  'linear-gradient(135deg, #a7f3d0 0%, #38bdf8 50%, #6366f1 100%)',
  'linear-gradient(135deg, #f0abfc 0%, #818cf8 50%, #22d3ee 100%)',
  'linear-gradient(135deg, #bef264 0%, #34d399 48%, #14b8a6 100%)',
  'linear-gradient(135deg, #fda4af 0%, #fb7185 45%, #7c3aed 100%)',
  'linear-gradient(135deg, #93c5fd 0%, #2563eb 50%, #7c3aed 100%)',
  'linear-gradient(135deg, #fb7185 0%, #ec4899 48%, #8b5cf6 100%)',
  'linear-gradient(135deg, #5eead4 0%, #22d3ee 46%, #3b82f6 100%)',
  'linear-gradient(135deg, #fde047 0%, #84cc16 48%, #10b981 100%)',
  'linear-gradient(135deg, #fed7aa 0%, #fb7185 50%, #c084fc 100%)',
  'linear-gradient(135deg, #c7d2fe 0%, #60a5fa 46%, #2dd4bf 100%)',
  'linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #6366f1 100%)',
  'linear-gradient(135deg, #bbf7d0 0%, #4ade80 44%, #06b6d4 100%)',
  'linear-gradient(135deg, #fef08a 0%, #f97316 50%, #db2777 100%)',
  'linear-gradient(135deg, #bae6fd 0%, #818cf8 50%, #e879f9 100%)',
  'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 42%, #f472b6 100%)',
  'linear-gradient(135deg, #99f6e4 0%, #34d399 46%, #a3e635 100%)',
  'linear-gradient(135deg, #fecaca 0%, #fb923c 45%, #facc15 100%)',
  'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 42%, #8b5cf6 100%)',
  'linear-gradient(135deg, #dcfce7 0%, #86efac 42%, #fb7185 100%)',
  'linear-gradient(135deg, #fae8ff 0%, #d946ef 45%, #0ea5e9 100%)',
  'linear-gradient(135deg, #cffafe 0%, #14b8a6 44%, #6366f1 100%)',
  'linear-gradient(135deg, #ffedd5 0%, #f59e0b 44%, #ef4444 100%)',
  'linear-gradient(135deg, #f5d0fe 0%, #c084fc 46%, #22c55e 100%)',
]

const ROLE_BADGES = [
  { match: ['Официант', 'Waiter', 'Офіціант'], emoji: '🍽️', bg: '#e8f5f1', fg: '#2f9e6f', darkBg: 'rgba(47,158,111,0.18)', darkFg: '#78e0b4' },
  { match: ['Хостес', 'Host'], emoji: '👋', bg: '#eef4ff', fg: '#3b6fd4', darkBg: 'rgba(59,111,212,0.20)', darkFg: '#8eb2ff' },
  { match: ['Бариста', 'Barista'], emoji: '☕', bg: '#fff3df', fg: '#d97757', darkBg: 'rgba(217,119,87,0.20)', darkFg: '#ffa47f' },
  { match: ['Повар', 'Cook', 'Кухар'], emoji: '👨‍🍳', bg: '#e8f5f1', fg: '#2f9e6f', darkBg: 'rgba(47,158,111,0.18)', darkFg: '#78e0b4' },
  { match: ['Су-шеф', 'Sous'], emoji: '🥘', bg: '#f4edff', fg: '#7c5cc4', darkBg: 'rgba(124,92,196,0.22)', darkFg: '#c4a6ff' },
  { match: ['Курьер', 'Courier', "Кур'єр"], emoji: '🚚', bg: '#eef4ff', fg: '#3b6fd4', darkBg: 'rgba(59,111,212,0.20)', darkFg: '#8eb2ff' },
  { match: ['Менеджер', 'Manager'], emoji: '📋', bg: '#fff3df', fg: '#d97757', darkBg: 'rgba(217,119,87,0.20)', darkFg: '#ffa47f' },
  { match: ['Старший', 'Lead', 'Зміни'], emoji: '⭐', bg: '#f4edff', fg: '#7c5cc4', darkBg: 'rgba(124,92,196,0.22)', darkFg: '#c4a6ff' },
  { match: ['Кассир', 'Cashier', 'Касир'], emoji: '💳', bg: '#e8f5f1', fg: '#2f9e6f', darkBg: 'rgba(47,158,111,0.18)', darkFg: '#78e0b4' },
]

function avatarGradient(value: string) {
  const index = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[index]
}

function roleBadge(role: string) {
  return ROLE_BADGES.find((badge) => badge.match.some((part) => role.includes(part))) ?? {
    emoji: '•',
    bg: '#f3f4f6',
    fg: '#6b6860',
    darkBg: 'rgba(255,255,255,0.10)',
    darkFg: '#d6d3cd',
  }
}

function RoleBadge({ role }: { role: string }) {
  const badge = roleBadge(role)

  return (
    <span
      className="mt-1.5 inline-flex w-full min-w-0 items-center justify-center gap-0.5 rounded-full px-1.5 py-0.5 text-[6.8px] font-semibold leading-none [background-color:var(--role-badge-bg)] [color:var(--role-badge-fg)] dark:[background-color:var(--role-badge-dark-bg)] dark:[color:var(--role-badge-dark-fg)] sm:mt-2 sm:gap-1 sm:px-2 sm:py-1 sm:text-[8px] lg:text-[8.5px]"
      style={{
        '--role-badge-bg': badge.bg,
        '--role-badge-fg': badge.fg,
        '--role-badge-dark-bg': badge.darkBg,
        '--role-badge-dark-fg': badge.darkFg,
      } as CSSProperties}
    >
      <span aria-hidden="true">{badge.emoji}</span>
      <span className="truncate">{role}</span>
    </span>
  )
}

function ShiftCard({ shift }: { shift: ScheduleMarqueeShift }) {
  const tone = TONES[shift.tone]
  const [start, end] = shift.time.includes('-') ? shift.time.split('-').map((part) => part.trim()) : [shift.time]
  const isOff = shift.tone === 'off'

  return (
    <figure
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-lg border p-2 backdrop-blur-[1px] transition duration-300 [width:clamp(68px,21vw,108px)] sm:w-[108px] sm:rounded-xl sm:p-2.5 lg:w-[126px] lg:p-3 xl:w-[134px]',
        'border-gray-950/[.1] bg-white/70 shadow-[0_18px_46px_-38px_rgba(31,30,28,0.45)] hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_22px_58px_-40px_rgba(31,30,28,0.54)]',
        'dark:border-gray-50/[.12] dark:bg-gray-50/[.08] dark:shadow-[0_24px_64px_-44px_rgba(0,0,0,0.9)] dark:hover:bg-gray-50/[.14]',
        isOff && 'border-[#d4604a]/35 bg-[#fff1f0]/85 hover:bg-[#ffe4e1] dark:border-[#d4604a]/35 dark:bg-[#d4604a]/12 dark:hover:bg-[#d4604a]/18'
      )}
      style={{
        '--shift-accent': tone.accent,
      } as CSSProperties}
    >
      <div className="relative flex items-start gap-2">
        <span
          aria-hidden="true"
          className="h-5 w-5 shrink-0 rounded-full sm:h-6 sm:w-6 lg:h-7 lg:w-7"
          style={{
            background: avatarGradient(`${shift.name}-${shift.role}-${shift.time}`),
            boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.42)',
          }}
        />
        <div className="min-w-0">
          <figcaption className="text-[9.5px] font-semibold leading-tight text-[#1f1e1c] sm:text-[11px] lg:text-[12.5px] dark:text-white">
            {shift.name}
          </figcaption>
        </div>
      </div>
      <RoleBadge role={shift.role} />

      <div
        className="relative mt-2 rounded-md px-1.5 py-1.5 text-[9.5px] font-semibold leading-tight tracking-normal sm:mt-3 sm:rounded-lg sm:px-2 sm:py-2 sm:text-[11px] lg:mt-3.5 lg:px-2.5 lg:text-[12px]"
        style={{ color: 'var(--shift-accent)' }}
      >
        <span className="block">{end ? `${start} - ${end}` : start}</span>
      </div>
    </figure>
  )
}

function AlertCard({ alert }: { alert: ScheduleMarqueeAlert }) {
  return (
    <figure
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-lg border p-2 backdrop-blur-[1px] transition duration-300 [width:clamp(68px,21vw,108px)] sm:w-[108px] sm:rounded-xl sm:p-2.5 lg:w-[126px] lg:p-3 xl:w-[134px]',
        'border-[#e0a96d]/45 bg-[#fff8eb]/85 text-[#1f1e1c] shadow-[0_18px_48px_-38px_rgba(138,85,21,0.48)] hover:-translate-y-0.5 hover:bg-[#fff3d8]',
        'dark:border-[#e0a96d]/35 dark:bg-[#e0a96d]/12 dark:text-white dark:shadow-[0_24px_64px_-42px_rgba(0,0,0,0.86)] dark:hover:bg-[#e0a96d]/18'
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className="h-5 w-5 shrink-0 rounded-full sm:h-6 sm:w-6 lg:h-7 lg:w-7"
          style={{
            background: avatarGradient(`${alert.name}-${alert.role}-${alert.status}`),
            boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.42)',
          }}
        >
          <span className="sr-only">warning</span>
        </span>
        <div className="min-w-0">
          <figcaption className="text-[9.5px] font-semibold leading-tight sm:text-[11px] lg:text-[12.5px]">
            {alert.name}
          </figcaption>
        </div>
      </div>
      <RoleBadge role={alert.role} />
      <div className="relative mt-2 rounded-md px-1.5 py-1.5 text-[9.5px] font-semibold leading-tight text-[#8a5515] sm:mt-3 sm:rounded-lg sm:px-2 sm:py-2 sm:text-[11px] lg:mt-3.5 lg:px-2.5 lg:text-[12px] dark:text-[#e6b66f]">
        {alert.status}
      </div>
    </figure>
  )
}

function renderItem(item: ScheduleMarqueeItem, index: number) {
  if (item.type === 'alert') {
    return <AlertCard key={`alert-${index}-${item.alert.name}`} alert={item.alert} />
  }

  return (
    <ShiftCard
      key={`${item.shift.name}-${item.shift.time}-${index}`}
      shift={item.shift}
    />
  )
}

export function ScheduleMarqueeCards({
  shifts,
  alert,
}: {
  shifts: ScheduleMarqueeShift[]
  alert?: ScheduleMarqueeAlert
}) {
  const columns = Array.from({ length: 4 }, () => [] as ScheduleMarqueeItem[])

  shifts.forEach((shift, index) => {
    columns[index % columns.length].push({ type: 'shift', shift })
  })

  if (alert) {
    columns[0].splice(1, 0, { type: 'alert', alert })
  }

  const motionColumns = columns.map((column, index) => {
    if (column.length === 0) return column

    const offset = index === 1 ? 1 : index === 2 ? 2 : index === 3 ? column.length - 1 : 0
    return [...column.slice(offset), ...column.slice(0, offset)]
  })

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex h-[360px] w-full max-w-[390px] flex-row items-center justify-center gap-1 overflow-hidden bg-transparent sm:h-[440px] sm:max-w-[500px] sm:gap-2 lg:h-[530px] lg:max-w-[590px] lg:gap-3"
      style={{
        contain: 'layout paint',
      }}
    >
      {motionColumns.map((column, index) => (
        <Marquee
          key={index}
          pauseOnHover
          repeat={6}
          reverse={COLUMN_MOTION[index].reverse}
          vertical
          className={cn(
            'shrink-0 p-0 [--gap:0.45rem] sm:[--gap:0.65rem] lg:[--gap:0.75rem]',
            COLUMN_MOTION[index].className
          )}
        >
          {column.map((item, itemIndex) => renderItem(item, itemIndex))}
        </Marquee>
      ))}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white dark:from-background" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white dark:from-background" />
    </div>
  )
}
