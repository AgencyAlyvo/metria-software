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

import { UsageApiService } from '#src-core/services/UsageApiService'
import type { UsageResponse } from '#src-core/types/response/usage.types'

describe('UsageApiService', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
  })

  it('GET /usage avec from et to ISO', async (): Promise<void> => {
    const body: UsageResponse = {
      organizationTotal: { amountCents: 250, currency: 'EUR' },
      byUser: [{ userId: '22222222-2222-2222-2222-222222222222', amountCents: 250, currency: 'EUR' }],
    }
    requestMock.mockResolvedValue(body)

    const result: UsageResponse = await UsageApiService.get({
      from: '2026-08-01T00:00:00Z',
      to: '2026-08-07T00:00:00Z',
    })

    expect(requestMock).toHaveBeenCalledWith('/usage', {
      method: 'GET',
      query: {
        from: '2026-08-01T00:00:00Z',
        to: '2026-08-07T00:00:00Z',
      },
    })
    expect(result.organizationTotal.amountCents).toBe(250)
  })
})
