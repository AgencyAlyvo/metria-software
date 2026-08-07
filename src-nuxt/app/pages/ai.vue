<template>
  <div class="flex h-full flex-col gap-8 px-8 py-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-white">{{ copy.title }}</h1>
      <p class="max-w-2xl text-sm text-[#9ba3bd]">{{ copy.subtitle }}</p>
      <p v-if="store.displayLabel" class="text-sm text-[#c5cce3]">
        Sélection actuelle :
        <span class="font-medium text-white">{{ store.displayLabel }}</span>
      </p>
      <p v-if="store.error" class="text-sm text-red-300" role="alert">{{ store.error }}</p>
    </header>

    <div v-if="store.loading" class="text-sm text-[#9ba3bd]">Chargement…</div>

    <div v-else class="flex flex-col gap-6">
      <section
        v-for="group in catalog"
        :key="group.provider"
        class="max-w-2xl rounded-xl border border-[#2f3d67] bg-[rgba(5,9,23,0.55)] p-5"
        :aria-labelledby="`provider-${group.provider}`"
      >
        <div class="mb-4 flex items-center gap-3">
          <h2 :id="`provider-${group.provider}`" class="text-lg font-semibold text-white">
            {{ group.providerLabel }}
          </h2>
          <span v-if="group.comingSoon" class="rounded border border-[#485780] px-2 py-0.5 text-xs text-[#9ba3bd]">
            {{ group.comingSoonBadge }}
          </span>
        </div>

        <ul class="flex flex-col gap-2">
          <li v-for="option in group.options" :key="option.model">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition"
              :class="optionButtonClass(group.provider, option.model, option.selectable)"
              :disabled="!option.selectable || store.saving"
              :aria-pressed="isSelected(group.provider, option.model)"
              @click="onSelect(group.provider, option.model)"
            >
              <span>{{ formatLabel(option.label, option.model) }}</span>
              <span v-if="isSelected(group.provider, option.model)" class="text-[#9a65d5]">✓</span>
            </button>
          </li>
        </ul>
      </section>
    </div>

    <div>
      <NuxtLink to="/home" class="text-sm text-[#9a65d5] underline-offset-4 hover:text-white hover:underline">
        Retour à l’accueil
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AI_CATALOG,
  AI_PAGE_COPY,
  formatAiOptionLabel,
  type AiProviderId,
  type AiProviderGroup,
} from '#src-core/types/domain/ai.types'
import { useAiPreferenceStore } from '#src-nuxt/app/stores/aiPreference.store'
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'
import { useTrialStore } from '#src-nuxt/app/stores/trial.store'
import { TauriWindowService } from '#src-core/services/TauriWindowService'

definePageMeta({
  layout: 'home',
})

const copy: typeof AI_PAGE_COPY = AI_PAGE_COPY
const catalog: AiProviderGroup[] = AI_CATALOG

const store: ReturnType<typeof useAiPreferenceStore> = useAiPreferenceStore()
const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
const trialStore: ReturnType<typeof useTrialStore> = useTrialStore()

/**
 * Libellé grand public + id technique.
 * @param {string} label - Libellé.
 * @param {string} model - Id technique.
 * @returns {string} Texte affiché.
 */
function formatLabel(label: string, model: string): string {
  return formatAiOptionLabel(label, model)
}

/**
 * Indique si l'option est la préférence courante.
 * @param {AiProviderId} provider - Provider.
 * @param {string} model - Modèle.
 * @returns {boolean} true si sélectionnée.
 */
function isSelected(provider: AiProviderId, model: string): boolean {
  return store.provider === provider && store.model === model
}

/**
 * Classes CSS du bouton option.
 * @param {AiProviderId} provider - Provider.
 * @param {string} model - Modèle.
 * @param {boolean} selectable - Option souscriptible.
 * @returns {string} Classes.
 */
function optionButtonClass(provider: AiProviderId, model: string, selectable: boolean): string {
  if (!selectable) {
    return 'cursor-not-allowed border-[#2f3d67] bg-[#121a2e] text-[#626d90]'
  }

  if (isSelected(provider, model)) {
    return 'border-[#9a65d5] bg-[rgba(154,101,213,0.15)] text-white'
  }

  return 'border-[#2f3d67] bg-[#0f172a] text-[#c5cce3] hover:border-[#485780] hover:text-white'
}

/**
 * Persiste la sélection cloud.
 * @param {AiProviderId} provider - Provider.
 * @param {string} model - Modèle.
 * @returns {Promise<void>}
 */
async function onSelect(provider: AiProviderId, model: string): Promise<void> {
  await store.select(provider, model)
}

onMounted(async (): Promise<void> => {
  authStore.restoreSession()
  trialStore.refresh()
  await TauriWindowService.configureMainWindow()
  await store.load()
})
</script>
