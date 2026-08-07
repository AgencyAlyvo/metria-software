import { describe, expect, it } from 'vitest'

import { BUSINESS_PLAN, PRICING_PAGE_COPY } from '#src-core/types/domain/pricing.types'

describe('BUSINESS_PLAN', (): void => {
  it('aligne le plan Business V1 sur core billing (499 €, 3 users, +50 €)', (): void => {
    expect(BUSINESS_PLAN.name).toBe('Business')
    expect(BUSINESS_PLAN.monthlyPriceEuros).toBe(499)
    expect(BUSINESS_PLAN.includedUsers).toBe(3)
    expect(BUSINESS_PLAN.extraUserPriceEuros).toBe(50)
    expect(BUSINESS_PLAN.trialDays).toBe(5)
  })

  it('expose la conso IA à l’usage et les modèles locaux bientôt disponibles', (): void => {
    expect(BUSINESS_PLAN.aiConsumption).toBe('à l’usage')
    expect(BUSINESS_PLAN.localModels.label).toBe('Modèles locaux')
    expect(BUSINESS_PLAN.localModels.status).toBe('bientôt disponible')
  })
})

describe('PRICING_PAGE_COPY', (): void => {
  it('reste informatif sans checkout Stripe (BACKLOG)', (): void => {
    expect(PRICING_PAGE_COPY.checkoutCta).toContain('Bientôt')
    expect(PRICING_PAGE_COPY.checkoutDisabled).toBe(true)
  })
})
