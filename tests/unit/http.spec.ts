import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { tauriFetchMock } = vi.hoisted((): { tauriFetchMock: ReturnType<typeof vi.fn> } => {
  return { tauriFetchMock: vi.fn() }
})

vi.mock('@tauri-apps/plugin-http', (): Record<string, unknown> => {
  return {
    fetch: tauriFetchMock,
  }
})

import { extractHttpError, resolveFetch } from '#src-core/utils/http'

/**
 * Construit une Response mock pour les tests HTTP.
 * @param {number} status - Code HTTP.
 * @param {unknown} body - Corps JSON ou texte.
 * @returns {Response} Réponse mock.
 */
function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('extractHttpError', (): void => {
  it('extrait error.message au format ProblemDetail imbriqué', async (): Promise<void> => {
    const response: Response = jsonResponse(400, {
      error: { message: 'Email déjà utilisé' },
    })

    await expect(extractHttpError(response)).resolves.toBe('Email déjà utilisé')
  })

  it('extrait message au premier niveau', async (): Promise<void> => {
    const response: Response = jsonResponse(422, { message: 'Validation failed' })

    await expect(extractHttpError(response)).resolves.toBe('Validation failed')
  })

  it('extrait err_msg si présent', async (): Promise<void> => {
    const response: Response = jsonResponse(500, { err_msg: 'Upstream failure' })

    await expect(extractHttpError(response)).resolves.toBe('Upstream failure')
  })

  it('retombe sur le statut HTTP si le corps est vide', async (): Promise<void> => {
    const response: Response = new Response('', { status: 503 })

    await expect(extractHttpError(response)).resolves.toBe('HTTP 503')
  })

  it('ignore un error sans message string', async (): Promise<void> => {
    const response: Response = jsonResponse(400, { error: { code: 42 } })

    await expect(extractHttpError(response)).resolves.toBe('HTTP 400')
  })
})

describe('resolveFetch', (): void => {
  beforeEach((): void => {
    vi.stubGlobal('window', globalThis as unknown as Window & typeof globalThis)
    Reflect.deleteProperty(globalThis as object, '__TAURI_INTERNALS__')
  })

  afterEach((): void => {
    Reflect.deleteProperty(globalThis as object, '__TAURI_INTERNALS__')
    vi.unstubAllGlobals()
  })

  it('retourne fetch natif hors Tauri', (): void => {
    const resolved: typeof globalThis.fetch = resolveFetch()

    expect(resolved).toBeTypeOf('function')
    expect(resolved).not.toBe(tauriFetchMock)
  })

  it('retourne le fetch Tauri dans le shell', (): void => {
    Object.defineProperty(globalThis, '__TAURI_INTERNALS__', {
      value: {},
      configurable: true,
    })

    expect(resolveFetch()).toBe(tauriFetchMock)
  })
})
