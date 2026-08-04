// Original line-art icons (not traced from any stock icon set), all drawn
// on the same 48x48 grid with the same stroke weight so they read as one
// consistent set — used by the machine-type step of the "Choisir son café"
// guide.

type IconProps = { className?: string }

const STROKE = { stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function FrenchPressIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="17" width="16" height="21" rx="2" {...STROKE} />
      <path d="M20 25h8" {...STROKE} />
      <path d="M24 10v7" {...STROKE} />
      <path d="M19.5 10h9" {...STROKE} />
      <path d="M32 21c3.2 0 4.8 1.8 4.8 4.5S35.2 30 32 30" {...STROKE} />
    </svg>
  )
}

export function DripMachineIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M18 10h10l2 5H16l2-5Z" {...STROKE} />
      <rect x="13" y="15" width="22" height="9" rx="1.5" {...STROKE} />
      <circle cx="30.5" cy="19.5" r="1" fill="currentColor" stroke="none" />
      <path d="M17 24l2 12h9l2-12" {...STROKE} />
      <path d="M30 28c2.4 0 3.5 1.4 3.5 3s-1.1 3-3.5 3" {...STROKE} />
    </svg>
  )
}

export function MokaIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="9" r="2" {...STROKE} />
      <path d="M19 20l1.5-7h7L29 20Z" {...STROKE} />
      <path d="M17 29l2.5-9h9L31 29Z" {...STROKE} />
      <path d="M13.5 39h21l-3.5-10h-14l-3.5 10Z" {...STROKE} />
      <path d="M12.5 23.5l-3-1.5" {...STROKE} />
      <path d="M32 30c3 0 4.5 1.8 4.5 4s-1.5 4-4.5 4" {...STROKE} />
    </svg>
  )
}

export function EspressoMachineIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="11" y="11" width="26" height="17" rx="2" {...STROKE} />
      <circle cx="30" cy="19.5" r="3.2" {...STROKE} />
      <path d="M34.5 15.5l3-3" {...STROKE} />
      <path d="M17 28l-2 5h9l-1-5Z" {...STROKE} />
      <rect x="13" y="33" width="22" height="4" rx="1" {...STROKE} />
    </svg>
  )
}

export function AutoMachineIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M19 9h10l2.5 6h-15L19 9Z" {...STROKE} />
      <rect x="13" y="15" width="22" height="19" rx="2" {...STROKE} />
      <circle cx="30" cy="20.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="30" cy="24.5" r="1" fill="currentColor" stroke="none" />
      <path d="M21 34v4" {...STROKE} />
      <path d="M16.5 38h11l1 4h-13l1-4Z" {...STROKE} />
    </svg>
  )
}
