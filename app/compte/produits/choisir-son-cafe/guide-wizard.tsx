'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FrenchPressIcon,
  DripMachineIcon,
  MokaIcon,
  EspressoMachineIcon,
  AutoMachineIcon,
} from './machine-icons'

type Coffee = { id: string; name: string; description: string | null }
type GrindValue = 'grain' | 'filtre' | 'espresso'

const MACHINES = [
  {
    key: 'piston',
    label: 'Cafetière à piston',
    Icon: FrenchPressIcon,
    grind: 'filtre' as GrindValue,
    grindLabel: 'Moulu filtre',
  },
  {
    key: 'filtre',
    label: 'Cafetière filtre électrique',
    Icon: DripMachineIcon,
    grind: 'filtre' as GrindValue,
    grindLabel: 'Moulu filtre',
  },
  {
    key: 'moka',
    label: 'Cafetière moka',
    Icon: MokaIcon,
    grind: 'espresso' as GrindValue,
    grindLabel: 'Moulu espresso',
  },
  {
    key: 'espresso',
    label: 'Machine expresso',
    Icon: EspressoMachineIcon,
    grind: 'espresso' as GrindValue,
    grindLabel: 'Moulu espresso',
  },
  {
    key: 'grains',
    label: 'Machine à grains automatique',
    Icon: AutoMachineIcon,
    grind: 'grain' as GrindValue,
    grindLabel: 'En grains',
  },
] as const

type Machine = (typeof MACHINES)[number]

// Propositions come straight from what's actually written in the active
// cafés' descriptions — a keyword only shows up as a button if at least one
// café currently mentions it, so this stays accurate as the catalog changes
// without needing a dedicated "flavor" field on products.
const FLAVOR_KEYWORDS = [
  'fruité',
  'floral',
  'chocolat',
  'corsé',
  'doux',
  'sucré',
  'épicé',
  'citron',
  'acidulé',
  'rond',
  'intense',
  'noisette',
  'caramel',
  'agrumes',
  'boisé',
  'torréfié',
  'vanillé',
  'miel',
]

function StepDot({ n, step }: { n: number; step: number }) {
  return (
    <span
      className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold shrink-0 ${
        step > n
          ? 'bg-emerald-500 text-white'
          : step === n
            ? 'bg-sky-500 text-kawa-950'
            : 'bg-kawa-100 text-kawa-400'
      }`}
    >
      {step > n ? '✓' : n}
    </span>
  )
}

export function GuideWizard({ coffees }: { coffees: Coffee[] }) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [machine, setMachine] = useState<Machine | null>(null)
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null)
  const [matches, setMatches] = useState<Coffee[] | null>(null)

  const availableFlavors = useMemo(
    () =>
      FLAVOR_KEYWORDS.filter((keyword) =>
        coffees.some((c) => c.description?.toLowerCase().includes(keyword))
      ),
    [coffees]
  )

  function handlePickMachine(m: Machine) {
    setMachine(m)
    setStep(2)
  }

  function handlePickFlavor(keyword: string) {
    if (!machine) return
    setSelectedFlavor(keyword)
    const found = coffees.filter((c) => c.description?.toLowerCase().includes(keyword))
    if (found.length === 1) {
      router.push(`/compte/produits/produit/${found[0].id}?mouture=${machine.grind}`)
      return
    }
    setMatches(found)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <StepDot n={n} step={step} />
            {n < 3 && (
              <div className={`h-px flex-1 mx-2 ${step > n ? 'bg-emerald-500' : 'bg-kawa-100'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="bg-white rounded-2xl border border-kawa-200 p-6">
          <h2 className="font-semibold text-kawa-800 mb-1">Quelle est votre machine ?</h2>
          <p className="text-sm text-kawa-500 mb-5">La mouture adaptée en dépend directement.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MACHINES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => handlePickMachine(m)}
                className="flex flex-col items-center gap-3 rounded-xl border border-kawa-200 hover:border-sky-400 hover:bg-sky-50 transition p-5"
              >
                <span className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <m.Icon className="w-8 h-8" />
                </span>
                <span className="font-medium text-kawa-800 text-sm">{m.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && machine && (
        <section className="bg-white rounded-2xl border border-kawa-200 p-6">
          <h2 className="font-semibold text-kawa-800 mb-1">Mouture recommandée</h2>
          <p className="text-sm text-kawa-500 mb-5">
            Pour une {machine.label.toLowerCase()}, il vous faut du café :
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 mb-5 w-fit">
            <span className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
              <machine.Icon className="w-6 h-6" />
            </span>
            <span className="font-semibold text-sky-700">{machine.grindLabel}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition"
            >
              Continuer
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-kawa-500 hover:underline"
            >
              Changer de machine
            </button>
          </div>
        </section>
      )}

      {step === 3 && machine && (
        <section className="bg-white rounded-2xl border border-kawa-200 p-6">
          <h2 className="font-semibold text-kawa-800 mb-1">Quel goût recherchez-vous ?</h2>
          <p className="text-sm text-kawa-500 mb-5">
            Choisissez une saveur, on vous propose le café qui correspond.
          </p>

          {availableFlavors.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-5">
              {availableFlavors.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  onClick={() => handlePickFlavor(flavor)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition capitalize ${
                    selectedFlavor === flavor
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-kawa-200 text-kawa-600 hover:border-sky-300 hover:bg-sky-50'
                  }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-kawa-400 mb-5">
              Aucune description de café ne permet de proposer une saveur pour le moment.
            </p>
          )}

          {matches && (
            <div className="flex flex-col gap-2 mb-5">
              {matches.length === 0 && (
                <p className="text-sm text-kawa-400">
                  Aucun café ne correspond, essayez une autre saveur.
                </p>
              )}
              {matches.map((c) => (
                <Link
                  key={c.id}
                  href={`/compte/produits/produit/${c.id}?mouture=${machine.grind}`}
                  className="flex flex-col rounded-lg border border-kawa-200 hover:border-sky-400 hover:bg-sky-50 transition p-3"
                >
                  <span className="font-medium text-kawa-800 text-sm">{c.name}</span>
                  {c.description && (
                    <span className="text-xs text-kawa-500 line-clamp-1">{c.description}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Link href="/compte/produits/cafes" className="text-sm text-sky-700 hover:underline">
              Voir tous les cafés
            </Link>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-kawa-500 hover:underline"
            >
              Retour
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
