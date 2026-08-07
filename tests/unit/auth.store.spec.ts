import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const {
  signInMock,
  signUpMock,
  signOutMock,
  disableAutoLoginMock,
}: {
  signInMock: Mock
  signUpMock: Mock
  signOutMock: Mock
  disableAutoLoginMock: Mock
} = vi.hoisted(
  (): {
    signInMock: Mock
    signUpMock: Mock
    signOutMock: Mock
    disableAutoLoginMock: Mock
  } => {
    return {
      signInMock: vi.fn(),
      signUpMock: vi.fn(),
      signOutMock: vi.fn(),
      disableAutoLoginMock: vi.fn(),
    }
  },
)

vi.mock('#src-core/services/AuthApiService', (): Record<string, unknown> => {
  return {
    AuthApiService: {
      /**
       * Mock signIn.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      signIn: (...args: unknown[]): unknown => signInMock(...args),
      /**
       * Mock signUp.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      signUp: (...args: unknown[]): unknown => signUpMock(...args),
      /**
       * Mock signOut.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      signOut: (...args: unknown[]): unknown => signOutMock(...args),
    },
  }
})

vi.mock('#src-core/services/CredentialsStorageService', (): Record<string, unknown> => {
  return {
    CredentialsStorageService: {
      /**
       * Mock disableAutoLogin.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      disableAutoLogin: (...args: unknown[]): unknown => disableAutoLoginMock(...args),
    },
  }
})

import { useAuthStore } from '#src-nuxt/app/stores/auth.store'

/**
 * Polyfill localStorage minimal pour l'environnement node de vitest.
 */
class MemoryStorage implements Storage {
  private readonly store: Map<string, string> = new Map()

  /**
   * Nombre d'entrées stockées.
   * @returns {number} Taille.
   */
  public get length(): number {
    return this.store.size
  }

  /**
   * Vide le stockage.
   * @returns {void}
   */
  public clear(): void {
    this.store.clear()
  }

  /**
   * Lit une entrée.
   * @param {string} key - Clé.
   * @returns {string | null} Valeur ou null.
   */
  public getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  /**
   * Retourne la clé à l'index donné.
   * @param {number} index - Index.
   * @returns {string | null} Clé ou null.
   */
  public key(index: number): string | null {
    return [...this.store.keys()][index] ?? null
  }

  /**
   * Supprime une entrée.
   * @param {string} key - Clé.
   * @returns {void}
   */
  public removeItem(key: string): void {
    this.store.delete(key)
  }

  /**
   * Écrit une entrée.
   * @param {string} key - Clé.
   * @param {string} value - Valeur.
   * @returns {void}
   */
  public setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}

describe('useAuthStore', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', new MemoryStorage())
  })

  afterEach((): void => {
    vi.unstubAllGlobals()
  })

  it('applique le token bearer après signIn et le persiste', async (): Promise<void> => {
    signInMock.mockResolvedValue({
      type: 'bearer',
      value: 'jwt-token',
      expiresAt: '2030-01-01T00:00:00Z',
    })

    const store: ReturnType<typeof useAuthStore> = useAuthStore()
    await store.signIn({ email: 'ada@metria.app', password: 'secret' })

    expect(store.authToken).toBe('jwt-token')
    expect(store.isAuthenticated).toBe(true)
    expect(store.userEmail).toBe('ada@metria.app')
    expect(localStorage.getItem('metria_auth_token')).toBe('jwt-token')
    expect(localStorage.getItem('metria_auth_email')).toBe('ada@metria.app')
  })

  it('restaure la session depuis localStorage', (): void => {
    localStorage.setItem('metria_auth_token', 'stored-token')
    localStorage.setItem('metria_auth_email', 'ada@metria.app')

    const store: ReturnType<typeof useAuthStore> = useAuthStore()
    store.restoreSession()

    expect(store.authToken).toBe('stored-token')
    expect(store.userEmail).toBe('ada@metria.app')
    expect(store.isAuthenticated).toBe(true)
  })

  it('efface la session locale après signOut', async (): Promise<void> => {
    signInMock.mockResolvedValue({
      type: 'bearer',
      value: 'jwt-token',
      expiresAt: null,
    })
    signOutMock.mockResolvedValue(undefined)
    disableAutoLoginMock.mockResolvedValue(undefined)

    const store: ReturnType<typeof useAuthStore> = useAuthStore()
    await store.signIn({ email: 'ada@metria.app', password: 'secret' })
    await store.signOut()

    expect(signOutMock).toHaveBeenCalledWith('jwt-token')
    expect(store.authToken).toBeUndefined()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('metria_auth_token')).toBeNull()
    expect(disableAutoLoginMock).toHaveBeenCalled()
  })

  it('applique le token après signUp', async (): Promise<void> => {
    signUpMock.mockResolvedValue({
      type: 'bearer',
      value: 'signup-token',
      expiresAt: null,
    })

    const store: ReturnType<typeof useAuthStore> = useAuthStore()
    await store.signUp({
      email: 'ada@metria.app',
      password: 'secret-password',
      passwordConfirmation: 'secret-password',
    })

    expect(store.authToken).toBe('signup-token')
    expect(store.isAuthenticated).toBe(true)
  })

  it('rejette un token bearer vide', async (): Promise<void> => {
    signInMock.mockResolvedValue({
      type: 'bearer',
      value: '   ',
      expiresAt: null,
    })

    const store: ReturnType<typeof useAuthStore> = useAuthStore()

    await expect(store.signIn({ email: 'ada@metria.app', password: 'secret' })).rejects.toThrow(
      'Authentication token is missing from signin response',
    )
  })

  it('efface quand même la session si logout API échoue', async (): Promise<void> => {
    signInMock.mockResolvedValue({
      type: 'bearer',
      value: 'jwt-token',
      expiresAt: null,
    })
    signOutMock.mockRejectedValue(new Error('network'))
    disableAutoLoginMock.mockResolvedValue(undefined)
    const consoleError: Mock = vi.spyOn(console, 'error').mockImplementation((): void => undefined) as unknown as Mock

    const store: ReturnType<typeof useAuthStore> = useAuthStore()
    await store.signIn({ email: 'ada@metria.app', password: 'secret' })
    await store.signOut()

    expect(store.isAuthenticated).toBe(false)
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
