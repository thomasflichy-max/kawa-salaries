// Small hover tooltip, pure CSS (group-hover), no library — same
// hand-rolled convention as every other overlay in this codebase. Shown
// below the trigger by default: originally built for the commandes list's
// action buttons, which live inside a table cell wrapped in an
// overflow-x-auto container — an absolutely-positioned tooltip above the
// very first row would risk spilling past that container's top edge and
// getting clipped (the same "overflow-x-auto silently clips the y-axis
// too" quirk fixed earlier in app/compte/nav.tsx). Shared across admin
// sub-pages (commandes, inscriptions) rather than duplicated.
export function Tooltip({
  label,
  children,
  align = 'center',
}: {
  label: string
  children: React.ReactNode
  // 'right' anchors the tooltip's right edge to the trigger instead of
  // centering it — needed for triggers sitting at the right edge of a
  // horizontally-scrollable container, where a centered tooltip would
  // extend past it and get clipped on that side.
  align?: 'center' | 'right'
}) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-md bg-kawa-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 z-20 ${
          align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
        }`}
      >
        {label}
      </span>
    </span>
  )
}
