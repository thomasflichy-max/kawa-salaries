import type { Dictionary } from '../dictionary'

// English strings — the `satisfies Dictionary` below makes a missing key
// here (relative to fr.ts) a build-time TypeScript error.
export const en = {
  common: {
    close: 'Close',
    saving: 'Saving…',
    save: 'Save',
    preferenceSaved: 'Preference saved.',
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
  produits: {
    pageTitle: 'Products',
    pageSubtitle: 'Your KAWA discount is already applied to the catalog prices.',
    chooseCoffeeTitle: 'Find your coffee',
    chooseCoffeeSubtitle: 'Not sure which coffee or grind you need? Follow the guide.',
    emptyCategory: 'No products available in this category right now.',
    onRequest: 'On request',
    outOfStock: 'Out of stock',
    interested: "I'm interested",
    addedToCart: 'Added to cart ✓',
    adding: 'Adding…',
    addToCart: 'Add to cart',
    grindLabel: 'Grind',
    quantityLabel: 'Quantity',
  },
  produitDetail: {
    packagingPrefix: 'Packaging: bag of',
    outOfStockDetail: 'Out of stock — this product will be available again soon.',
    deliveryNote: 'Delivery options are chosen at checkout.',
    notPurchasableIntro:
      'This product is not available for direct purchase. Leave us your details and we will get back to you.',
  },
  subscribe: {
    createCta: 'Create a subscription →',
    title: 'Automatic restock',
    description:
      "We'll add this coffee to your cart and email you at each due date — you choose the delivery and pay as usual.",
    grindLabel: 'Grind',
    frequencyLabel: 'Frequency',
    submitting: 'Creating…',
    submit: 'Create subscription',
    cancel: 'Cancel',
    successPrefix: 'Subscription created — we will send you a reminder at each due date.',
    manageLink: 'Manage my subscriptions',
  },
  wizard: {
    intro: 'A quick 3-step guide to find the right grind and coffee for your machine.',
    step1Title: 'What machine do you have?',
    step1Subtitle: 'The right grind depends directly on it.',
    step2Title: 'Recommended grind',
    step2Subtitle: (machineLabelLower: string) => `For a ${machineLabelLower}, you need coffee that is:`,
    continueCta: 'Continue',
    changeMachine: 'Change machine',
    step3Title: 'What flavor are you looking for?',
    step3Subtitle: 'Pick a flavor, and we will suggest matching coffees.',
    noFlavorsAvailable: 'No coffee descriptions currently support flavor suggestions.',
    noMatches: 'No coffee matches — try another flavor.',
    seeAllCoffees: 'View all coffees',
    back: 'Back',
    flavors: {
      chocolat: 'Chocolate',
      acidulé: 'Tangy',
      doux: 'Smooth',
      épicé: 'Spicy',
      intense: 'Intense',
      noisette: 'Hazelnut',
      caramel: 'Caramel',
    } as Record<string, string>,
  },
  interestSurvey: {
    question: 'Would the 200 g format of this coffee interest you?',
    interestedYes: "Yes, I'm interested",
    interestedConfirmed: '✓ Thanks, noted',
  },
  interestForm: {
    successMessage: "Thank you, your request has been sent. We'll get back to you shortly.",
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone (optional)',
    sending: 'Sending…',
    submit: 'Send my request',
  },
  compte: {
    greeting: (name: string) => `Hello ${name}`,
    emailLabel: 'Email',
    companyLabel: 'Company',
    profileTitle: 'My profile',
    deliveryTitle: 'Delivery',
    subscriptionTitle: 'Automatic restock',
    subscriptionBody: 'Get an automatic reminder for your favorite coffees, at the frequency of your choice.',
    manage: 'Manage →',
    communicationsTitle: 'Communications',
    passwordTitle: 'Change password',
    paymentTitle: 'Payment methods',
    paymentBody:
      'Payment is made by card directly when ordering, via our secure provider CAWL (Crédit Agricole) — no card is stored or kept in your KAWA account.',
    logout: 'Log out',
  },
  profileForm: {
    fullName: 'Full name',
    billingAddress: 'Billing address',
    updated: 'Profile updated.',
    updating: 'Updating…',
  },
  passwordForm: {
    currentPassword: 'Current password',
    forgotPassword: 'Forgot password?',
    newPassword: 'New password',
    minLength: (n: number) => `At least ${n} characters, with letters and numbers.`,
    confirmPassword: 'Confirm new password',
    updated: 'Password updated.',
    updating: 'Updating…',
    submit: 'Change password',
  },
  addressForm: {
    emptyState:
      'No site is registered yet for your company — your orders will be picked up at the KAWA Nantes office.',
    label: 'Default delivery site',
    hint: 'You can always choose another site when placing an order.',
  },
  marketingForm: {
    label:
      'Receive KAWA offers and news by email (new coffees, promotions, new products). You can unsubscribe at any time.',
  },
  passwordInput: {
    show: 'Show password',
    hide: 'Hide password',
  },
  panier: {
    subtitle: 'Your selection of products.',
    empty: 'Your cart is empty.',
    outOfStock: 'Out of stock',
    remove: 'Remove',
    savingsPrefix: (orgName: string) => `Saved thanks to the ${orgName} discount`,
    defaultOrgName: 'company',
    total: 'Total',
    ttc: 'incl. VAT',
    perKg: '/ kg',
    outOfStockSingle: (name: string) =>
      `"${name}" is out of stock. Remove it from your cart to complete your order.`,
    outOfStockMultiple: (names: string) =>
      `Some products are out of stock (${names}). Remove them from your cart to complete your order.`,
  },
  checkout: {
    confirmCart: 'Confirm my cart',
    itemSingular: 'item',
    itemPlural: 'items',
    ttc: 'incl. VAT',
    deliveryStepTitle: 'Confirm delivery choice',
    paymentStepTitle: 'Payment',
    edit: 'Edit',
    retraitOption: 'Pickup at KAWA Nantes',
    deliveryNoteWithAddress:
      'Your coffee will be delivered free of charge to your office within 7 business days — does that work for you?',
    deliveryNotePickup:
      "Your order will be available for pickup within 24h — we'll email you when it's ready to collect.",
    saving: 'Saving…',
    confirmDelivery: 'Confirm delivery',
    redirecting: 'Redirecting…',
    payCta: (amount: string) => `Pay ${amount}`,
    secureRedirectNote: (siteLabel: string) =>
      `You will be redirected to the secure CAWL (Crédit Agricole) payment page — delivery: ${siteLabel}.`,
    marketingNotice:
      'By completing your order, you agree that KAWA may use your email to inform you about its offers and news on similar products. You can opt out at any time from My Account or via the unsubscribe link in every email.',
  },
  panierRetour: {
    title: 'Thank you for your order',
    body: "Your payment is being processed. You'll receive a confirmation email as soon as it's validated.",
    seeOrders: 'View my orders',
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
