'use client'

import { useState } from 'react'

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="#41b6e6"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.25" fill="#41b6e6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="#41b6e6"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.25" fill="#41b6e6" />
      <path d="M3 3l18 18" stroke="#41b6e6" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

// Drop-in replacement for a plain `<input type="password">` — same styling
// (mt-1/border/focus ring) as every password field in the app, plus a
// show/hide toggle so users can check what they're typing. Works both as an
// uncontrolled form field (name=...) and a controlled one (value/onChange),
// since it just forwards whatever input props it's given.
export function PasswordInput({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative mt-1">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full border border-kawa-200 rounded-lg pl-4 pr-10 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}
