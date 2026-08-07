import type { AiProviderId } from '#src-core/types/domain/ai.types'

/**
 * Corps `PUT /tenants/me/ai-preference`.
 */
export type AiPreferencePayload = {
  provider: AiProviderId
  model: string
}
