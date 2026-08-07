import { describe, expect, it } from 'vitest'

import { formatTrialBannerLabel, remainingTrialDays } from '#src-core/utils/trial'

describe('remainingTrialDays', (): void => {
  it('retourne 5 jours au démarrage d’un essai de 5 jours', (): void => {
    const now: Date = new Date('2026-08-07T12:00:00.000Z')
    const trialEndsAt: Date = new Date('2026-08-12T12:00:00.000Z')

    expect(remainingTrialDays(trialEndsAt, now)).toBe(5)
  })

  it('arrondit au jour supérieur restant (J-1 si < 24 h)', (): void => {
    const now: Date = new Date('2026-08-12T10:00:00.000Z')
    const trialEndsAt: Date = new Date('2026-08-12T12:00:00.000Z')

    expect(remainingTrialDays(trialEndsAt, now)).toBe(1)
  })

  it('retourne 0 quand l’essai est expiré', (): void => {
    const now: Date = new Date('2026-08-13T00:00:00.000Z')
    const trialEndsAt: Date = new Date('2026-08-12T12:00:00.000Z')

    expect(remainingTrialDays(trialEndsAt, now)).toBe(0)
  })

  it('accepte une date ISO string', (): void => {
    const now: Date = new Date('2026-08-10T12:00:00.000Z')

    expect(remainingTrialDays('2026-08-12T12:00:00.000Z', now)).toBe(2)
  })
})

describe('formatTrialBannerLabel', (): void => {
  it('formate le bandeau « essai : J-x »', (): void => {
    expect(formatTrialBannerLabel(5)).toBe('essai : J-5')
    expect(formatTrialBannerLabel(1)).toBe('essai : J-1')
    expect(formatTrialBannerLabel(0)).toBe('essai : J-0')
  })
})
