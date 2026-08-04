// Simple original line-art icons (not traced from any stock icon set) to
// match the app's sky-blue accent color, used by the machine-type step of
// the "Choisir son café" guide.

type IconProps = { className?: string }

export function FiltreIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M14 14h20l-4.5 14h-11L14 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17.5 18.5h13M19 22.5h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 32h15l2 6h-19l2-6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function GrainsIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 9c9.5 0 15 6.7 15 14.5S33.5 39 24 39 9 30.8 9 23.5 14.5 9 24 9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M24 10.5c-3.3 4.3-3.3 8.7 0 13s3.3 8.7 0 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function MokaIcon({ className = 'w-8 h-8' }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M19 20l1.5-7h7L29 20Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 29l2.5-9h9L31 29Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13.5 39h21l-3.5-10h-14l-3.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12.5 23.5l-3-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 30c3 0 4.5 1.8 4.5 4s-1.5 4-4.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
