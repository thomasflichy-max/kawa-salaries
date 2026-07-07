export function DemoBadge({ text }: { text: string }) {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
      <span aria-hidden>●</span>
      {text}
    </p>
  )
}
