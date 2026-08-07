import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { SubscriptionTrialService } from '#src-core/services/SubscriptionTrialService'
import { useTrialStore } from '#src-nuxt/app/stores/trial.store'

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

describe('useTrialStore', (): void => {
  beforeEach((): void => {
    vi.stubGlobal('localStorage', new MemoryStorage())
    setActivePinia(createPinia())
    SubscriptionTrialService.clear()
  })

  afterEach((): void => {
    vi.unstubAllGlobals()
  })

  it('expose le bandeau essai à partir du placeholder local', (): void => {
    const now: Date = new Date('2026-08-07T12:00:00.000Z')
    SubscriptionTrialService.startLocalTrial(now)

    const store: ReturnType<typeof useTrialStore> = useTrialStore()
    store.refresh(now)

    expect(store.remainingDays).toBe(5)
    expect(store.bannerLabel).toBe('essai : J-5')
    expect(store.showBanner).toBe(true)
  })

  it('masque le bandeau si aucun essai n’est stocké', (): void => {
    const store: ReturnType<typeof useTrialStore> = useTrialStore()
    store.refresh(new Date('2026-08-07T12:00:00.000Z'))

    expect(store.showBanner).toBe(false)
    expect(store.bannerLabel).toBeUndefined()
  })

  it('démarre un essai local puis rafraîchit le bandeau', (): void => {
    const now: Date = new Date('2026-08-07T12:00:00.000Z')
    const store: ReturnType<typeof useTrialStore> = useTrialStore()

    store.startLocalTrial(now)

    expect(store.remainingDays).toBe(5)
    expect(store.bannerLabel).toBe('essai : J-5')
    expect(store.showBanner).toBe(true)
    expect(localStorage.getItem('metria_trial_ends_at')).toBe('2026-08-12T12:00:00.000Z')
  })

  it('efface le placeholder et masque le bandeau', (): void => {
    const now: Date = new Date('2026-08-07T12:00:00.000Z')
    const store: ReturnType<typeof useTrialStore> = useTrialStore()
    store.startLocalTrial(now)

    store.clear()

    expect(store.showBanner).toBe(false)
    expect(store.bannerLabel).toBeUndefined()
    expect(store.remainingDays).toBeUndefined()
    expect(localStorage.getItem('metria_trial_ends_at')).toBeNull()
  })
})
