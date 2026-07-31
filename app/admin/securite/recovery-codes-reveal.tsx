export function RecoveryCodesReveal({
  codes,
  onDismiss,
}: {
  codes: string[]
  onDismiss: () => void
}) {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
        Vérification en deux étapes activée.
      </p>
      <p className="text-sm text-kawa-700 font-medium">
        Notez ces codes de récupération dans un endroit sûr — chacun ne fonctionne qu&apos;une
        fois, et ils ne seront plus jamais affichés. Ils vous permettent d&apos;accéder à
        l&apos;admin si vous perdez ce moyen de vérification.
      </p>
      <ul className="grid grid-cols-2 gap-2 font-mono text-sm bg-kawa-50 rounded-lg p-4">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onDismiss}
        className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition w-fit"
      >
        J&apos;ai noté ces codes
      </button>
    </div>
  )
}
