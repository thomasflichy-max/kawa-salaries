import { Document, Page, View, Text } from '@react-pdf/renderer'
import type { DemoOrder, DemoOrderRefund } from '@/app/admin/demo-data'
import { getOrderRefundTotal } from '@/app/admin/demo-data'
import { pdfStyles, KAWA_SKY } from './styles'
import { PdfHeader, PdfLegalFooter } from './pdf-header'
import { KAWA_LEGAL } from './kawa-legal'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' })
const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

// Certifies that money actually moved (unlike the old avoir, which was a
// credit for a future order) — a receipt, not a fiscal document, so it
// deliberately skips a VAT breakdown.
export function RefundCertificateDocument({
  order,
  refund,
}: {
  order: DemoOrder
  refund: DemoOrderRefund
}) {
  const totalRefunded = getOrderRefundTotal(order)
  const isFull = totalRefunded >= order.amount - 0.005

  return (
    <Document title={`Justificatif de remboursement ${order.orderNumber}`}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader />
        <View style={pdfStyles.hr} />

        <View style={pdfStyles.titleRow}>
          <View>
            <Text style={[pdfStyles.title, { color: KAWA_SKY }]}>
              JUSTIFICATIF DE REMBOURSEMENT
            </Text>
            <Text style={pdfStyles.subtitle}>Commande {order.orderNumber}</Text>
          </View>
          <Text style={pdfStyles.metaLabel}>Date : {dateFormat.format(new Date(refund.at))}</Text>
        </View>

        <View style={pdfStyles.recipientBlock}>
          <Text>{order.employeeName}</Text>
          <Text style={{ color: '#6b6862', marginTop: 6 }}>Adresse de facturation</Text>
          <Text>{order.billingAddress}</Text>
        </View>

        <View style={pdfStyles.totalsBlock}>
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.metaLabel}>Montant total de la commande</Text>
            <Text>{currency.format(order.amount)}</Text>
          </View>
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.metaLabel}>Motif</Text>
            <Text>{refund.reason}</Text>
          </View>
          <View style={pdfStyles.totalsRowFinal}>
            <Text style={pdfStyles.totalsLabelFinal}>Montant remboursé</Text>
            <Text style={pdfStyles.totalsLabelFinal}>{currency.format(refund.amount)}</Text>
          </View>
        </View>

        <View style={pdfStyles.paymentSection}>
          <Text style={pdfStyles.paymentLabel}>Statut :</Text>
          <Text style={pdfStyles.paymentValue}>
            {isFull
              ? "Remboursement total de la commande."
              : `Remboursement partiel — ${currency.format(totalRefunded)} remboursés à ce jour sur ${currency.format(order.amount)} payés.`}
          </Text>
        </View>
        <View style={pdfStyles.paymentSection}>
          <Text style={pdfStyles.paymentLabel}>Moyen :</Text>
          <Text style={pdfStyles.paymentValue}>
            Remboursement crédité sur le moyen de paiement utilisé lors de la commande.
          </Text>
        </View>

        <Text style={pdfStyles.csrNoteBottom}>{KAWA_LEGAL.csrNote}</Text>

        <PdfLegalFooter />
      </Page>
    </Document>
  )
}
