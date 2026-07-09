import { Document, Page, View, Text } from '@react-pdf/renderer'
import type { DemoOrder } from '@/app/admin/demo-data'
import { computeOrderTotals } from '@/app/admin/demo-data'
import { pdfStyles, KAWA_SKY } from './styles'
import { PdfHeader, PdfLegalFooter } from './pdf-header'
import { KAWA_LEGAL } from './kawa-legal'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' })
const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const percent = (rate: number) => `${(rate * 100).toFixed(2).replace('.', ',')} %`

// KAWA doesn't refund cancelled orders — this document is the credit note
// issued instead, usable against a future order. Same seller identity and
// per-rate VAT breakdown as the invoice it corrects, so the two reconcile.
export function AvoirDocument({ order }: { order: DemoOrder }) {
  const totals = computeOrderTotals(order.items)
  const issueDate = new Date()

  return (
    <Document title={`Avoir ${order.orderNumber}`}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader />
        <View style={pdfStyles.hr} />

        <View style={pdfStyles.titleRow}>
          <View>
            <Text style={[pdfStyles.title, { color: KAWA_SKY }]}>
              AVOIR - AV-{order.orderNumber}
            </Text>
            <Text style={pdfStyles.subtitle}>Suite à l&apos;annulation de la commande {order.orderNumber}</Text>
          </View>
          <View>
            <Text style={pdfStyles.metaLabel}>Date d&apos;émission : {dateFormat.format(issueDate)}</Text>
            <Text style={pdfStyles.metaLabel}>
              Commande annulée du : {dateFormat.format(new Date(order.createdAt))}
            </Text>
          </View>
        </View>

        <View style={pdfStyles.recipientBlock}>
          <Text>{order.employeeName}</Text>
          <Text style={{ color: '#6b6862', marginTop: 6 }}>Adresse de facturation</Text>
          <Text>{order.billingAddress}</Text>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow}>
            <Text style={[pdfStyles.colProduct, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              Description
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
          {order.items.map((item) => (
            <View key={item.id} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.colProduct}>{item.productName}</Text>
              <Text style={pdfStyles.colQty}>{item.quantity}</Text>
              <Text style={pdfStyles.colPrice}>
                {currency.format(item.unitPriceTTC / (1 + item.vatRate))}
              </Text>
              <Text style={pdfStyles.colVat}>{percent(item.vatRate)}</Text>
              <Text style={pdfStyles.colAmount}>
                {currency.format(item.unitPriceTTC * item.quantity)}
              </Text>
            </View>
          ))}
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
          <View style={pdfStyles.totalsRowFinal}>
            <Text style={pdfStyles.totalsLabelFinal}>Montant de l&apos;avoir TTC</Text>
            <Text style={pdfStyles.totalsLabelFinal}>{currency.format(totals.totalTTC)}</Text>
          </View>
        </View>

        <View style={pdfStyles.paymentSection}>
          <Text style={pdfStyles.paymentLabel}>Modalité :</Text>
          <Text style={pdfStyles.paymentValue}>
            Conformément à nos conditions générales de vente, les commandes annulées ne font pas
            l&apos;objet d&apos;un remboursement. Cet avoir est utilisable sur une prochaine
            commande, sans limite de durée.
          </Text>
        </View>

        <Text style={pdfStyles.csrNoteBottom}>{KAWA_LEGAL.csrNote}</Text>

        <PdfLegalFooter />
      </Page>
    </Document>
  )
}
