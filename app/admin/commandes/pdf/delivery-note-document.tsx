import { Document, Page, View, Text, Image } from '@react-pdf/renderer'
import type { DemoOrder } from '@/app/admin/demo-data'
import { getDeliveryLabel } from '@/app/admin/demo-data'
import { pdfStyles, KAWA_SKY } from './styles'
import { PdfHeader, PdfLegalFooter } from './pdf-header'
import { KAWA_LEGAL } from './kawa-legal'
import { readPublicImageAsDataUri } from './pdf-image'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' })

export function DeliveryNoteDocument({ order }: { order: DemoOrder }) {
  return (
    <Document title={`Bon de livraison ${order.orderNumber}`}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader />
        <View style={pdfStyles.hr} />

        <View style={pdfStyles.titleRow}>
          <View>
            <Text style={[pdfStyles.title, { color: KAWA_SKY }]}>
              BON DE LIVRAISON - {order.orderNumber}
            </Text>
          </View>
          <Text style={pdfStyles.metaLabel}>
            Date : {dateFormat.format(new Date(order.createdAt))}
          </Text>
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
            <Text style={[pdfStyles.colUnit, pdfStyles.tableHeaderText, { color: KAWA_SKY }]}>
              Unité
            </Text>
          </View>
          {order.items.map((item) => {
            const imageDataUri = readPublicImageAsDataUri(item.imageUrl)
            return (
              <View key={item.id} style={pdfStyles.tableRow}>
                <View style={[pdfStyles.colProduct, pdfStyles.productCell]}>
                  {imageDataUri && (
                    // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF-only node, not a DOM <img>
                    <Image src={imageDataUri} style={pdfStyles.productImage} />
                  )}
                  <Text>{item.productName}</Text>
                </View>
                <Text style={pdfStyles.colDate}>{dateFormat.format(new Date(order.createdAt))}</Text>
                <Text style={pdfStyles.colQty}>{item.quantity.toFixed(2)}</Text>
                <Text style={pdfStyles.colUnit}>{item.unit}</Text>
              </View>
            )
          })}
        </View>

        <Text style={pdfStyles.csrNoteBottom}>{KAWA_LEGAL.csrNote}</Text>

        <PdfLegalFooter />
      </Page>
    </Document>
  )
}
