import { defineStore } from 'pinia'
import type { Ref } from 'vue'

import { SubscriptionTrialService } from '#src-core/services/SubscriptionTrialService'
import { formatTrialBannerLabel } from '#src-core/utils/trial'

/**
 * Store essai exposé après unwrap Pinia.
 */
type TrialStore = {
  remainingDays: number | undefined
  bannerLabel: string | undefined
  showBanner: boolean
  refresh: (now?: Date) => void
  startLocalTrial: (now?: Date) => void
  clear: () => void
}

/**
 * Store essai interne basé sur des refs.
 */
type TrialStoreSetup = {
  remainingDays: Ref<number | undefined>
  bannerLabel: Ref<string | undefined>
  showBanner: Ref<boolean>
  refresh: (now?: Date) => void
  startLocalTrial: (now?: Date) => void
  clear: () => void
}

/**
 * Type callable du store essai.
 */
type UseTrialStore = () => TrialStore

/**
 * Store UI pour le bandeau « essai : J-x » (placeholder subscription/trial).
 */
export const useTrialStore: UseTrialStore = defineStore('trial', (): TrialStoreSetup => {
  const remainingDays: Ref<number | undefined> = ref(undefined)
  const bannerLabel: Ref<string | undefined> = ref(undefined)
  const showBanner: Ref<boolean> = ref(false)

  /**
   * Recalcule le bandeau depuis le placeholder local (ou futur endpoint core).
   * @param {Date} [now] - Instant de référence.
   * @returns {void}
   */
  const refresh: (now?: Date) => void = (now: Date = new Date()): void => {
    const days: number | undefined = SubscriptionTrialService.getRemainingDays(now)
    remainingDays.value = days
    showBanner.value = days !== undefined
    bannerLabel.value = days === undefined ? undefined : formatTrialBannerLabel(days)
  }

  /**
   * Démarre l'essai local (appelé au signup) puis rafraîchit le bandeau.
   * @param {Date} [now] - Instant de démarrage.
   * @returns {void}
   */
  const startLocalTrial: (now?: Date) => void = (now: Date = new Date()): void => {
    SubscriptionTrialService.startLocalTrial(now)
    refresh(now)
  }

  /**
   * Efface le placeholder local.
   * @returns {void}
   */
  const clear: () => void = (): void => {
    SubscriptionTrialService.clear()
    remainingDays.value = undefined
    bannerLabel.value = undefined
    showBanner.value = false
  }

  refresh()

  return {
    remainingDays,
    bannerLabel,
    showBanner,
    refresh,
    startLocalTrial,
    clear,
  }
})
