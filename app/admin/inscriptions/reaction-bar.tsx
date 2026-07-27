'use client'

import { useState, useTransition } from 'react'
import { toggleReaction } from './actions'

const QUICK_EMOJIS = ['👍', '✅', '🎉', '👀', '❤️', '😂']

export function ReactionBar({
  attemptId,
  reactions,
  currentUserEmail,
}: {
  attemptId: string
  reactions: { emoji: string; staff_email: string }[]
  currentUserEmail: string
}) {
  const [isPending, startTransition] = useTransition()
  const [pickerOpen, setPickerOpen] = useState(false)

  const counts = new Map<string, { count: number; mine: boolean }>()
  for (const r of reactions) {
    const entry = counts.get(r.emoji) ?? { count: 0, mine: false }
    entry.count += 1
    if (r.staff_email === currentUserEmail) entry.mine = true
    counts.set(r.emoji, entry)
  }

  function handleToggle(emoji: string) {
    setPickerOpen(false)
    startTransition(async () => {
      await toggleReaction(attemptId, emoji)
    })
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-2">
      {[...counts.entries()].map(([emoji, { count, mine }]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleToggle(emoji)}
          disabled={isPending}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition disabled:opacity-50 ${
            mine
              ? 'bg-sky-50 border-sky-300 text-sky-700'
              : 'bg-white border-kawa-200 text-kawa-600 hover:bg-kawa-50'
          }`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          disabled={isPending}
          aria-label="Ajouter une réaction"
          className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-kawa-200 text-kawa-400 hover:bg-kawa-50 hover:text-kawa-600 transition text-sm disabled:opacity-50"
        >
          +
        </button>
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
            <div className="absolute left-0 top-full mt-1 bg-white border border-kawa-200 rounded-lg shadow-lg p-1.5 flex gap-1 z-20">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleToggle(emoji)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-kawa-50 text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
