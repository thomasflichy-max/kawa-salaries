// Small hover tooltip, pure CSS (group-hover), no library — same
// hand-rolled convention as every other overlay in this codebase. Shown
// below the trigger, not above: these buttons live inside table cells
// wrapped in an overflow-x-auto container (app/admin/commandes/page.tsx),
// and an absolutely-positioned tooltip above the very first row would risk
// spilling past that container's top edge and getting clipped (the same
// "overflow-x-auto silently clips the y-axis too" quirk fixed earlier in
// app/compte/nav.tsx).
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-md bg-kawa-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 z-20"
      >
        {label}
      </span>
    </span>
  )
}
