'use client'

import { useState, useTransition } from 'react'
import { enrollMfa, verifyMfaEnrollment, unenrollMfa } from './actions'
import { RecoveryCodesReveal } from './recovery-codes-reveal'

type EnrollState = { factorId: string; qrCode: string; secret: string } | null

export function MfaSettings({
  hasVerifiedFactor,
  factorId,
}: {
  hasVerifiedFactor: boolean
  factorId: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [enrollment, setEnrollment] = useState<EnrollState>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

  function handleStartEnroll() {
    setError(null)
    startTransition(async () => {
      const result = await enrollMfa()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEnrollment({ factorId: result.factorId, qrCode: result.qrCode, secret: result.secret })
    })
  }

  function handleVerify() {
    if (!enrollment) return
    setError(null)
    startTransition(async () => {
      const result = await verifyMfaEnrollment(enrollment.factorId, code)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEnrollment(null)
      setCode('')
      if (result.recoveryCodes.length > 0) {
        setRecoveryCodes(result.recoveryCodes)
      }
    })
  }

  function handleUnenroll() {
    if (!factorId) return
    if (!confirm('Désactiver la vérification en deux étapes sur ce compte ?')) return
    setError(null)
    startTransition(async () => {
      const result = await unenrollMfa(factorId)
      if (!result.ok) {
        setError(result.error)
      }
    })
  }

  if (recoveryCodes) {
    return <RecoveryCodesReveal codes={recoveryCodes} onDismiss={() => setRecoveryCodes(null)} />
  }

  if (hasVerifiedFactor) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 inline-block w-fit">
          Vérification en deux étapes activée sur ce compte.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleUnenroll}
          disabled={isPending}
          className="text-sm text-red-600 hover:underline disabled:opacity-50 w-fit"
        >
          Désactiver
        </button>
      </div>
    )
  }

  if (enrollment) {
    return (
      <div className="flex flex-col gap-4 max-w-sm">
        <p className="text-sm text-kawa-600">
          Scannez ce QR code avec votre application d&apos;authentification (Google Authenticator,
          Authy...), puis saisissez le code généré ci-dessous.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;utf-8,${encodeURIComponent(enrollment.qrCode)}`}
          alt="QR code de vérification en deux étapes"
          width={180}
          height={180}
          className="border border-kawa-200 rounded-lg"
        />
        <p className="text-xs text-kawa-400">
          Impossible de scanner ? Saisissez ce code manuellement :{' '}
          <span className="font-mono">{enrollment.secret}</span>
        </p>
        <div>
          <label className="text-sm font-medium text-kawa-700">Code de vérification</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleVerify}
            disabled={isPending || code.length !== 6}
            className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
          >
            {isPending ? 'Vérification…' : 'Activer'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEnrollment(null)
              setCode('')
              setError(null)
            }}
            className="text-sm text-kawa-500 hover:underline"
          >
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-kawa-600">
        La vérification en deux étapes n&apos;est pas activée sur ce compte. Une fois activée,
        un code à 6 chiffres vous sera demandé à chaque connexion, en plus de votre mot de passe.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleStartEnroll}
        disabled={isPending}
        className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50 w-fit"
      >
        {isPending ? 'Chargement…' : 'Activer la vérification en deux étapes'}
      </button>
    </div>
  )
}
