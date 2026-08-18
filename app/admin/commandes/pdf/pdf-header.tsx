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
      {KAWA_LEGAL.bioNote}
      {'\n\n'}
      TVA: {KAWA_LEGAL.vatNumber} – SIREN : {KAWA_LEGAL.siren} – RCS {KAWA_LEGAL.rcsCity}
      {'\n'}
      IBAN: {KAWA_LEGAL.iban} – SWIFT: {KAWA_LEGAL.swift}
      {'\n\n'}
      <Text style={pdfStyles.footerName}>
        {KAWA_LEGAL.name}, {KAWA_LEGAL.legalForm} au capital de {KAWA_LEGAL.capitalSocial} –{' '}
        {KAWA_FULL_ADDRESS}
      </Text>
      {'\n\n'}
      {KAWA_LEGAL.csrNote}
    </Text>
  )
}
