import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { getMock, updateMock }: { getMock: Mock; updateMock: Mock } = vi.hoisted(
  (): { getMock: Mock; updateMock: Mock } => {
    return { getMock: vi.fn(), updateMock: vi.fn() }
  },
)

vi.mock('#src-core/services/AiPreferenceApiService', (): Record<string, unknown> => {
  return {
    AiPreferenceApiService: {
      /**
       * Mock get.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      get: (...args: unknown[]): unknown => getMock(...args),
      /**
       * Mock update.
       * @param {...unknown[]} args - Arguments.
       * @returns {unknown} Résultat mock.
       */
      update: (...args: unknown[]): unknown => updateMock(...args),
    },
  }
})

import { ApiHttpError } from '#src-core/types/http/api-http-error'
import { useAiPreferenceStore } from '#src-nuxt/app/stores/aiPreference.store'

describe('useAiPreferenceStore', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('charge la préférence courante depuis core-api', async (): Promise<void> => {
    getMock.mockResolvedValue({ provider: 'ANTHROPIC', model: 'claude-sonnet-5' })
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()

    await store.load()

    expect(store.provider).toBe('ANTHROPIC')
    expect(store.model).toBe('claude-sonnet-5')
    expect(store.displayLabel).toBe('Équilibré (claude-sonnet-5)')
    expect(store.loading).toBe(false)
    expect(store.error).toBeUndefined()
  })

  it('refuse de sélectionner un modèle local (bientôt disponible)', async (): Promise<void> => {
    getMock.mockResolvedValue({ provider: 'ANTHROPIC', model: 'claude-sonnet-5' })
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()
    await store.load()

    await store.select('LOCAL', 'local-default')

    expect(updateMock).not.toHaveBeenCalled()
    expect(store.error).toBeDefined()
    expect(store.provider).toBe('ANTHROPIC')
  })

  it('persiste une préférence cloud via PUT', async (): Promise<void> => {
    getMock.mockResolvedValue({ provider: 'ANTHROPIC', model: 'claude-sonnet-5' })
    updateMock.mockResolvedValue({ provider: 'OPENAI', model: 'gpt-5.6-terra' })
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()
    await store.load()

    await store.select('OPENAI', 'gpt-5.6-terra')

    expect(updateMock).toHaveBeenCalledWith({ provider: 'OPENAI', model: 'gpt-5.6-terra' })
    expect(store.provider).toBe('OPENAI')
    expect(store.model).toBe('gpt-5.6-terra')
    expect(store.displayLabel).toBe('Équilibré (gpt-5.6-terra)')
  })

  it('expose le détail ApiHttpError si le GET échoue', async (): Promise<void> => {
    getMock.mockRejectedValue(new ApiHttpError(500, 'preference down'))
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()

    await store.load()

    expect(store.error).toBe('preference down')
    expect(store.loading).toBe(false)
  })

  it('expose une erreur générique si le GET échoue hors ApiHttpError', async (): Promise<void> => {
    getMock.mockRejectedValue(new Error('network'))
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()

    await store.load()

    expect(store.error).toBe('Impossible d’enregistrer la préférence IA.')
  })

  it('expose une erreur générique si le PUT échoue hors ApiHttpError', async (): Promise<void> => {
    getMock.mockResolvedValue({ provider: 'ANTHROPIC', model: 'claude-sonnet-5' })
    updateMock.mockRejectedValue(new Error('boom'))
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()
    await store.load()

    await store.select('OPENAI', 'gpt-5.6-sol')

    expect(store.error).toBe('Impossible d’enregistrer la préférence IA.')
    expect(store.saving).toBe(false)
  })

  it('expose le détail ApiHttpError si le PUT échoue', async (): Promise<void> => {
    getMock.mockResolvedValue({ provider: 'ANTHROPIC', model: 'claude-sonnet-5' })
    updateMock.mockRejectedValue(new ApiHttpError(422, 'invalid model'))
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()
    await store.load()

    await store.select('OPENAI', 'gpt-5.6-sol')

    expect(store.error).toBe('invalid model')
  })

  it('affiche un fallback si le modèle API est inconnu du catalogue', async (): Promise<void> => {
    getMock.mockResolvedValue({ provider: 'ANTHROPIC', model: 'unknown-model' })
    const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()

    await store.load()

    expect(store.displayLabel).toBe('unknown-model (unknown-model)')
  })
})
