'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadProductImageAction } from './actions'

export function ImageUploadField({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue?: string | null
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const formData = new FormData()
    formData.set('file', file)

    startTransition(async () => {
      const result = await uploadProductImageAction(formData)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setUrl(result.url)
    })
  }

  return (
    <div>
      <label className="text-sm font-medium text-kawa-700">{label}</label>
      <input type="hidden" name={name} value={url} readOnly />

      <div className="mt-1 flex items-center gap-3">
        {url && (
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-kawa-50 border border-kawa-200 shrink-0">
            <Image src={url} alt="" fill className="object-cover" sizes="56px" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="bg-kawa-100 text-kawa-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-kawa-200 transition disabled:opacity-50 w-fit"
          >
            {isPending ? 'Envoi…' : url ? "Changer l'image" : 'Choisir une image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          {!error && url !== (defaultValue ?? '') && (
            <p className="text-xs text-emerald-700">
              Image prête — clique sur &laquo;&nbsp;Enregistrer&nbsp;&raquo; en bas du formulaire
              pour l&apos;appliquer.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
