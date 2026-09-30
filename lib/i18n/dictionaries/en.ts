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
  avantage: {
    defaultOrgName: 'your company',
    eyebrow: 'Your KAWA benefit',
    heroTitle: 'Exceptional coffee, at home.',
    heroSubtitle: (orgName: string) =>
      `Thanks to ${orgName}, enjoy quality coffee at a reduced price, to savor at home.`,
    stats: {
      rank: '12th',
      rankLabel: "World's best roaster",
      coffeesLabel: 'Coffees to discover',
      pickupValue: '24h',
      pickupLabel: 'Pickup at our office',
      deliveryValue: '7 business days',
      deliveryLabel: 'Delivery to your office',
    },
    votreAvantageEyebrow: 'Your benefit',
    votreAvantageTitle: 'Exceptional coffee, at a reduced price, for home',
    votreAvantageBody: (orgName: string) =>
      `As an employee of ${orgName}, a KAWA Nantes partner company, you get a personal discount on our coffees to enjoy at home, as well as on our maintenance products and refurbished machines. An offer reserved for employees of KAWA partner companies, based in Nantes.`,
    qualiteEyebrow: 'Quality',
    qualiteTitle: 'Exceptional coffee, carefully selected',
    qualiteBody:
      'KAWA Nantes brings you TANAT coffees — specialty coffees chosen for their quality, starting with the selection of the beans.',
    savoirFaire: [
      {
        title: 'TANAT roastery',
        text: "World's 12th best roaster in 2024, roasted in small batches at their Paris workshop.",
      },
      {
        title: 'Short supply chain',
        text: 'A direct relationship with our specialty coffee producers, for fully traceable coffee.',
      },
      {
        title: 'Always fresh',
        text: 'Every coffee is roasted specially for your machine, in small batches.',
      },
    ],
    qualiteFooter:
      'The same coffee we serve our professional clients, now in your cup at home.',
    livraisonEyebrow: 'Delivery',
    livraisonTitle: 'Two ways to get your coffee',
    livraisonIntro:
      'Delivery is free, with two options to choose from — all that is left is to take it home.',
    pickupCardTitle: 'Pickup at our office — within 24h',
    pickupCardBody:
      'Come pick it up directly at our office, 75 Bd Ernest Dalby, Nantes, between 9am and 6pm.',
    deliveryCardTitle: 'Delivery to your office — 7 business days',
    deliveryCardBody:
      'Your coffee is delivered free of charge to your workplace — all that is left is to take it home in the evening.',
    closerText: 'Craving a treat at home?',
    closerCta: 'View the catalog →',
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
