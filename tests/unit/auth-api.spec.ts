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

import { AuthApiService } from '#src-core/services/AuthApiService'
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

describe('AuthApiService', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    resolveFetchMock.mockReturnValue(fetchMock)
    AuthApiService.configure('http://localhost:8080/')
  })

  it('appelle POST /signin avec le payload et retourne le bearer', async (): Promise<void> => {
    const tokenBody: { type: 'bearer'; value: string; expiresAt: string } = {
      type: 'bearer',
      value: 'jwt-token',
      expiresAt: '2030-01-01T00:00:00Z',
    }
    fetchMock.mockResolvedValue(jsonResponse(200, tokenBody))

    const result: Awaited<ReturnType<typeof AuthApiService.signIn>> = await AuthApiService.signIn({
      email: 'ada@metria.app',
      password: 'secret-password',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/signin',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ email: 'ada@metria.app', password: 'secret-password' }),
      }),
    )
    expect(result).toEqual(tokenBody)
  })

  it('appelle POST /signup et retourne le bearer créé', async (): Promise<void> => {
    const tokenBody: { type: 'bearer'; value: string; expiresAt: string } = {
      type: 'bearer',
      value: 'new-token',
      expiresAt: '2030-01-01T00:00:00Z',
    }
    fetchMock.mockResolvedValue(jsonResponse(201, tokenBody))

    const result: Awaited<ReturnType<typeof AuthApiService.signUp>> = await AuthApiService.signUp({
      email: 'ada@metria.app',
      password: 'secret-password',
      passwordConfirmation: 'secret-password',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/signup',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'ada@metria.app',
          password: 'secret-password',
          passwordConfirmation: 'secret-password',
        }),
      }),
    )
    expect(result.value).toBe('new-token')
  })

  it('lève ApiHttpError avec status et code sur conflit signup', async (): Promise<void> => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, {
        title: 'Conflict',
        detail: 'Email already used',
        code: 'E_EMAIL_ALREADY_USED',
      }),
    )

    await expect(
      AuthApiService.signUp({
        email: 'ada@metria.app',
        password: 'secret-password',
        passwordConfirmation: 'secret-password',
      }),
    ).rejects.toSatisfy((error: unknown): boolean => {
      return error instanceof ApiHttpError && error.status === 409 && error.code === 'E_EMAIL_ALREADY_USED'
    })
  })

  it('révoque le token via DELETE /logout avec Authorization Bearer', async (): Promise<void> => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await AuthApiService.signOut('jwt-token')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/logout',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token',
        }),
      }),
    )
  })

  it('échoue si apiBaseUrl est absent', async (): Promise<void> => {
    AuthApiService.configure('')

    await expect(AuthApiService.signIn({ email: 'a@b.c', password: 'x' })).rejects.toThrow(
      'API base URL is not configured',
    )
    await expect(AuthApiService.signUp({ email: 'a@b.c', password: 'x', passwordConfirmation: 'x' })).rejects.toThrow(
      'API base URL is not configured',
    )
  })

  it('lève ApiHttpError sur signin en échec même sans corps JSON', async (): Promise<void> => {
    fetchMock.mockResolvedValue(new Response('not-json', { status: 401 }))

    await expect(AuthApiService.signIn({ email: 'a@b.c', password: 'bad' })).rejects.toSatisfy(
      (error: unknown): boolean => {
        return error instanceof ApiHttpError && error.status === 401 && error.message === 'HTTP 401'
      },
    )
  })

  it('ignore signOut si apiBaseUrl est absent', async (): Promise<void> => {
    AuthApiService.configure('')

    await expect(AuthApiService.signOut('token')).resolves.toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('lève ApiHttpError si logout échoue', async (): Promise<void> => {
    fetchMock.mockResolvedValue(jsonResponse(500, { detail: 'logout failed' }))

    await expect(AuthApiService.signOut('token')).rejects.toSatisfy((error: unknown): boolean => {
      return error instanceof ApiHttpError && error.status === 500 && error.message === 'logout failed'
    })
  })
})
