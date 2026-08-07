import type { UsageResponse } from '#src-core/types/response/usage.types'

/**
 * Fenêtre temporelle pour `GET /usage`.
 */
export type UsageRange = {
  from: string
  to: string
}

/**
 * Copie de la page `/consommation`.
 */
export type ConsumptionPageCopy = {
  title: string
  subtitle: string
  organizationLabel: string
  userLabel: string
  loadError: string
}

/**
 * Textes de la page consommation.
 */
export const CONSUMPTION_PAGE_COPY: ConsumptionPageCopy = {
  title: 'Consommation',
  subtitle: 'Coût IA de l’organisation et de votre compte sur la période en cours.',
  organizationLabel: 'Organisation',
  userLabel: 'Vous',
  loadError: 'Impossible de charger la consommation.',
}

/**
 * Formate un montant en centimes vers une chaîne euros fr-FR.
 * @param {number} amountCents - Montant en centimes.
 * @param {string} currency - Devise ISO (ex. EUR).
 * @returns {string} Montant formaté.
 */
export function formatMoneyCents(amountCents: number, currency: string): string {
  const amount: number = amountCents / 100
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Plage par défaut : 1ᵉʳ du mois UTC → maintenant.
 * @param {Date} [now] - Instant de référence.
 * @returns {UsageRange} Bornes ISO pour core-api.
 */
export function defaultUsageRange(now: Date = new Date()): UsageRange {
  const from: Date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}

/**
 * Extrait le spend (centimes) d'un utilisateur dans la réponse usage.
 * @param {UsageResponse} usage - Réponse `GET /usage`.
 * @param {string | undefined} userId - UUID utilisateur (JWT `sub`).
 * @returns {number} Centimes (0 si absent).
 */
export function findUserSpendCents(usage: UsageResponse, userId: string | undefined): number {
  if (!userId) {
    return 0
  }

  const entry: UsageResponse['byUser'][number] | undefined = usage.byUser.find(
    (row: UsageResponse['byUser'][number]): boolean => row.userId === userId,
  )
  return entry?.amountCents ?? 0
}
