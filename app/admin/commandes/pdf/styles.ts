import { StyleSheet } from '@react-pdf/renderer'

// PANTONE 10398 C (kawa-950-ish) and PANTONE 298 C (sky-500) from the site's
// Tailwind theme — kept in sync manually since @react-pdf/renderer can't
// read app/globals.css.
export const KAWA_INK = '#282623'
export const KAWA_MUTED = '#6b6862'
export const KAWA_LINE = '#e4e1db'
export const KAWA_SKY = '#41b6e6'

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: KAWA_INK,
    fontFamily: 'Helvetica',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    width: 110,
  },
  senderBlock: {
    fontSize: 9,
    color: KAWA_MUTED,
    lineHeight: 1.5,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: KAWA_LINE,
    marginVertical: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 13,
    color: KAWA_MUTED,
    marginTop: 4,
  },
  recipientBlock: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaLabel: {
    color: KAWA_MUTED,
  },
  table: {
    marginTop: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: KAWA_INK,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: KAWA_LINE,
    paddingVertical: 8,
  },
  colProduct: { flex: 3 },
  productCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productImage: {
    width: 24,
    height: 24,
    borderRadius: 3,
    objectFit: 'cover',
  },
  colDate: { flex: 1.2, textAlign: 'right' },
  colQty: { flex: 0.8, textAlign: 'right' },
  colUnit: { flex: 0.8, textAlign: 'right' },
  colVat: { flex: 0.8, textAlign: 'right' },
  colPrice: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1, textAlign: 'right' },
  tableHeaderText: {
    fontSize: 9,
    color: KAWA_MUTED,
    textTransform: 'uppercase',
  },
  grindNote: {
    fontSize: 9,
    color: KAWA_MUTED,
    marginTop: 2,
  },
  totalsBlock: {
    marginTop: 16,
    alignSelf: 'flex-end',
    width: 220,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: KAWA_INK,
  },
  totalsLabelFinal: {
    fontSize: 12,
    fontWeight: 700,
    color: KAWA_SKY,
  },
  paymentSection: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
  },
  paymentLabel: {
    width: 110,
    fontWeight: 700,
    fontSize: 9,
  },
  paymentValue: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
  },
  // Pinned just above the legal footer, regardless of how short the item
  // table is — matches the real BL sample, where this note sits at the
  // bottom of the page rather than right under the table.
  csrNoteBottom: {
    position: 'absolute',
    bottom: 75,
    left: 40,
    right: 40,
    fontSize: 8,
    fontStyle: 'italic',
    color: KAWA_MUTED,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: KAWA_MUTED,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  footerName: {
    fontWeight: 700,
    color: KAWA_INK,
  },
})
