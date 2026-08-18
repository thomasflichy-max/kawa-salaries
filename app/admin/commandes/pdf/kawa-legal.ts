// Real KAWA Coffee Nantes legal/invoicing identity — the exact wording of
// the footer block (bio/TVA/SIREN/RCS/IBAN/SWIFT/capital/late-payment/CSR)
// was provided verbatim by the client (2026-08-18) as the text used on their
// official commercial documents; kept as literal strings rather than
// composed from parts so the PDF output matches it exactly.
export const KAWA_LEGAL = {
  name: 'Kawa Coffee Nantes',
  legalForm: 'SAS',
  address: '3 bis Rue Germain Boffrand',
  postalCode: '44000',
  city: 'NANTES',
  email: 'nantes@kawa.coffee',
  website: 'https://kawanantespro.com/',
  siren: '889 062 600',
  vatNumber: 'FR55 889062600',
  rcsCity: 'Nantes',
  capitalSocial: '1000€',
  iban: 'FR76 1470 6000 4073 9728 2599 695',
  swift: 'AGRIFRPP847',
  bioNote: 'Bio : produits issus de l’agriculture biologique, certifiés par ECOCERT SAS FR-BIO-01',
  // Salariés pay by card at the moment they place the order, so there's
  // nothing to actually be late on — this clause is included anyway because
  // it's the client's standard boilerplate footer, printed as-is on every
  // commercial document regardless of payment method.
  paymentClause:
    'Pas d’escompte. Pénalité forfaitaire de retard de 40€. TVA acquittée d’après les débits.',
  paymentMethod: 'Carte bancaire à la commande',
  paymentTerms: 'Paiement à la commande',
  csrNote:
    'Kawa Coffee Nantes s’engage à reverser 0,2€ pour chaque Kg de café vendu au fonds de dotation Handicap Agir Ensemble, en soutien à l’Adapeila de Loire-Atlantique.',
}

export const KAWA_FULL_ADDRESS = `${KAWA_LEGAL.address} ${KAWA_LEGAL.postalCode} ${KAWA_LEGAL.city}`
