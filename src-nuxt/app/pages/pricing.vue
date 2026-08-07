<template>
  <div class="flex h-full flex-col gap-8 px-8 py-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-white">{{ copy.title }}</h1>
      <p class="max-w-2xl text-sm text-[#9ba3bd]">{{ copy.subtitle }}</p>
    </header>

    <section
      class="max-w-xl rounded-xl border border-[#2f3d67] bg-[rgba(5,9,23,0.55)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      aria-labelledby="business-plan-title"
    >
      <div class="flex items-baseline justify-between gap-4">
        <h2 id="business-plan-title" class="text-xl font-semibold text-white">{{ plan.name }}</h2>
        <p class="text-2xl font-semibold text-white">
          {{ plan.monthlyPriceEuros }}&nbsp;€
          <span class="text-sm font-normal text-[#9ba3bd]">/ mois</span>
        </p>
      </div>

      <ul class="mt-5 flex flex-col gap-3 text-sm text-[#c5cce3]">
        <li>Essai {{ plan.trialDays }} jours inclus</li>
        <li>{{ plan.includedUsers }} utilisateurs inclus</li>
        <li>+{{ plan.extraUserPriceEuros }}&nbsp;€ / utilisateur supplémentaire</li>
        <li>Consommation IA {{ plan.aiConsumption }}</li>
        <li>
          {{ plan.localModels.label }}
          <span class="text-[#9ba3bd]">— {{ plan.localModels.status }}</span>
        </li>
      </ul>

      <div class="mt-6 flex flex-col gap-2">
        <button
          type="button"
          class="h-11 cursor-not-allowed rounded-md border border-[#485780] bg-[#1a243f] px-4 text-sm font-medium text-[#9ba3bd]"
          disabled
          :aria-disabled="true"
        >
          {{ copy.checkoutCta }}
        </button>
        <p class="text-xs text-[#626d90]">{{ copy.checkoutHint }}</p>
      </div>
    </section>

    <div>
      <NuxtLink to="/home" class="text-sm text-[#9a65d5] underline-offset-4 hover:text-white hover:underline">
        Retour à l’accueil
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BUSINESS_PLAN, PRICING_PAGE_COPY } from '#src-core/types/domain/pricing.types'
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'
import { useTrialStore } from '#src-nuxt/app/stores/trial.store'
import { TauriWindowService } from '#src-core/services/TauriWindowService'

definePageMeta({
  layout: 'home',
})

const plan: typeof BUSINESS_PLAN = BUSINESS_PLAN
const copy: typeof PRICING_PAGE_COPY = PRICING_PAGE_COPY

const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
const trialStore: ReturnType<typeof useTrialStore> = useTrialStore()

onMounted(async (): Promise<void> => {
  authStore.restoreSession()
  trialStore.refresh()
  await TauriWindowService.configureMainWindow()
})
</script>
