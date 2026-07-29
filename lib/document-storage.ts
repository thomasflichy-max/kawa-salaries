import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'

// Shared by app/api/webhooks/cawl/route.ts (facture + BL, minted on
// payment.captured) and app/admin/commandes/actions.ts (justificatif de
// remboursement, minted when a refund is recorded) — the only two places
// allowed to call next_document_number(), since every call permanently
// consumes a number (see migration 0032: gapless numbering is the whole
// point, so this must never be called speculatively/for a preview).
export type DocumentSeries = 'facture' | 'bon_livraison' | 'avoir'

const SERIES_PREFIX: Record<DocumentSeries, string> = {
  facture: 'FACT',
  bon_livraison: 'BL',
  avoir: 'AVOIR',
}

export async function mintDocumentNumber(
  supabase: SupabaseClient<Database>,
  series: DocumentSeries,
  year: number
): Promise<string> {
  const { data, error } = await supabase.rpc('next_document_number', {
    p_series: series,
    p_year: year,
  })
  if (error || data == null) {
    throw new Error(`[document-storage] failed to mint ${series} number: ${error?.message}`)
  }
  return `${SERIES_PREFIX[series]}-${year}-${String(data).padStart(4, '0')}`
}

export async function uploadDocumentPdf(
  supabase: SupabaseClient<Database>,
  path: string,
  buffer: Buffer
): Promise<void> {
  const { error } = await supabase.storage.from('documents').upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) {
    throw new Error(`[document-storage] failed to upload ${path}: ${error.message}`)
  }
}

export async function downloadDocumentPdf(
  supabase: SupabaseClient<Database>,
  path: string
): Promise<Buffer | null> {
  const { data, error } = await supabase.storage.from('documents').download(path)
  if (error || !data) return null
  return Buffer.from(await data.arrayBuffer())
}
