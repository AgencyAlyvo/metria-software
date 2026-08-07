import { describe, expect, it } from 'vitest'

import {
  CONSUMPTION_PAGE_COPY,
  defaultUsageRange,
  formatMoneyCents,
  findUserSpendCents,
  type UsageRange,
} from '#src-core/types/domain/usage.types'
import type { UsageResponse } from '#src-core/types/response/usage.types'

describe('formatMoneyCents', (): void => {
  it('formate les centimes EUR en euros', (): void => {
    expect(formatMoneyCents(250, 'EUR')).toBe('2,50\u00a0€')
    expect(formatMoneyCents(0, 'EUR')).toBe('0,00\u00a0€')
    expect(formatMoneyCents(49900, 'EUR')).toBe('499,00\u00a0€')
  })
})

describe('defaultUsageRange', (): void => {
  it('retourne le début du mois UTC jusqu’à maintenant', (): void => {
    const now: Date = new Date('2026-08-07T15:30:00.000Z')
    const range: UsageRange = defaultUsageRange(now)

    expect(range.from).toBe('2026-08-01T00:00:00.000Z')
    expect(range.to).toBe('2026-08-07T15:30:00.000Z')
  })
})

describe('findUserSpendCents', (): void => {
  it('extrait le spend du user courant dans byUser', (): void => {
    const usage: UsageResponse = {
      organizationTotal: { amountCents: 500, currency: 'EUR' },
      byUser: [
        { userId: '11111111-1111-1111-1111-111111111111', amountCents: 200, currency: 'EUR' },
        { userId: '22222222-2222-2222-2222-222222222222', amountCents: 300, currency: 'EUR' },
      ],
    }

    expect(findUserSpendCents(usage, '22222222-2222-2222-2222-222222222222')).toBe(300)
    expect(findUserSpendCents(usage, '33333333-3333-3333-3333-333333333333')).toBe(0)
    expect(findUserSpendCents(usage, undefined)).toBe(0)
  })
})

describe('CONSUMPTION_PAGE_COPY', (): void => {
  it('titre la page Consommation', (): void => {
    expect(CONSUMPTION_PAGE_COPY.title).toBe('Consommation')
  })
})
