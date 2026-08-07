import { resolveFetch } from '#src-core/utils/http'
import { ApiHttpError, type ApiErrorBody } from '#src-core/types/http/api-http-error'

/**
 * Options HTTP communes aux services API métier.
 */
type HttpClientRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Record<string, unknown>
  body?: unknown
  headers?: Record<string, string>
}

/**
 * Configuration injectée depuis le bootstrap Nuxt (plugin).
 */
export type HttpClientServiceConfig = {
  apiBaseUrl: string
  getAuthToken: () => string | undefined
}

/**
 * Client HTTP authentifié pour l'API Metria core-api.
 * Ne dépend pas de Nuxt/Pinia : l'URL et le getter de token sont injectés via configure().
 */
export class HttpClientService {
  /**
   * URL de base de l'API injectée au démarrage (sans slash final).
   */
  private static _apiBaseUrl: string = ''

  /**
   * Getter du token bearer injecté au démarrage (ex. depuis le store auth côté Nuxt).
   * @returns {string | undefined} Token courant ou undefined.
   */
  private static _getAuthToken: () => string | undefined = (): string | undefined => undefined

  /**
   * Injecte l'URL de base et le port de lecture du token d'auth.
   * @param {HttpClientServiceConfig} config - Configuration runtime.
   * @returns {void}
   */
  public static configure(config: HttpClientServiceConfig): void {
    this._apiBaseUrl = config.apiBaseUrl.trim().replace(/\/$/, '')
    this._getAuthToken = config.getAuthToken
  }

  /**
   * Résout l'URL de base de l'API injectée.
   * @returns {string} URL de base normalisée.
   */
  private static resolveBaseUrl(): string {
    return this._apiBaseUrl
  }

  /**
   * Sérialise un objet de query en query string.
   * Les tableaux utilisent la notation bracket (key[]=val).
   * @param {Record<string, unknown>} query - Paramètres à sérialiser.
   * @returns {string} Query string sans le '?' initial.
   */
  private static buildQueryString(query: Record<string, unknown>): string {
    const parts: string[] = []

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(item))}`)
          }
        }
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      }
    }

    return parts.join('&')
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
   * Exécute une requête API authentifiée.
   * @param {string} path - Chemin API.
   * @param {HttpClientRequestOptions} options - Options de requête.
   * @template T
   * @returns {Promise<T>} Réponse typée.
   */
  public static async request<T>(path: string, options: HttpClientRequestOptions = {}): Promise<T> {
    const baseURL: string = this.resolveBaseUrl()
    const authToken: string | undefined = this._getAuthToken()

    if (!baseURL) {
      throw new Error('API base URL is not configured')
    }

    let fullPath: string = path

    if (options.query) {
      const qs: string = this.buildQueryString(options.query)

      if (qs) {
        fullPath = `${path}?${qs}`
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    }

    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers,
    }

    if (options.body !== undefined) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
      init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
    }

    const response: Response = await resolveFetch()(`${baseURL}${fullPath}`, init)

    if (!response.ok) {
      throw await this.toHttpError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }
}
