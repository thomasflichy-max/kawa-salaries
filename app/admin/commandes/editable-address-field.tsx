'use client'

import { useState, useTransition } from 'react'

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export function EditableAddressField({
  label,
  value,
  editable,
  onSave,
}: {
  label: string
  value: string
  editable: boolean
  onSave: (value: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await onSave(draft)
      setEditing(false)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-kawa-800">{label}</h3>
        {editable && !editing && (
          <button
            onClick={() => {
              setDraft(value)
              setEditing(true)
            }}
            aria-label={`Modifier l'adresse de ${label.toLowerCase()}`}
            className="text-kawa-400 hover:text-sky-700 transition"
          >
            <PencilIcon />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2 mt-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-sky-500 text-kawa-950 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50"
            >
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={isPending}
              className="text-kawa-500 text-sm hover:underline"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-kawa-600 mt-2 whitespace-pre-line">{value}</p>
      )}
    </div>
  )
}
