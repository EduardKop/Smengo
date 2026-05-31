// Hand-drawn industry icons for Smengo "Built for" menu and pages.
// Style: living "marker" line — currentColor (adapts to light/dark) with sand accent (#e0a96d).

import type { SVGProps } from 'react'

const SAND = '#e0a96d'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number
  label?: string
  children: React.ReactNode
}

function Icon({ size = 36, label, children, ...rest }: IconProps) {
  const fid = 'rough-' + (label || 'icon').replace(/\s+/g, '-').toLowerCase()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
      style={{ display: 'block' }}
      {...rest}
    >
      <defs>
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`}>{children}</g>
    </svg>
  )
}

type P = { size?: number }

export const RestaurantIcon = (p: P) => (
  <Icon {...p} label="restaurants">
    <path d="M6 13c0-.4.3-.7.7-.7h14.6c.4 0 .7.3.7.7v2.6A7 7 0 0 1 15.3 23h-1.6A7 7 0 0 1 6.7 16z" />
    <path d="M22 14.2h2.3a2.6 2.6 0 0 1 .1 5.1H22" stroke={SAND} />
    <path d="M10.2 5.2c.2 1.5-1 2-.9 3.6M14 4.2c.2 1.5-1 2-.9 3.6M17.8 5.2c.2 1.5-1 2-.9 3.6" stroke={SAND} />
  </Icon>
)

export const RetailIcon = (p: P) => (
  <Icon {...p} label="retail">
    <path d="M8 11.2h16l-1.4 13.9a2 2 0 0 1-2 1.8H11.4a2 2 0 0 1-2-1.8z" />
    <path d="M12 11.2V9a4 4 0 0 1 8 0v2.2" stroke={SAND} />
  </Icon>
)

export const ServicesIcon = (p: P) => (
  <Icon {...p} label="services">
    <circle cx={9} cy={9} r={3.1} />
    <circle cx={9} cy={23} r={3.1} />
    <path d="M11.3 11.1 24.2 24M11.3 20.9 24.2 8" stroke={SAND} />
  </Icon>
)

export const ClinicIcon = (p: P) => (
  <Icon {...p} label="clinics">
    <path d="M5 6.2v5.8a6 6 0 0 0 12 0V6.2M5 6.2h2M15 6.2h2" />
    <path d="M11 18.1v2.9a5 5 0 0 0 10 0v-1.8" stroke={SAND} />
    <circle cx={24} cy={17.2} r={2.5} stroke={SAND} />
  </Icon>
)

export const LogisticsIcon = (p: P) => (
  <Icon {...p} label="logistics">
    <path d="M3 9.2h13v11.6H3z" />
    <path d="M16 13.2h5.8l4.2 4.1v3.5H16z" stroke={SAND} />
    <circle cx={9} cy={23.2} r={2.3} />
    <circle cx={21} cy={23.2} r={2.3} />
  </Icon>
)

export const ProductionIcon = (p: P) => (
  <Icon {...p} label="production">
    <path d="M16 4.2 27 8.1v6c0 7-5 11.1-11 13.9C10 25.2 5 21.1 5 14.1v-6z" />
    <path d="m11 15.1 3.5 3.5L21 12.1" stroke={SAND} />
  </Icon>
)

export const SalesIcon = (p: P) => (
  <Icon {...p} label="sales">
    <path d="M4 24.1h24M4 24.1V12.2M11 24.1v-7M18 24.1v-11.1" />
    <path d="M25 8.1v16M21 12.1l4-4 4 4" stroke={SAND} />
  </Icon>
)

export const ITIcon = (p: P) => (
  <Icon {...p} label="it">
    <rect x={4} y={6.1} width={24} height={16} rx={2} />
    <path d="M11 27.1h10M16 22.1v5" />
    <path d="m12 11.1-3 3 3 3M20 11.1l3 3-3 3" stroke={SAND} />
  </Icon>
)

export const ArbitrageIcon = (p: P) => (
  <Icon {...p} label="arbitrage">
    <circle cx={16} cy={16} r={11} />
    <circle cx={16} cy={16} r={5} />
    <path d="M16 4.1v3M16 25.1v3M4 16h3M25 16h3" stroke={SAND} />
    <circle cx={16} cy={16} r={1.5} fill={SAND} stroke="none" />
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
