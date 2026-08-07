import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

const { requestMock }: { requestMock: Mock } = vi.hoisted((): { requestMock: Mock } => {
  return { requestMock: vi.fn() }
})

vi.mock('#src-core/services/HttpClientService', (): Record<string, unknown> => {
  return {
    HttpClientService: {
      /**
       * Mock request.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      request: (...args: unknown[]): unknown => requestMock(...args),
    },
  }
})

import { AiPreferenceApiService } from '#src-core/services/AiPreferenceApiService'
import type { AiPreferenceResponse } from '#src-core/types/response/ai.types'

describe('AiPreferenceApiService', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
  })

  it('GET /tenants/me/ai-preference', async (): Promise<void> => {
    requestMock.mockResolvedValue({ provider: 'ANTHROPIC', model: 'claude-sonnet-5' })

    const result: AiPreferenceResponse = await AiPreferenceApiService.get()

    expect(requestMock).toHaveBeenCalledWith('/tenants/me/ai-preference', { method: 'GET' })
    expect(result).toEqual({ provider: 'ANTHROPIC', model: 'claude-sonnet-5' })
  })

  it('PUT /tenants/me/ai-preference avec provider et model', async (): Promise<void> => {
    requestMock.mockResolvedValue({ provider: 'OPENAI', model: 'gpt-5.6-sol' })

    const result: AiPreferenceResponse = await AiPreferenceApiService.update({
      provider: 'OPENAI',
      model: 'gpt-5.6-sol',
    })

    expect(requestMock).toHaveBeenCalledWith('/tenants/me/ai-preference', {
      method: 'PUT',
      body: { provider: 'OPENAI', model: 'gpt-5.6-sol' },
    })
    expect(result.model).toBe('gpt-5.6-sol')
  })
})
