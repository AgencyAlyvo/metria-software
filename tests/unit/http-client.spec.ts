import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

const { resolveFetchMock, fetchMock }: { resolveFetchMock: Mock; fetchMock: Mock } = vi.hoisted(
  (): { resolveFetchMock: Mock; fetchMock: Mock } => {
    return {
      resolveFetchMock: vi.fn(),
      fetchMock: vi.fn(),
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
  let authToken: string | undefined

  beforeEach((): void => {
    vi.clearAllMocks()
    resolveFetchMock.mockReturnValue(fetchMock)
    authToken = 'jwt-token'
    HttpClientService.configure({
      apiBaseUrl: 'http://localhost:8080',
      /**
       * Getter token de test.
       * @returns {string | undefined} Token courant.
       */
      getAuthToken: (): string | undefined => authToken,
    })
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

  it('invoque onPaymentRequired puis lève ApiHttpError sur HTTP 402', async (): Promise<void> => {
    const onPaymentRequired: Mock = vi.fn()
    HttpClientService.configure({
      apiBaseUrl: 'http://localhost:8080',
      /**
       * Getter token de test.
       * @returns {string | undefined} Token courant.
       */
      getAuthToken: (): string | undefined => authToken,
      onPaymentRequired,
    })
    fetchMock.mockResolvedValue(jsonResponse(402, { detail: 'Subscription inactive', code: 'E_SUBSCRIPTION_INACTIVE' }))

    await expect(HttpClientService.request('/usage')).rejects.toBeInstanceOf(ApiHttpError)
    expect(onPaymentRequired).toHaveBeenCalledTimes(1)
  })

  it('n’invoque pas onPaymentRequired pour les autres erreurs HTTP', async (): Promise<void> => {
    const onPaymentRequired: Mock = vi.fn()
    HttpClientService.configure({
      apiBaseUrl: 'http://localhost:8080',
      /**
       * Getter token de test.
       * @returns {string | undefined} Token courant.
       */
      getAuthToken: (): string | undefined => authToken,
      onPaymentRequired,
    })
    fetchMock.mockResolvedValue(jsonResponse(500, { detail: 'boom' }))

    await expect(HttpClientService.request('/usage')).rejects.toBeInstanceOf(ApiHttpError)
    expect(onPaymentRequired).not.toHaveBeenCalled()
  })

  it('échoue si apiBaseUrl est absent', async (): Promise<void> => {
    HttpClientService.configure({
      apiBaseUrl: '',
      /**
       * Getter token de test.
       * @returns {string | undefined} Token courant.
       */
      getAuthToken: (): string | undefined => authToken,
    })

    await expect(HttpClientService.request('/me')).rejects.toThrow('API base URL is not configured')
  })

  it('omet Authorization si le getter ne fournit pas de token', async (): Promise<void> => {
    authToken = undefined
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

  it('normalise le slash final de apiBaseUrl au configure', async (): Promise<void> => {
    HttpClientService.configure({
      apiBaseUrl: 'http://localhost:8080/',
      /**
       * Getter token de test.
       * @returns {string | undefined} Token courant.
       */
      getAuthToken: (): string | undefined => authToken,
    })
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }))

    await HttpClientService.request('/me')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/me', expect.any(Object))
  })
})
