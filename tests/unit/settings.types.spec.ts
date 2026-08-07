import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS, type AppSettings } from '#src-core/types/domain/settings.types'

describe('AppSettings', (): void => {
  it('fournit des défauts génériques sans domaine entretien', (): void => {
    const settings: AppSettings = { ...DEFAULT_SETTINGS }

    expect(settings).toEqual({ locale: 'fr' })
    expect(settings).not.toHaveProperty('deepgramApiKey')
    expect(settings).not.toHaveProperty('sttProvider')
    expect(settings).not.toHaveProperty('anthropicApiKey')
  })
})
