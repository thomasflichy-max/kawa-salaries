export type DateRangePreset = 'week' | 'month' | 'year' | 'custom'

export type DateRange = { from: Date; to: Date; preset: DateRangePreset }

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function resolveDateRange(searchParams: {
  from?: string
  to?: string
  preset?: string
}): DateRange {
  const now = new Date()

  if (searchParams.from && searchParams.to) {
    const from = new Date(searchParams.from)
    const to = new Date(searchParams.to)
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      return { from: startOfDay(from), to: endOfDay(to), preset: 'custom' }
    }
  }

  const preset = searchParams.preset === 'week' || searchParams.preset === 'year' ? searchParams.preset : 'month'

  if (preset === 'week') {
    const from = new Date(now)
    from.setDate(from.getDate() - 7)
    return { from: startOfDay(from), to: endOfDay(now), preset: 'week' }
  }

  if (preset === 'year') {
    const from = new Date(now.getFullYear(), 0, 1)
    return { from: startOfDay(from), to: endOfDay(now), preset: 'year' }
  }

  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: startOfDay(from), to: endOfDay(now), preset: 'month' }
}

export function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10)
}
