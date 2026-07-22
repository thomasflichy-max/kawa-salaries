'use client'

import { useActionState, useState } from 'react'
import { updateOrganizationSampleEmails } from '@/app/admin/actions'

type SampleEmail = { id: string | null; email: string }

export function EditOrganizationSampleEmailsForm({
  organizationId,
  initialEmails,
}: {
  organizationId: string
  initialEmails: SampleEmail[]
}) {
  const boundAction = updateOrganizationSampleEmails.bind(null, organizationId)
  const [state, action, pending] = useActionState(boundAction, undefined)
  const [emails, setEmails] = useState<SampleEmail[]>(
    initialEmails.length > 0 ? initialEmails : [{ id: null, email: '' }]
  )

  function updateEmail(index: number, value: string) {
    setEmails((prev) => prev.map((entry, i) => (i === index ? { ...entry, email: value } : entry)))
  }

  return (
    <form action={action} className="flex flex-col gap-3 p-5">
      {emails.map((entry, index) => (
        <div key={entry.id ?? `new-${index}`} className="flex gap-3 items-start">
          <input type="hidden" name="email_id" value={entry.id ?? ''} />
          <input
            type="email"
            name="email_value"
            value={entry.email}
            onChange={(e) => updateEmail(index, e.target.value)}
            placeholder="jean.dupont@colbertgroupe.com"
            className="flex-1 border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          {emails.length > 1 && (
            <button
              type="button"
              onClick={() => setEmails((prev) => prev.filter((_, i) => i !== index))}
              className="text-sm text-red-600 hover:underline px-2 py-2"
            >
              Retirer
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setEmails((prev) => [...prev, { id: null, email: '' }])}
        className="text-sm text-sky-700 hover:underline w-fit"
      >
        + Ajouter un mail type
      </button>

      <div className="flex items-center justify-end mt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {pending ? 'Enregistrement…' : 'Mettre à jour'}
        </button>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Mails types mis à jour.
        </p>
      )}
    </form>
  )
}
