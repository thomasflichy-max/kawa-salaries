// French strings for the employee-facing site. English lives in ./en.ts,
// typed against this file's shape (lib/i18n/dictionary.ts) — a key added
// here without its English counterpart is a TypeScript error, not a
// silent French fallback in "English" mode.
export const fr = {
  common: {
    close: 'Fermer',
  },
  switcher: {
    fr: 'FR',
    en: 'EN',
  },
  nav: {
    avantage: 'Votre Avantage',
    produits: 'Produits',
    commandes: 'Mes Commandes',
    compte: 'Mon Compte',
    panier: 'Mon Panier',
    categoriesAriaLabel: 'Voir les catégories de produits',
    choisirSonCafe: 'Choisir son café',
    adminSpace: 'Espace admin →',
  },
  footer: {
    copyright: '© 2026 KAWA Coffee Nantes — Tous droits réservés',
    legalNotice: 'Mentions légales',
    privacyPolicy: 'Politique de confidentialité',
    terms: 'CGV',
  },
  avantage: {
    defaultOrgName: 'votre entreprise',
    eyebrow: 'Votre avantage KAWA',
    heroTitle: "Le café d'exception, à la maison.",
    heroSubtitle: (orgName: string) =>
      `Grâce à ${orgName}, profitez d'un café de qualité à prix réduit, à déguster chez vous.`,
    stats: {
      rank: '12ᵉ',
      rankLabel: 'Meilleur torréfacteur mondial',
      coffeesLabel: 'Cafés à découvrir',
      pickupValue: '24h',
      pickupLabel: 'Retrait en agence',
      deliveryValue: '7j ouvrés',
      deliveryLabel: 'Livraison au travail',
    },
    votreAvantageEyebrow: 'Votre avantage',
    votreAvantageTitle: "Un café d'exception, à prix réduit, pour la maison",
    votreAvantageBody: (orgName: string) =>
      `En tant que salarié de ${orgName}, entreprise partenaire de KAWA Nantes, vous bénéficiez d'une réduction personnelle sur nos cafés à déguster chez vous, ainsi que sur nos produits d'entretien et nos machines reconditionnées. Une offre réservée aux salariés des entreprises partenaires de KAWA, basés à Nantes.`,
    qualiteEyebrow: 'Qualité',
    qualiteTitle: "Un café d'exception, sélectionné avec soin",
    qualiteBody:
      'KAWA Nantes vous propose les cafés TANAT — des cafés de spécialité choisis pour leur qualité, dès la sélection des grains.',
    savoirFaire: [
      {
        title: 'Torréfacteur TANAT',
        text: '12ᵉ meilleur torréfacteur mondial en 2024, torréfié en petites séries dans son atelier parisien.',
      },
      {
        title: 'Circuit court',
        text: 'Une relation directe avec nos producteurs de cafés de spécialité, pour des cafés tracés.',
      },
      {
        title: 'Toujours frais',
        text: 'Chaque café est torréfié spécialement pour votre machine, en petite série.',
      },
    ],
    qualiteFooter:
      'Le même café que nous servons à nos clients professionnels, à retrouver dans votre tasse à la maison.',
    livraisonEyebrow: 'Livraison',
    livraisonTitle: 'Deux façons de repartir avec votre café',
    livraisonIntro:
      "La livraison est gratuite, avec deux solutions au choix — il ne vous reste plus qu'à l'emporter chez vous.",
    pickupCardTitle: 'Retrait en agence — sous 24h',
    pickupCardBody:
      'Venez la récupérer directement dans nos locaux du 75 Bd Ernest Dalby, à Nantes, entre 9h et 18h.',
    deliveryCardTitle: 'Livraison au travail — 7 jours ouvrés',
    deliveryCardBody:
      "Votre café est livré gratuitement sur votre lieu de travail — vous n'avez plus qu'à l'emporter chez vous le soir.",
    closerText: 'Envie de vous régaler chez vous ?',
    closerCta: 'Voir le catalogue →',
  },
  produits: {
    pageTitle: 'Produits',
    pageSubtitle: 'Votre remise KAWA est déjà appliquée sur les produits du catalogue.',
    chooseCoffeeTitle: 'Choisir son café',
    chooseCoffeeSubtitle: "Pas sûr de la mouture ou du café qu'il vous faut ? Suivez le guide.",
    emptyCategory: 'Aucun produit disponible pour le moment dans cette rubrique.',
    onRequest: 'Sur demande',
    outOfStock: 'En rupture de stock',
    interested: 'Je suis intéressé',
    addedToCart: 'Ajouté au panier ✓',
    adding: 'Ajout…',
    addToCart: 'Ajouter au panier',
    grindLabel: 'Mouture',
    quantityLabel: 'Quantité',
  },
  produitDetail: {
    packagingPrefix: 'Conditionnement : sachet de',
    outOfStockDetail: 'En rupture de stock — ce produit sera de nouveau disponible prochainement.',
    deliveryNote: 'Les options de livraison seront à choisir au moment du passage de commande.',
    notPurchasableIntro:
      "Ce produit n'est pas disponible à l'achat direct. Laissez-nous vos coordonnées, nous vous recontactons.",
  },
  subscribe: {
    createCta: 'Créer un abonnement →',
    title: 'Réassort automatique',
    description:
      'On ajoute ce café à votre panier et on vous envoie un email à chaque échéance — vous choisissez la livraison et payez comme pour une commande normale.',
    grindLabel: 'Mouture',
    frequencyLabel: 'Fréquence',
    submitting: 'Création…',
    submit: "Créer l'abonnement",
    cancel: 'Annuler',
    successPrefix: 'Abonnement créé — on vous enverra un rappel à chaque échéance.',
    manageLink: 'Gérer mes abonnements',
  },
  wizard: {
    intro: 'Un petit guide pour trouver la mouture et le café adaptés à votre machine, en 3 étapes.',
    step1Title: 'Quelle est votre machine ?',
    step1Subtitle: 'La mouture adaptée en dépend directement.',
    step2Title: 'Mouture recommandée',
    step2Subtitle: (machineLabelLower: string) => `Pour une ${machineLabelLower}, il vous faut du café :`,
    continueCta: 'Continuer',
    changeMachine: 'Changer de machine',
    step3Title: 'Quel goût recherchez-vous ?',
    step3Subtitle: 'Choisissez une saveur, on vous propose le café qui correspond.',
    noFlavorsAvailable: 'Aucune description de café ne permet de proposer une saveur pour le moment.',
    noMatches: 'Aucun café ne correspond, essayez une autre saveur.',
    seeAllCoffees: 'Voir tous les cafés',
    back: 'Retour',
    flavors: {
      chocolat: 'Chocolat',
      acidulé: 'Acidulé',
      doux: 'Doux',
      épicé: 'Épicé',
      intense: 'Intense',
      noisette: 'Noisette',
      caramel: 'Caramel',
    } as Record<string, string>,
  },
  interestSurvey: {
    question: 'Le format 200 g de ce café vous intéresserait-il ?',
    interestedYes: 'Oui, ça m’intéresse',
    interestedConfirmed: '✓ Merci, c’est noté',
  },
  interestForm: {
    successMessage: 'Merci, votre demande a bien été envoyée. Nous vous recontactons rapidement.',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone (facultatif)',
    sending: 'Envoi…',
    submit: 'Envoyer ma demande',
  },
  support: {
    buttonAriaLabel: 'Une question ?',
    closeAriaLabel: 'Fermer',
    title: 'Une question ?',
    subtitle: 'Envoyez-nous un message, on vous répond rapidement.',
    successMessage: 'Message envoyé, merci ! Nous revenons vers vous rapidement.',
    placeholder: 'Ex : Quelle est la différence entre un café moulu filtre et espresso ?',
    sending: 'Envoi…',
    send: 'Envoyer',
  },
}
