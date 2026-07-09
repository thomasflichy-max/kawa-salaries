import { Document, Page, View, Text, Image } from '@react-pdf/renderer'
import type { DemoOrder } from '@/app/admin/demo-data'
import { computeOrderTotals, getDeliveryLabel } from '@/app/admin/demo-data'
import { pdfStyles, KAWA_SKY } from './styles'
import { PdfHeader, PdfLegalFooter } from './pdf-header'
import { KAWA_LEGAL } from './kawa-legal'
import { readPublicImageAsDataUri } from './pdf-image'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' })
const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const percent = (rate: number) => `${(rate * 100).toFixed(2).replace('.', ',')} %`

// Billed to the employee as an individual (B2C) — the employer company only
// grants the discount, it isn't the contracting party on this invoice.
export function InvoiceDocument({ order }: { order: DemoOrder }) {
  const totals = computeOrderTotals(order.items)
  // Paid by card at the moment the order is placed, so the due date is the
  // order date itself — there are no net payment terms.
  const invoiceDate = new Date(order.createdAt)

  return (
    <Document title={`Facture ${order.orderNumber}`}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader />
        <View style={pdfStyles.hr} />

        <View style={pdfStyles.titleRow}>
          <View>
            <Text style={[pdfStyles.title, { color: KAWA_SKY }]}>
              FACTURE - {order.orderNumber}
            </Text>
          </View>
          <View>
            <Text style={pdfStyles.metaLabel}>
              Date de facturation : {dateFormat.format(invoiceDate)}
            </Text>
            <Text style={pdfStyles.metaLabel}>Échéance : {dateFormat.format(invoiceDate)}</Text>
            <Text style={pdfStyles.metaLabel}>Type d&apos;opération : Livraison de biens</Text>
          </View>
        </View>

        <View style={pdfStyles.recipientBlock}>
          <Text>{order.employeeName}</Text>
          <Text style={{ color: '#6b6862', marginTop: 6 }}>Adresse de facturation</Text>
          <Text>{order.billingAddress}</Text>
          <Text style={{ marginTop: 6 }}>
            <Text style={{ color: '#6b6862' }}>Lieu de livraison : </Text>
            {getDeliveryLabel(order)}
          </Text>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow}>
            <Text style={[pdfStyles.colProduct, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              Description
            </Text>
            <Text style={[pdfStyles.colDate, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              Date
            </Text>
            <Text style={[pdfStyles.colQty, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              Qté
            </Text>
            <Text style={[pdfStyles.colPrice, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              Prix unitaire
            </Text>
            <Text style={[pdfStyles.colVat, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              TVA
            </Text>
            <Text style={[pdfStyles.colAmount, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              Montant
            </Text>
          </View>
          {order.items.map((item) => {
            const imageDataUri = readPublicImageAsDataUri(item.imageUrl)
            return (
              <View key={item.productName} style={pdfStyles.tableRow}>
                <View style={[pdfStyles.colProduct, pdfStyles.productCell]}>
                  {imageDataUri && (
                    // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF-only node, not a DOM <img>
                    <Image src={imageDataUri} style={pdfStyles.productImage} />
                  )}
                  <Text>{item.productName}</Text>
                </View>
                <Text style={pdfStyles.colDate}>{dateFormat.format(invoiceDate)}</Text>
                <Text style={pdfStyles.colQty}>{item.quantity}</Text>
                <Text style={pdfStyles.colPrice}>
                  {currency.format(item.unitPriceTTC / (1 + item.vatRate))}
                </Text>
                <Text style={pdfStyles.colVat}>{percent(item.vatRate)}</Text>
                <Text style={pdfStyles.colAmount}>
                  {currency.format(item.unitPriceTTC * item.quantity)}
                </Text>
              </View>
            )
          })}
        </View>

        <View style={pdfStyles.totalsBlock}>
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.metaLabel}>Total HT</Text>
            <Text>{currency.format(totals.totalHT)}</Text>
          </View>
          {totals.vatByRate.map(({ rate, amount }) => (
            <View key={rate} style={pdfStyles.totalsRow}>
              <Text style={pdfStyles.metaLabel}>TVA {percent(rate)}</Text>
              <Text>{currency.format(amount)}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.metaLabel}>TVA totale</Text>
            <Text>{currency.format(totals.totalVAT)}</Text>
          </View>
          <View style={pdfStyles.totalsRowFinal}>
            <Text style={pdfStyles.totalsLabelFinal}>Total TTC</Text>
            <Text style={pdfStyles.totalsLabelFinal}>{currency.format(totals.totalTTC)}</Text>
          </View>
        </View>

        <View style={pdfStyles.paymentSection}>
          <Text style={pdfStyles.paymentLabel}>Moyens de paiement :</Text>
          <Text style={pdfStyles.paymentValue}>{KAWA_LEGAL.paymentMethod}</Text>
        </View>
        <View style={pdfStyles.paymentSection}>
          <Text style={pdfStyles.paymentLabel}>Conditions de paiement :</Text>
          <Text style={pdfStyles.paymentValue}>{KAWA_LEGAL.paymentTerms}</Text>
        </View>

        <Text style={pdfStyles.csrNoteBottom}>{KAWA_LEGAL.csrNote}</Text>

        <PdfLegalFooter />
      </Page>
    </Document>
  )
}
