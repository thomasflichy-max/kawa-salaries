// Real KAWA Coffee Nantes legal/invoicing identity, taken directly from
// actual invoice/delivery-note samples provided by the client (2026-07).
// This address (3 B rue Germain Boffrand) is the siège social / billing
// address — intentionally distinct from KAWA_OFFICE (75 Bd Ernest Dalby),
// which is the bureaux/pickup-and-delivery point used elsewhere on the site.
// Confirmed with the client: both addresses are real and correct as-is.
export const KAWA_LEGAL = {
  name: 'Kawa Coffee Nantes',
  legalForm: 'SAS',
  address: '3 B rue Germain Boffrand',
  postalCode: '44000',
  city: 'Nantes',
  email: 'nantes@kawa.coffee',
  website: 'https://kawanantespro.com/',
  siret: '889 062 600 00016',
  vatNumber: 'FR55 889062600',
  rcsCity: 'Nantes',
  // Salariés pay by card at the moment they place the order — no net terms,
  // no bank transfer/IBAN, no late-payment clause (there's nothing to be
  // late on).
  paymentMethod: 'Carte bancaire à la commande',
  paymentTerms: 'Paiement à la commande',
  csrNote:
    "Parce que nous souhaitons contribuer à l'avènement d'une société toujours plus solidaire et inclusive, Kawa Coffee Nantes s'engage à reverser 0,2€/kg de café vendu au fond de dotation Handicap Agir Ensemble, en soutien à l'ADAPEI de Loire-Atlantique.",
}

export const KAWA_FULL_ADDRESS = `${KAWA_LEGAL.address} ${KAWA_LEGAL.postalCode} ${KAWA_LEGAL.city}`
