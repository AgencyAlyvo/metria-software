import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SubscriptionTrialService } from '#src-core/services/SubscriptionTrialService'
import { BUSINESS_PLAN } from '#src-core/types/domain/pricing.types'

/**
 * Polyfill localStorage minimal pour l'environnement node de vitest.
 */
class MemoryStorage implements Storage {
  private readonly store: Map<string, string> = new Map()

  /**
   * @returns {number} Nombre d'entrées.
   */
  public get length(): number {
    return this.store.size
  }

  /**
   * @param {number} index - Index.
   * @returns {string | null} Clé.
   */
  public key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  /**
   * @param {string} key - Clé.
   * @returns {string | null} Valeur.
   */
  public getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  /**
   * @param {string} key - Clé.
   * @param {string} value - Valeur.
   * @returns {void}
   */
  public setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  /**
   * @param {string} key - Clé.
   * @returns {void}
   */
  public removeItem(key: string): void {
    this.store.delete(key)
  }

  /**
   * @returns {void}
   */
  public clear(): void {
    this.store.clear()
  }
}

describe('SubscriptionTrialService (placeholder)', (): void => {
  beforeEach((): void => {
    vi.stubGlobal('localStorage', new MemoryStorage())
    SubscriptionTrialService.clear()
  })

  afterEach((): void => {
    vi.unstubAllGlobals()
  })

  it('documente l’absence d’endpoint subscription core-api', (): void => {
    expect(SubscriptionTrialService.CORE_SUBSCRIPTION_ENDPOINT).toBeNull()
    expect(SubscriptionTrialService.PLACEHOLDER_REASON).toMatch(/GET \/subscription/i)
  })

  it('démarre un essai local de 5 jours aligné sur le billing core', (): void => {
    const now: Date = new Date('2026-08-07T12:00:00.000Z')

    SubscriptionTrialService.startLocalTrial(now)

    const endsAt: string | undefined = SubscriptionTrialService.getTrialEndsAt()
    expect(endsAt).toBe('2026-08-12T12:00:00.000Z')
    expect(SubscriptionTrialService.getRemainingDays(now)).toBe(BUSINESS_PLAN.trialDays)
  })

  it('ne réécrit pas un essai déjà démarré', (): void => {
    const startedAt: Date = new Date('2026-08-07T12:00:00.000Z')
    SubscriptionTrialService.startLocalTrial(startedAt)

    SubscriptionTrialService.startLocalTrial(new Date('2026-08-08T12:00:00.000Z'))

    expect(SubscriptionTrialService.getTrialEndsAt()).toBe('2026-08-12T12:00:00.000Z')
  })

  it('retourne undefined si aucun essai local n’est stocké', (): void => {
    expect(SubscriptionTrialService.getTrialEndsAt()).toBeUndefined()
    expect(SubscriptionTrialService.getRemainingDays()).toBeUndefined()
  })

  it('efface le placeholder local', (): void => {
    SubscriptionTrialService.startLocalTrial(new Date('2026-08-07T12:00:00.000Z'))
    SubscriptionTrialService.clear()

    expect(SubscriptionTrialService.getTrialEndsAt()).toBeUndefined()
  })

  it('no-op sans localStorage (SSR)', (): void => {
    vi.stubGlobal('localStorage', undefined)

    expect((): void => {
      SubscriptionTrialService.startLocalTrial(new Date('2026-08-07T12:00:00.000Z'))
    }).not.toThrow()
    expect(SubscriptionTrialService.getTrialEndsAt()).toBeUndefined()
    expect(SubscriptionTrialService.getRemainingDays()).toBeUndefined()
    expect((): void => {
      SubscriptionTrialService.clear()
    }).not.toThrow()
  })
})
