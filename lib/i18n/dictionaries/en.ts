import type { Dictionary } from '../dictionary'

// English strings — the `satisfies Dictionary` below makes a missing key
// here (relative to fr.ts) a build-time TypeScript error.
export const en = {
  common: {
    close: 'Close',
  },
  switcher: {
    fr: 'FR',
    en: 'EN',
  },
  nav: {
    avantage: 'Your Benefit',
    produits: 'Products',
    commandes: 'My Orders',
    compte: 'My Account',
    panier: 'My Cart',
    categoriesAriaLabel: 'View product categories',
    choisirSonCafe: 'Find your coffee',
    adminSpace: 'Admin space →',
  },
  footer: {
    copyright: '© 2026 KAWA Coffee Nantes — All rights reserved',
    legalNotice: 'Legal notice',
    privacyPolicy: 'Privacy policy',
    terms: 'Terms & conditions',
  },
  support: {
    buttonAriaLabel: 'Got a question?',
    closeAriaLabel: 'Close',
    title: 'Got a question?',
    subtitle: "Send us a message, we'll get back to you quickly.",
    successMessage: "Message sent, thank you! We'll get back to you shortly.",
    placeholder: "E.g.: What's the difference between filter ground coffee and espresso?",
    sending: 'Sending…',
    send: 'Send',
  },
} satisfies Dictionary
