/**
 * Plan Business V1 — aligné sur metria-backend-core (`Plan.business()` / Flyway V3).
 */
export type BusinessPlan = {
  name: 'Business'
  monthlyPriceEuros: 499
  includedUsers: 3
  extraUserPriceEuros: 50
  trialDays: 5
  aiConsumption: 'à l’usage'
  localModels: {
    label: 'Modèles locaux'
    status: 'bientôt disponible'
  }
}

/**
 * Copie de la page `/pricing` (informative — pas de checkout Stripe en V1).
 */
export type PricingPageCopy = {
  title: string
  subtitle: string
  checkoutCta: string
  checkoutDisabled: true
  checkoutHint: string
}

/**
 * Catalogue pricing affiché dans le software (source de vérité front V1).
 */
export const BUSINESS_PLAN: BusinessPlan = {
  name: 'Business',
  monthlyPriceEuros: 499,
  includedUsers: 3,
  extraUserPriceEuros: 50,
  trialDays: 5,
  aiConsumption: 'à l’usage',
  localModels: {
    label: 'Modèles locaux',
    status: 'bientôt disponible',
  },
}

/**
 * Textes de la page pricing — Stripe checkout reporté au BACKLOG.
 */
export const PRICING_PAGE_COPY: PricingPageCopy = {
  title: 'Tarifs Metria',
  subtitle: 'Essai 5 jours inclus. Passez au plan Business quand vous êtes prêt.',
  checkoutCta: 'Bientôt disponible',
  checkoutDisabled: true,
  checkoutHint: 'Le paiement en ligne (Stripe) arrivera dans une prochaine version.',
}
