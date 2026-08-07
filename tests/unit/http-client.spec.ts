import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

const {
  resolveFetchMock,
  fetchMock,
  useAuthStoreMock,
}: { resolveFetchMock: Mock; fetchMock: Mock; useAuthStoreMock: Mock } = vi.hoisted(
  (): { resolveFetchMock: Mock; fetchMock: Mock; useAuthStoreMock: Mock } => {
    return {
      resolveFetchMock: vi.fn(),
      fetchMock: vi.fn(),
      useAuthStoreMock: vi.fn(),
    }
  },
)

vi.mock('#src-core/utils/http', (): Record<string, unknown> => {
  return {
    /**
     * Mock resolveFetch.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    resolveFetch: (...args: unknown[]): unknown => resolveFetchMock(...args),
    extractHttpError: vi.fn(),
  }
})

vi.mock('#src-nuxt/app/stores/auth.store', (): Record<string, unknown> => {
  return {
    /**
     * Mock useAuthStore.
     * @param {...unknown[]} args - Arguments.
     * @returns {unknown} Résultat mock.
     */
    useAuthStore: (...args: unknown[]): unknown => useAuthStoreMock(...args),
  }
})

import { HttpClientService } from '#src-core/services/HttpClientService'
import { ApiHttpError } from '#src-core/types/http/api-http-error'

/**
 * Construit une Response JSON mock.
 * @param {number} status - Code HTTP.
 * @param {unknown} body - Corps JSON.
 * @returns {Response} Réponse.
 */
function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('HttpClientService', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    resolveFetchMock.mockReturnValue(fetchMock)
    useAuthStoreMock.mockReturnValue({ authToken: 'jwt-token' })
    vi.stubGlobal('useRuntimeConfig', (): { public: { apiBaseUrl: string } } => {
      return { public: { apiBaseUrl: 'http://localhost:8080' } }
    })
  })

  afterEach((): void => {
    vi.unstubAllGlobals()
  })

  it('ajoute Authorization Bearer et sérialise la query', async (): Promise<void> => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }))

    await HttpClientService.request<{ ok: boolean }>('/me', {
      method: 'GET',
      query: { tags: ['a', 'b'], page: 1 },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/me?tags[]=a&tags[]=b&page=1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer jwt-token',
        }),
      }),
    )
  })

  it('lève ApiHttpError quand la réponse n’est pas ok', async (): Promise<void> => {
    fetchMock.mockResolvedValue(jsonResponse(402, { detail: 'Subscription inactive', code: 'E_SUBSCRIPTION_INACTIVE' }))

    await expect(HttpClientService.request('/billing/usage')).rejects.toSatisfy((error: unknown): boolean => {
      return error instanceof ApiHttpError && error.status === 402 && error.code === 'E_SUBSCRIPTION_INACTIVE'
    })
  })

  it('échoue si apiBaseUrl est absent', async (): Promise<void> => {
    vi.stubGlobal('useRuntimeConfig', (): { public: { apiBaseUrl: string } } => {
      return { public: { apiBaseUrl: '' } }
    })

    await expect(HttpClientService.request('/me')).rejects.toThrow('API base URL is not configured')
  })

  it('ommet Authorization si le store n’a pas de token', async (): Promise<void> => {
    useAuthStoreMock.mockReturnValue({ authToken: undefined })
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }))

    await HttpClientService.request('/public')

    const init: RequestInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    const headers: Record<string, string> = init.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('sérialise le body JSON et gère 204', async (): Promise<void> => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    const result: unknown = await HttpClientService.request('/logout', {
      method: 'DELETE',
      body: { reason: 'manual' },
    })

    expect(result).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/logout',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ reason: 'manual' }),
      }),
    )
  })

  it('lève ApiHttpError sans corps JSON parsable', async (): Promise<void> => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 502 }))

    await expect(HttpClientService.request('/me')).rejects.toSatisfy((error: unknown): boolean => {
      return error instanceof ApiHttpError && error.status === 502 && error.message === 'HTTP 502'
    })
  })
})
