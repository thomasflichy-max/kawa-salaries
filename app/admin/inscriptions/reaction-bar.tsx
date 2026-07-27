'use client'

import { useState, useTransition } from 'react'
import { toggleReaction } from './actions'
import { Tooltip } from '@/app/admin/tooltip'
import { getStaffDisplayName } from '@/lib/is-kawa-staff'

const QUICK_EMOJIS = [
  '👍',
  '👎',
  '✅',
  '❌',
  '🎉',
  '👀',
  '❤️',
  '😂',
  '😮',
  '🤔',
  '🔥',
  '🙏',
  '💪',
  '🚀',
  '⚠️',
  '🤝',
]

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

  const counts = new Map<string, { count: number; mine: boolean; staffEmails: string[] }>()
  for (const r of reactions) {
    const entry = counts.get(r.emoji) ?? { count: 0, mine: false, staffEmails: [] }
    entry.count += 1
    entry.staffEmails.push(r.staff_email)
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
      {[...counts.entries()].map(([emoji, { count, mine, staffEmails }]) => (
        <Tooltip key={emoji} label={staffEmails.map((e) => getStaffDisplayName(e)).join(', ')}>
          <button
            type="button"
            onClick={() => handleToggle(emoji)}
            disabled={isPending}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs leading-none border transition disabled:opacity-50 ${
              mine
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-white border-kawa-200 text-kawa-600 hover:bg-kawa-50'
            }`}
          >
            <span className="leading-none">{emoji}</span>
            <span>{count}</span>
          </button>
        </Tooltip>
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
            <div className="absolute right-0 top-full mt-1 bg-white border border-kawa-200 rounded-lg shadow-lg p-1.5 grid grid-cols-4 gap-0.5 z-20 w-[9.5rem]">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleToggle(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-kawa-50 text-lg leading-none overflow-hidden"
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
