/**
 * Payload de connexion core-api (`POST /signin`).
 */
export type LoginPayload = {
  email: string
  password: string
}

/**
 * Payload d'inscription core-api (`POST /signup`).
 */
export type SignUpPayload = {
  email: string
  password: string
  passwordConfirmation: string
}
