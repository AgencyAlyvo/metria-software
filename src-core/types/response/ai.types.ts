import type { AiProviderId } from '#src-core/types/domain/ai.types'

/**
 * Réponse core-api `GET|PUT /tenants/me/ai-preference`.
 */
export type AiPreferenceResponse = {
  provider: AiProviderId
  model: string
}
