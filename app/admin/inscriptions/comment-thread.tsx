'use client'

import { useState, useTransition } from 'react'
import { addComment } from './actions'
import { getStaffDisplayName } from '@/lib/is-kawa-staff'

const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

type Comment = { id: string; author_email: string; body: string; created_at: string }

export function CommentThread({ attemptId, comments }: { attemptId: string; comments: Comment[] }) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const value = body
    startTransition(async () => {
      try {
        await addComment(attemptId, value)
        setBody('')
      } catch {
        setError("Le commentaire n'a pas pu être envoyé.")
      }
    })
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-kawa-500 hover:text-sky-700 hover:underline"
      >
        💬 {comments.length > 0 ? `${comments.length} commentaire${comments.length > 1 ? 's' : ''}` : 'Commenter'}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2 pl-3 border-l-2 border-kawa-100">
          {comments.map((comment) => (
            <div key={comment.id} className="text-xs">
              <span className="font-medium text-kawa-700">{getStaffDisplayName(comment.author_email)}</span>{' '}
              <span className="text-kawa-400">{dateTimeFormat.format(new Date(comment.created_at))}</span>
              <p className="text-kawa-600 mt-0.5">{comment.body}</p>
            </div>
          ))}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Ajouter un commentaire…"
              className="flex-1 border border-kawa-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              disabled={isPending || !body.trim()}
              className="text-xs bg-sky-500 text-kawa-950 px-3 py-1.5 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
            >
              Envoyer
            </button>
          </form>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
