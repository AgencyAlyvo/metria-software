import { HttpClientService } from '#src-core/services/HttpClientService'
import type { AiPreferencePayload } from '#src-core/types/payload/ai.types'
import type { AiPreferenceResponse } from '#src-core/types/response/ai.types'

/**
 * Appels core-api pour la préférence IA du tenant.
 */
export class AiPreferenceApiService {
  /**
   * Lit la préférence IA courante.
   * @returns {Promise<AiPreferenceResponse>} Provider + modèle.
   */
  public static async get(): Promise<AiPreferenceResponse> {
    return await HttpClientService.request<AiPreferenceResponse>('/tenants/me/ai-preference', {
      method: 'GET',
    })
  }

  /**
   * Met à jour la préférence IA du tenant.
   * @param {AiPreferencePayload} payload - Provider + modèle.
   * @returns {Promise<AiPreferenceResponse>} Préférence persistée.
   */
  public static async update(payload: AiPreferencePayload): Promise<AiPreferenceResponse> {
    return await HttpClientService.request<AiPreferenceResponse>('/tenants/me/ai-preference', {
      method: 'PUT',
      body: payload,
    })
  }
}
