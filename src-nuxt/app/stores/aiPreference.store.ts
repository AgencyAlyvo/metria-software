import { defineStore } from 'pinia'
import type { Ref } from 'vue'

import { AiPreferenceApiService } from '#src-core/services/AiPreferenceApiService'
import {
  AI_PAGE_COPY,
  findAiOption,
  formatAiOptionLabel,
  isAiOptionSelectable,
  type AiModelOption,
  type AiProviderId,
} from '#src-core/types/domain/ai.types'
import type { AiPreferenceResponse } from '#src-core/types/response/ai.types'
import { ApiHttpError } from '#src-core/types/http/api-http-error'

/**
 * Store préférence IA exposé après unwrap Pinia.
 */
type AiPreferenceStore = {
  provider: AiProviderId | undefined
  model: string | undefined
  displayLabel: string | undefined
  loading: boolean
  saving: boolean
  error: string | undefined
  load: () => Promise<void>
  select: (provider: AiProviderId, model: string) => Promise<void>
}

/**
 * Store préférence IA interne basé sur des refs.
 */
type AiPreferenceStoreSetup = {
  provider: Ref<AiProviderId | undefined>
  model: Ref<string | undefined>
  displayLabel: Ref<string | undefined>
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | undefined>
  load: () => Promise<void>
  select: (provider: AiProviderId, model: string) => Promise<void>
}

/**
 * Type callable du store préférence IA.
 */
type UseAiPreferenceStore = () => AiPreferenceStore

/**
 * Applique une réponse API sur l'état local.
 * @param {AiPreferenceResponse} response - Préférence retournée.
 * @param {Ref<AiProviderId | undefined>} provider - Ref provider.
 * @param {Ref<string | undefined>} model - Ref modèle.
 * @param {Ref<string | undefined>} displayLabel - Ref libellé.
 * @returns {void}
 */
function applyPreference(
  response: AiPreferenceResponse,
  provider: Ref<AiProviderId | undefined>,
  model: Ref<string | undefined>,
  displayLabel: Ref<string | undefined>,
): void {
  provider.value = response.provider
  model.value = response.model
  const option: AiModelOption | undefined = findAiOption(response.provider, response.model)
  displayLabel.value = option
    ? formatAiOptionLabel(option.label, option.model)
    : formatAiOptionLabel(response.model, response.model)
}

/**
 * Store UI pour la préférence IA du tenant (GET/PUT core-api).
 */
export const useAiPreferenceStore: UseAiPreferenceStore = defineStore('aiPreference', (): AiPreferenceStoreSetup => {
  const provider: Ref<AiProviderId | undefined> = ref(undefined)
  const model: Ref<string | undefined> = ref(undefined)
  const displayLabel: Ref<string | undefined> = ref(undefined)
  const loading: Ref<boolean> = ref(false)
  const saving: Ref<boolean> = ref(false)
  const error: Ref<string | undefined> = ref(undefined)

  /**
   * Charge la préférence depuis core-api.
   * @returns {Promise<void>}
   */
  const load: () => Promise<void> = async (): Promise<void> => {
    loading.value = true
    error.value = undefined

    try {
      const response: AiPreferenceResponse = await AiPreferenceApiService.get()
      applyPreference(response, provider, model, displayLabel)
    } catch (caught: unknown) {
      error.value = caught instanceof ApiHttpError ? caught.message : AI_PAGE_COPY.saveError
    } finally {
      loading.value = false
    }
  }

  /**
   * Sélectionne un modèle cloud et le persiste (refuse LOCAL).
   * @param {AiProviderId} nextProvider - Provider cible.
   * @param {string} nextModel - Modèle cible.
   * @returns {Promise<void>}
   */
  const select: (nextProvider: AiProviderId, nextModel: string) => Promise<void> = async (
    nextProvider: AiProviderId,
    nextModel: string,
  ): Promise<void> => {
    error.value = undefined
    const option: AiModelOption | undefined = findAiOption(nextProvider, nextModel)

    if (!isAiOptionSelectable(option)) {
      error.value = AI_PAGE_COPY.localBlocked
      return
    }

    saving.value = true

    try {
      const response: AiPreferenceResponse = await AiPreferenceApiService.update({
        provider: nextProvider,
        model: nextModel,
      })
      applyPreference(response, provider, model, displayLabel)
    } catch (caught: unknown) {
      error.value = caught instanceof ApiHttpError ? caught.message : AI_PAGE_COPY.saveError
    } finally {
      saving.value = false
    }
  }

  return {
    provider,
    model,
    displayLabel,
    loading,
    saving,
    error,
    load,
    select,
  }
})
