'use client'

import {
  Calendar, Send, Sparkles,
  FolderClosed, GraduationCap,
  LayoutDashboard, Users,
  ArrowLeftRight, Heart, Zap,
  type LucideIcon,
} from 'lucide-react'

// Platform mega-menu data: ordered groups + items.
// Order: График → Хранилище → HR → Мотивация (Plan → Store → Hire → Engage).

export type PlatformGroupKey = 'schedule' | 'storage' | 'hr' | 'motivation'

export interface PlatformItem {
  key: string
  href: string
  Icon: LucideIcon
}

export interface PlatformGroup {
  key: PlatformGroupKey
  /** CSS var name for the pill background (and item hover wash) */
  bgVar: string
  /** CSS var name for the pill text / icon / bullet color */
  fgVar: string
  items: PlatformItem[]
}

export const PLATFORM_GROUPS: PlatformGroup[] = [
  {
    key: 'schedule',
    bgVar: '--chip-v-bg',
    fgVar: '--chip-v-fg',
    items: [
      { key: 'scheduleGrid', href: '/platform/schedule-grid', Icon: Calendar },
      { key: 'telegramBot',  href: '/platform/telegram-bot',  Icon: Send },
      { key: 'aiAssistant',  href: '/platform/ai-assistant',  Icon: Sparkles },
    ],
  },
  {
    key: 'storage',
    bgVar: '--chip-s-bg',
    fgVar: '--chip-s-fg',
    items: [
      { key: 'employeeDatabase', href: '/platform/employee-database', Icon: FolderClosed },
      { key: 'onboarding',       href: '/platform/onboarding',        Icon: GraduationCap },
    ],
  },
  {
    key: 'hr',
    bgVar: '--chip-w-bg',
    fgVar: '--chip-w-fg',
    items: [
      { key: 'hrDashboard',  href: '/platform/hr-dashboard',  Icon: LayoutDashboard },
      { key: 'hrManagement', href: '/platform/hr-management', Icon: Users },
    ],
  },
  {
    key: 'motivation',
    bgVar: '--chip-l-bg',
    fgVar: '--chip-l-fg',
    items: [
      { key: 'shiftSwaps',     href: '/platform/shift-swaps',     Icon: ArrowLeftRight },
      { key: 'teamMotivation', href: '/platform/team-motivation', Icon: Heart },
      { key: 'fastUi',         href: '/platform/fast-ui',         Icon: Zap },
    ],
  },
]
