/**
 * Identifiant provider aligné sur core-api (`AiProvider`).
 */
export type AiProviderId = 'ANTHROPIC' | 'OPENAI' | 'LOCAL'

/**
 * Option modèle affichée dans « Choix de l'IA ».
 */
export type AiModelOption = {
  model: string
  label: string
  selectable: boolean
}

/**
 * Groupe provider du catalogue V1.
 */
export type AiProviderGroup = {
  provider: AiProviderId
  providerLabel: string
  comingSoon: boolean
  comingSoonBadge?: string
  options: AiModelOption[]
}

/**
 * Copie de la page `/ai`.
 */
export type AiPageCopy = {
  title: string
  subtitle: string
  saveError: string
  localBlocked: string
}

/**
 * Catalogue IA V1 — libellés grand public, id technique entre parenthèses à l'affichage.
 * Aligné sur `AiPreference` / modèles autorisés de metria-backend-core.
 */
export const AI_CATALOG: AiProviderGroup[] = [
  {
    provider: 'ANTHROPIC',
    providerLabel: 'Anthropic (premium)',
    comingSoon: false,
    options: [
      { model: 'claude-fable-5', label: 'Excellence', selectable: true },
      { model: 'claude-opus-5', label: 'Haut de gamme', selectable: true },
      { model: 'claude-sonnet-5', label: 'Équilibré', selectable: true },
      { model: 'claude-haiku-5', label: 'Essentiel', selectable: true },
    ],
  },
  {
    provider: 'OPENAI',
    providerLabel: 'OpenAI',
    comingSoon: false,
    options: [
      { model: 'gpt-5.6-sol', label: 'Haut de gamme', selectable: true },
      { model: 'gpt-5.6-terra', label: 'Équilibré', selectable: true },
      { model: 'gpt-5.6-luna', label: 'Essentiel', selectable: true },
    ],
  },
  {
    provider: 'LOCAL',
    providerLabel: 'Modèles locaux',
    comingSoon: true,
    comingSoonBadge: 'bientôt disponible',
    options: [{ model: 'local-default', label: 'Local', selectable: false }],
  },
]

/**
 * Textes de la page choix IA.
 */
export const AI_PAGE_COPY: AiPageCopy = {
  title: 'Choix de l’IA',
  subtitle: 'Sélectionnez le modèle utilisé pour votre organisation.',
  saveError: 'Impossible d’enregistrer la préférence IA.',
  localBlocked: 'Les modèles locaux seront bientôt disponibles.',
}

/**
 * Formate un libellé grand public avec le nom technique entre parenthèses.
 * @param {string} label - Libellé grand public.
 * @param {string} model - Identifiant technique du modèle.
 * @returns {string} Libellé affiché.
 */
export function formatAiOptionLabel(label: string, model: string): string {
  return `${label} (${model})`
}

/**
 * Retrouve une option du catalogue.
 * @param {AiProviderId} provider - Provider.
 * @param {string} model - Identifiant modèle.
 * @returns {AiModelOption | undefined} Option ou undefined.
 */
export function findAiOption(provider: AiProviderId, model: string): AiModelOption | undefined {
  const group: AiProviderGroup | undefined = AI_CATALOG.find(
    (entry: AiProviderGroup): boolean => entry.provider === provider,
  )
  return group?.options.find((option: AiModelOption): boolean => option.model === model)
}

/**
 * Indique si l'option peut être souscrite / sélectionnée.
 * @param {AiModelOption | undefined} option - Option catalogue.
 * @returns {boolean} true si sélectionnable.
 */
export function isAiOptionSelectable(option: AiModelOption | undefined): boolean {
  return option?.selectable === true
}
