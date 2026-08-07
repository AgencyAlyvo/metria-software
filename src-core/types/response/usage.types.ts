/**
 * Montant monétaire (`UsageResponse.MoneyResponse`).
 */
export type MoneyResponse = {
  amountCents: number
  currency: string
}

/**
 * Ligne spend par utilisateur (`UsageResponse.UserUsageResponse`).
 */
export type UserUsageResponse = {
  userId: string
  amountCents: number
  currency: string
}

/**
 * Réponse core-api `GET /usage`.
 */
export type UsageResponse = {
  organizationTotal: MoneyResponse
  byUser: UserUsageResponse[]
}
