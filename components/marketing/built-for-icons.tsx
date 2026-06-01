// Industry icons for Smengo "Built for" menu and pages.
// Style: clean line set — currentColor base with one small sand-accent detail per icon.
// All icons share identical stroke width and corner radius for visual consistency.

import type { SVGProps } from 'react'

const SAND = '#e0a96d'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number
  label?: string
  children: React.ReactNode
}

function Icon({ size = 32, label, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
      style={{ display: 'block' }}
      {...rest}
    >
      {children}
    </svg>
  )
}

type P = { size?: number }

// ─── Shift-based businesses ───

export const RestaurantIcon = (p: P) => (
  <Icon {...p} label="restaurants">
    {/* cup body */}
    <path d="M7 13h14v3a7 7 0 0 1-7 7 7 7 0 0 1-7-7z" />
    {/* sand handle */}
    <path d="M21 15h2.5a2.5 2.5 0 0 1 0 5H21" stroke={SAND} />
    {/* steam */}
    <path d="M11 6c.5 1-.5 1.5 0 2.5M16 6c.5 1-.5 1.5 0 2.5" />
  </Icon>
)

export const RetailIcon = (p: P) => (
  <Icon {...p} label="retail">
    {/* bag body */}
    <path d="M8 12h16l-1.2 12.2a2 2 0 0 1-2 1.8H11.2a2 2 0 0 1-2-1.8z" />
    {/* sand handle */}
    <path d="M12 12V9.5a4 4 0 0 1 8 0V12" stroke={SAND} />
  </Icon>
)

export const ServicesIcon = (p: P) => (
  <Icon {...p} label="services">
    {/* scissors rings */}
    <circle cx={9} cy={10} r={3} />
    <circle cx={9} cy={22} r={3} />
    {/* sand blades */}
    <path d="M12 11.5 24 22M12 20.5 24 10" stroke={SAND} />
  </Icon>
)

export const ClinicIcon = (p: P) => (
  <Icon {...p} label="clinics">
    {/* stethoscope tube */}
    <path d="M7 6v6a5 5 0 0 0 10 0V6M7 6h2M15 6h2" />
    {/* sand drop / bell */}
    <path d="M12 17v3a5 5 0 0 0 10 0v-1.5" stroke={SAND} />
    <circle cx={24} cy={17} r={2.5} stroke={SAND} />
  </Icon>
)

export const LogisticsIcon = (p: P) => (
  <Icon {...p} label="logistics">
    {/* truck cab + box */}
    <path d="M4 10h12v11H4z" />
    <path d="M16 14h5.5l3.5 3.5V21H16" stroke={SAND} />
    {/* wheels */}
    <circle cx={9} cy={23.5} r={2} />
    <circle cx={21} cy={23.5} r={2} />
  </Icon>
)

export const ProductionIcon = (p: P) => (
  <Icon {...p} label="production">
    {/* shield */}
    <path d="M16 5l10 3.5v5.5c0 6.5-4.5 10.5-10 13-5.5-2.5-10-6.5-10-13V8.5z" />
    {/* sand checkmark */}
    <path d="m11 16 3.2 3.2L21 12.5" stroke={SAND} />
  </Icon>
)

// ─── Scheduled teams ───

export const SalesIcon = (p: P) => (
  <Icon {...p} label="sales">
    {/* bars */}
    <path d="M5 24h22M5 24v-9M11 24v-6M17 24v-10" />
    {/* sand arrow up */}
    <path d="M23 13V9M21 11l2-2 2 2" stroke={SAND} />
  </Icon>
)

export const ITIcon = (p: P) => (
  <Icon {...p} label="it">
    {/* monitor */}
    <rect x={4} y={6} width={24} height={16} rx={2} />
    <path d="M11 27h10M16 22v5" />
    {/* sand code brackets */}
    <path d="m12 11-3 3 3 3M20 11l3 3-3 3" stroke={SAND} />
  </Icon>
)

export const ArbitrageIcon = (p: P) => (
  <Icon {...p} label="arbitrage">
    {/* target rings */}
    <circle cx={16} cy={16} r={10} />
    <circle cx={16} cy={16} r={5} />
    {/* sand center dot */}
    <circle cx={16} cy={16} r={1.6} fill={SAND} stroke="none" />
  </Icon>
)

// ─── Industry registry (used by header dropdown and pages) ───

export type IndustrySlug =
  | 'restaurants' | 'retail' | 'services' | 'clinics'
  | 'logistics' | 'production'
  | 'sales' | 'it' | 'arbitrage'

export const INDUSTRY_GROUPS: Array<{
  groupKey: 'shiftBusiness' | 'scheduledTeams'
  items: Array<{ slug: IndustrySlug; Icon: (p: P) => React.ReactElement }>
}> = [
  {
    groupKey: 'shiftBusiness',
    items: [
      { slug: 'restaurants', Icon: RestaurantIcon },
      { slug: 'retail',      Icon: RetailIcon },
      { slug: 'services',    Icon: ServicesIcon },
      { slug: 'clinics',     Icon: ClinicIcon },
      { slug: 'logistics',   Icon: LogisticsIcon },
      { slug: 'production',  Icon: ProductionIcon },
    ],
  },
  {
    groupKey: 'scheduledTeams',
    items: [
      { slug: 'sales',     Icon: SalesIcon },
      { slug: 'it',        Icon: ITIcon },
      { slug: 'arbitrage', Icon: ArbitrageIcon },
    ],
  },
]
