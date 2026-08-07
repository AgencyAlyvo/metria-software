/**
 * Corps d'erreur ProblemDetail / core-api.
 */
export type ApiErrorBody = {
  detail?: string
  title?: string
  message?: string
  code?: string
  errors?: { message: string }[]
}

/**
 * Erreur HTTP normalisée pour les appels core-api.
 */
export class ApiHttpError extends Error {
  public readonly status: number
  public readonly code: string | undefined
  public readonly body: ApiErrorBody | undefined

  /**
   * @param {number} status - Code HTTP.
   * @param {string} message - Message lisible.
   * @param {ApiErrorBody | undefined} body - Corps JSON optionnel.
   */
  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
    this.body = body
    this.code = body?.code
  }
}
