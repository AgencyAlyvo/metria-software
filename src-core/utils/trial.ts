const MS_PER_DAY: number = 24 * 60 * 60 * 1000

/**
 * Calcule le nombre de jours d'essai restants (arrondi supérieur, min 0).
 * @param {Date | string} trialEndsAt - Fin d'essai (Date ou ISO).
 * @param {Date} [now] - Instant de référence (défaut : maintenant).
 * @returns {number} Jours restants (≥ 0).
 */
export const remainingTrialDays: (trialEndsAt: Date | string, now?: Date) => number = (
  trialEndsAt: Date | string,
  now: Date = new Date(),
): number => {
  const end: Date = typeof trialEndsAt === 'string' ? new Date(trialEndsAt) : trialEndsAt
  const deltaMs: number = end.getTime() - now.getTime()

  if (Number.isNaN(end.getTime()) || deltaMs <= 0) {
    return 0
  }

  return Math.ceil(deltaMs / MS_PER_DAY)
}

/**
 * Libellé du bandeau shell « essai : J-x ».
 * @param {number} daysRemaining - Jours restants (≥ 0).
 * @returns {string} Libellé affiché.
 */
export const formatTrialBannerLabel: (daysRemaining: number) => string = (daysRemaining: number): string => {
  const safeDays: number = Math.max(0, Math.floor(daysRemaining))
  return `essai : J-${safeDays}`
}
