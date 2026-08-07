import { describe, expect, it } from 'vitest'

import {
  AI_CATALOG,
  AI_PAGE_COPY,
  formatAiOptionLabel,
  findAiOption,
  isAiOptionSelectable,
  type AiModelOption,
  type AiProviderGroup,
  type AiProviderId,
} from '#src-core/types/domain/ai.types'

describe('AI_CATALOG', (): void => {
  it('expose Anthropic premium avec les 4 libellés grand public', (): void => {
    const anthropic: AiProviderGroup | undefined = AI_CATALOG.find(
      (group: AiProviderGroup): boolean => group.provider === 'ANTHROPIC',
    )

    expect(anthropic?.providerLabel).toBe('Anthropic (premium)')
    expect(anthropic?.options.map((o: AiModelOption): string => o.model)).toEqual([
      'claude-fable-5',
      'claude-opus-5',
      'claude-sonnet-5',
      'claude-haiku-5',
    ])
    expect(anthropic?.options.map((o: AiModelOption): string => o.label)).toEqual([
      'Excellence',
      'Haut de gamme',
      'Équilibré',
      'Essentiel',
    ])
  })

  it('expose OpenAI avec les 3 libellés grand public', (): void => {
    const openai: AiProviderGroup | undefined = AI_CATALOG.find(
      (group: AiProviderGroup): boolean => group.provider === 'OPENAI',
    )

    expect(openai?.providerLabel).toBe('OpenAI')
    expect(openai?.options.map((o: AiModelOption): string => o.model)).toEqual([
      'gpt-5.6-sol',
      'gpt-5.6-terra',
      'gpt-5.6-luna',
    ])
    expect(openai?.options.map((o: AiModelOption): string => o.label)).toEqual([
      'Haut de gamme',
      'Équilibré',
      'Essentiel',
    ])
  })

  it('marque les modèles locaux comme bientôt disponible et non souscriptibles', (): void => {
    const local: AiProviderGroup | undefined = AI_CATALOG.find(
      (group: AiProviderGroup): boolean => group.provider === 'LOCAL',
    )

    expect(local?.comingSoon).toBe(true)
    expect(local?.comingSoonBadge).toBe('bientôt disponible')
    expect(local?.options.every((o: AiModelOption): boolean => o.selectable === false)).toBe(true)
  })
})

describe('formatAiOptionLabel', (): void => {
  it('affiche le libellé grand public avec le nom technique entre parenthèses', (): void => {
    expect(formatAiOptionLabel('Équilibré', 'claude-sonnet-5')).toBe('Équilibré (claude-sonnet-5)')
  })
})

describe('findAiOption / isAiOptionSelectable', (): void => {
  it('retrouve une option cloud sélectionnable', (): void => {
    const option: AiModelOption | undefined = findAiOption('ANTHROPIC' as AiProviderId, 'claude-sonnet-5')

    expect(option?.label).toBe('Équilibré')
    expect(isAiOptionSelectable(option)).toBe(true)
  })

  it('refuse la sélection d’un modèle local', (): void => {
    const option: AiModelOption | undefined = findAiOption('LOCAL' as AiProviderId, 'local-default')

    expect(isAiOptionSelectable(option)).toBe(false)
  })
})

describe('AI_PAGE_COPY', (): void => {
  it('titre la page Choix de l’IA', (): void => {
    expect(AI_PAGE_COPY.title).toBe('Choix de l’IA')
  })
})
