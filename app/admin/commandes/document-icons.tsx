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

export function InvoiceIcon() {
  return (
    <svg {...iconProps}>
      <path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21Z" />
      <path d="M9.5 8h5M9.5 12h5M9.5 16h3" />
    </svg>
  )
}

export function DeliveryNoteIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  )
}
