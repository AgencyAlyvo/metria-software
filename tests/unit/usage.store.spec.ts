import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { getMock }: { getMock: Mock } = vi.hoisted((): { getMock: Mock } => {
  return { getMock: vi.fn() }
})

vi.mock('#src-core/services/UsageApiService', (): Record<string, unknown> => {
  return {
    UsageApiService: {
      /**
       * Mock get.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      get: (...args: unknown[]): unknown => getMock(...args),
    },
  }
})

vi.mock('#src-nuxt/app/stores/auth.store', (): Record<string, unknown> => {
  return {
    /**
     * Mock auth store.
     * @returns {{ authToken: string }} Store auth.
     */
    useAuthStore: (): { authToken: string } => {
      const header: string = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
      const payload: string = Buffer.from(JSON.stringify({ sub: '22222222-2222-2222-2222-222222222222' })).toString(
        'base64url',
      )
      return { authToken: `${header}.${payload}.sig` }
    },
  }
})

import { ApiHttpError } from '#src-core/types/http/api-http-error'
import { useUsageStore } from '#src-nuxt/app/stores/usage.store'

describe('useUsageStore', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('charge organisationTotal et spend user courant', async (): Promise<void> => {
    getMock.mockResolvedValue({
      organizationTotal: { amountCents: 500, currency: 'EUR' },
      byUser: [
        { userId: '11111111-1111-1111-1111-111111111111', amountCents: 200, currency: 'EUR' },
        { userId: '22222222-2222-2222-2222-222222222222', amountCents: 300, currency: 'EUR' },
      ],
    })
    const store: ReturnType<typeof useUsageStore> = useUsageStore()
    const now: Date = new Date('2026-08-07T12:00:00.000Z')

    await store.load(now)

    expect(getMock).toHaveBeenCalledWith({
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-07T12:00:00.000Z',
    })
    expect(store.organizationLabel).toBe('5,00\u00a0€')
    expect(store.userLabel).toBe('3,00\u00a0€')
    expect(store.loading).toBe(false)
  })

  it('expose le détail ApiHttpError si le GET échoue', async (): Promise<void> => {
    getMock.mockRejectedValue(new ApiHttpError(503, 'usage unavailable'))
    const store: ReturnType<typeof useUsageStore> = useUsageStore()

    await store.load(new Date('2026-08-07T12:00:00.000Z'))

    expect(store.error).toBe('usage unavailable')
    expect(store.organizationLabel).toBeUndefined()
    expect(store.userLabel).toBeUndefined()
    expect(store.loading).toBe(false)
  })

  it('expose une erreur générique hors ApiHttpError', async (): Promise<void> => {
    getMock.mockRejectedValue(new Error('down'))
    const store: ReturnType<typeof useUsageStore> = useUsageStore()

    await store.load(new Date('2026-08-07T12:00:00.000Z'))

    expect(store.error).toBe('Impossible de charger la consommation.')
  })

  it('fallback EUR si la devise est absente', async (): Promise<void> => {
    getMock.mockResolvedValue({
      organizationTotal: { amountCents: 100, currency: '' },
      byUser: [],
    })
    const store: ReturnType<typeof useUsageStore> = useUsageStore()

    await store.load(new Date('2026-08-07T12:00:00.000Z'))

    expect(store.organizationLabel).toBe('1,00\u00a0€')
    expect(store.userLabel).toBe('0,00\u00a0€')
  })
})
