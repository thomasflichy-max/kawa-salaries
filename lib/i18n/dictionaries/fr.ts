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
