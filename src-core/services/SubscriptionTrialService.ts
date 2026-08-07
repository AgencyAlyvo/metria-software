import { BUSINESS_PLAN } from '#src-core/types/domain/pricing.types'
import { remainingTrialDays } from '#src-core/utils/trial'

const TRIAL_ENDS_AT_STORAGE_KEY: string = 'metria_trial_ends_at'
const MS_PER_DAY: number = 24 * 60 * 60 * 1000

/**
 * Accède au localStorage si disponible (client / tests), sinon undefined (SSR).
 * @returns {Storage | undefined} Storage navigateur ou undefined.
 */
const resolveStorage: () => Storage | undefined = (): Storage | undefined => {
  if (typeof localStorage === 'undefined') {
    return undefined
  }

  return localStorage
}

/**
 * Placeholder trial / subscription côté software.
 *
 * Core-api n'expose pas encore de GET subscription (seul `/usage` billing existe).
 * Quand l'endpoint sera disponible, remplacer le stockage local par un appel
 * `HttpClientService.request` et supprimer ce placeholder.
 *
 * Aligné sur le domaine billing core : essai 5 jours, `trialEndsAt`.
 */
export class SubscriptionTrialService {
  /**
   * Endpoint core-api à brancher dès disponibilité (`null` = placeholder actif).
   */
  public static readonly CORE_SUBSCRIPTION_ENDPOINT: null = null

  /**
   * Raison documentée du placeholder (tests + README).
   */
  public static readonly PLACEHOLDER_REASON: string =
    'Placeholder local : core-api n’expose pas encore GET /subscription (trialEndsAt).'

  /**
   * Démarre un essai local de {@link BUSINESS_PLAN.trialDays} jours s'il n'existe pas déjà.
   * @param {Date} [now] - Instant de démarrage.
   * @returns {void}
   */
  public static startLocalTrial(now: Date = new Date()): void {
    const storage: Storage | undefined = resolveStorage()

    if (!storage || storage.getItem(TRIAL_ENDS_AT_STORAGE_KEY)) {
      return
    }

    const trialEndsAt: Date = new Date(now.getTime() + BUSINESS_PLAN.trialDays * MS_PER_DAY)
    storage.setItem(TRIAL_ENDS_AT_STORAGE_KEY, trialEndsAt.toISOString())
  }

  /**
   * Lit la fin d'essai locale (placeholder).
   * @returns {string | undefined} ISO `trialEndsAt` ou undefined.
   */
  public static getTrialEndsAt(): string | undefined {
    const storage: Storage | undefined = resolveStorage()

    if (!storage) {
      return undefined
    }

    return storage.getItem(TRIAL_ENDS_AT_STORAGE_KEY) || undefined
  }

  /**
   * Jours restants d'essai, ou undefined si aucun placeholder stocké.
   * @param {Date} [now] - Instant de référence.
   * @returns {number | undefined} Jours restants.
   */
  public static getRemainingDays(now: Date = new Date()): number | undefined {
    const trialEndsAt: string | undefined = this.getTrialEndsAt()

    if (!trialEndsAt) {
      return undefined
    }

    return remainingTrialDays(trialEndsAt, now)
  }

  /**
   * Efface le placeholder local (ex. déconnexion).
   * @returns {void}
   */
  public static clear(): void {
    resolveStorage()?.removeItem(TRIAL_ENDS_AT_STORAGE_KEY)
  }
}
