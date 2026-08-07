import { resolveFetch } from '#src-core/utils/http'
import type { LoginPayload, SignUpPayload } from '#src-core/types/payload/auth.types'
import type { SignInResponse, SignUpResponse } from '#src-core/types/response/auth.types'
import { ApiHttpError, type ApiErrorBody } from '#src-core/types/http/api-http-error'

/**
 * Service dédié aux appels HTTP vers les endpoints d'authentification core-api.
 */
export class AuthApiService {
  /**
   * Résout l'URL de base de l'API depuis la configuration Nuxt runtime.
   * @returns {string} URL de base normalisée.
   */
  private static resolveBaseUrl(): string {
    const runtimeConfig: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig()
    return String(runtimeConfig.public.apiBaseUrl || '').replace(/\/$/, '')
  }

  /**
   * Convertit une réponse HTTP en échec en ApiHttpError.
   * @param {Response} response - Réponse non-ok.
   * @returns {Promise<ApiHttpError>} Erreur structurée.
   */
  private static async toHttpError(response: Response): Promise<ApiHttpError> {
    let body: ApiErrorBody | undefined

    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      body = undefined
    }

    const message: string = body?.detail || body?.message || body?.errors?.[0]?.message || `HTTP ${response.status}`

    return new ApiHttpError(response.status, message, body)
  }

  /**
   * Envoie les identifiants au endpoint signin et retourne le token bearer.
   * @param {LoginPayload} payload - Email et mot de passe saisis.
   * @returns {Promise<SignInResponse>} Token bearer retourné par core-api.
   */
  public static async signIn(payload: LoginPayload): Promise<SignInResponse> {
    const baseURL: string = this.resolveBaseUrl()

    if (!baseURL) {
      throw new Error('API base URL is not configured')
    }

    const response: Response = await resolveFetch()(`${baseURL}/signin`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw await this.toHttpError(response)
    }

    return (await response.json()) as SignInResponse
  }

  /**
   * Envoie les données d'inscription au endpoint signup et retourne le token bearer.
   * @param {SignUpPayload} payload - Email, mot de passe et confirmation saisis.
   * @returns {Promise<SignUpResponse>} Token bearer retourné par core-api.
   */
  public static async signUp(payload: SignUpPayload): Promise<SignUpResponse> {
    const baseURL: string = this.resolveBaseUrl()

    if (!baseURL) {
      throw new Error('API base URL is not configured')
    }

    const response: Response = await resolveFetch()(`${baseURL}/signup`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw await this.toHttpError(response)
    }

    return (await response.json()) as SignUpResponse
  }

  /**
   * Révoque le token actif côté API via le endpoint logout.
   * @param {string} token - Token bearer à révoquer.
   * @returns {Promise<void>}
   */
  public static async signOut(token: string): Promise<void> {
    const baseURL: string = this.resolveBaseUrl()

    if (!baseURL) {
      return
    }

    const response: Response = await resolveFetch()(`${baseURL}/logout`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      throw await this.toHttpError(response)
    }
  }
}
