import { HttpClientService } from '#src-core/services/HttpClientService'
import type { UsageRange } from '#src-core/types/domain/usage.types'
import type { UsageResponse } from '#src-core/types/response/usage.types'

/**
 * Appels core-api pour la consommation IA (`GET /usage`).
 */
export class UsageApiService {
  /**
   * Charge le spend organisation + par utilisateur sur une plage.
   * @param {UsageRange} range - Bornes `from` / `to` ISO-8601.
   * @returns {Promise<UsageResponse>} Totaux.
   */
  public static async get(range: UsageRange): Promise<UsageResponse> {
    return await HttpClientService.request<UsageResponse>('/usage', {
      method: 'GET',
      query: {
        from: range.from,
        to: range.to,
      },
    })
  }
}
