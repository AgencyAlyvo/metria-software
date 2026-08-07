/**
 * Réponse bearer renvoyée par `POST /signin`.
 */
export type SignInResponse = {
  type: 'bearer'
  value: string
  expiresAt: string | null
}

/**
 * Réponse bearer renvoyée par `POST /signup`.
 */
export type SignUpResponse = {
  type: 'bearer'
  value: string
  expiresAt: string | null
}
