import fs from 'node:fs'
import path from 'node:path'
import { View, Text, Image } from '@react-pdf/renderer'
import { pdfStyles } from './styles'
import { KAWA_LEGAL, KAWA_FULL_ADDRESS } from './kawa-legal'

// Read once per process — route handlers run in Node, so fs access is fine
// here (this module is never imported by client components).
const logoDataUri = (() => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'logo-kawa-nantes-transparent.png')
    const base64 = fs.readFileSync(filePath).toString('base64')
    return `data:image/png;base64,${base64}`
  } catch {
    return null
  }
})()

export function PdfHeader() {
  return (
    <View style={pdfStyles.headerRow}>
      <View style={pdfStyles.senderBlock}>
        <Text>{KAWA_LEGAL.name}</Text>
        <Text>{KAWA_FULL_ADDRESS}</Text>
        <Text>{KAWA_LEGAL.email}</Text>
        <Text>{KAWA_LEGAL.website}</Text>
      </View>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF-only node, not a DOM <img> */}
      {logoDataUri && <Image src={logoDataUri} style={pdfStyles.logo} />}
    </View>
  )
}

export function PdfLegalFooter() {
  return (
    <Text style={pdfStyles.footer}>
      <Text style={pdfStyles.footerName}>
        {KAWA_LEGAL.name} - {KAWA_LEGAL.legalForm}
      </Text>
      {'\n'}
      {KAWA_FULL_ADDRESS}
      {'\n'}
      Numéro de SIRET: {KAWA_LEGAL.siret} - Numéro de TVA: {KAWA_LEGAL.vatNumber} -{' '}
      {KAWA_LEGAL.rcsCity}
    </Text>
  )
}
