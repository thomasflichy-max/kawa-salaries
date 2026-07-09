import type { DemoOrderStatus } from '@/app/admin/demo-data'

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function WrenchIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z" />
    </svg>
  )
}

function PackageIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg {...iconProps}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

// Icon shown for a status in the order list's single sequential action
// button — one entry per DemoOrderStatus, so every status (including the
// two terminal ones, where the button is just disabled) has one.
export const ORDER_STATUS_ACTION_ICONS: Record<DemoOrderStatus, React.ReactNode> = {
  en_cours: <WrenchIcon />,
  en_preparation: <PackageIcon />,
  pret: <TruckIcon />,
  livree: <CheckIcon />,
  annulee: <XIcon />,
}
