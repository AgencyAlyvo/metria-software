import { defineStore } from 'pinia'
import type { Ref } from 'vue'

import { UsageApiService } from '#src-core/services/UsageApiService'
import {
  CONSUMPTION_PAGE_COPY,
  defaultUsageRange,
  findUserSpendCents,
  formatMoneyCents,
  type UsageRange,
} from '#src-core/types/domain/usage.types'
import type { UsageResponse } from '#src-core/types/response/usage.types'
import { ApiHttpError } from '#src-core/types/http/api-http-error'
import { readJwtSubject } from '#src-core/utils/jwt-subject'
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'

/**
 * Store consommation exposé après unwrap Pinia.
 */
type UsageStore = {
  organizationLabel: string | undefined
  userLabel: string | undefined
  loading: boolean
  error: string | undefined
  load: (now?: Date) => Promise<void>
}

/**
 * Store consommation interne basé sur des refs.
 */
type UsageStoreSetup = {
  organizationLabel: Ref<string | undefined>
  userLabel: Ref<string | undefined>
  loading: Ref<boolean>
  error: Ref<string | undefined>
  load: (now?: Date) => Promise<void>
}

/**
 * Type callable du store consommation.
 */
type UseUsageStore = () => UsageStore

/**
 * Store UI pour `GET /usage` (coût organisation + utilisateur courant).
 */
export const useUsageStore: UseUsageStore = defineStore('usage', (): UsageStoreSetup => {
  const organizationLabel: Ref<string | undefined> = ref(undefined)
  const userLabel: Ref<string | undefined> = ref(undefined)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | undefined> = ref(undefined)

  /**
   * Charge la consommation sur la plage par défaut (mois en cours).
   * @param {Date} [now] - Instant de référence.
   * @returns {Promise<void>}
   */
  const load: (now?: Date) => Promise<void> = async (now: Date = new Date()): Promise<void> => {
    loading.value = true
    error.value = undefined

    try {
      const range: UsageRange = defaultUsageRange(now)
      const usage: UsageResponse = await UsageApiService.get(range)
      const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
      const userId: string | undefined = readJwtSubject(authStore.authToken)
      const currency: string = usage.organizationTotal.currency || 'EUR'

      organizationLabel.value = formatMoneyCents(usage.organizationTotal.amountCents, currency)
      userLabel.value = formatMoneyCents(findUserSpendCents(usage, userId), currency)
    } catch (caught: unknown) {
      error.value = caught instanceof ApiHttpError ? caught.message : CONSUMPTION_PAGE_COPY.loadError
      organizationLabel.value = undefined
      userLabel.value = undefined
    } finally {
      loading.value = false
    }
  }

  return {
    organizationLabel,
    userLabel,
    loading,
    error,
    load,
  }
})
