<template>
  <div class="flex h-full flex-col gap-8 px-8 py-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-white">{{ copy.title }}</h1>
      <p class="max-w-2xl text-sm text-[#9ba3bd]">{{ copy.subtitle }}</p>
      <p v-if="store.error" class="text-sm text-red-300" role="alert">{{ store.error }}</p>
    </header>

    <div v-if="store.loading" class="text-sm text-[#9ba3bd]">Chargement…</div>

    <section v-else class="grid max-w-2xl gap-4 sm:grid-cols-2" aria-label="Totaux de consommation">
      <div class="rounded-xl border border-[#2f3d67] bg-[rgba(5,9,23,0.55)] p-5">
        <p class="text-sm text-[#9ba3bd]">{{ copy.organizationLabel }}</p>
        <p class="mt-2 text-2xl font-semibold text-white">{{ store.organizationLabel ?? '—' }}</p>
      </div>
      <div class="rounded-xl border border-[#2f3d67] bg-[rgba(5,9,23,0.55)] p-5">
        <p class="text-sm text-[#9ba3bd]">{{ copy.userLabel }}</p>
        <p class="mt-2 text-2xl font-semibold text-white">{{ store.userLabel ?? '—' }}</p>
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
import { CONSUMPTION_PAGE_COPY } from '#src-core/types/domain/usage.types'
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'
import { useTrialStore } from '#src-nuxt/app/stores/trial.store'
import { useUsageStore } from '#src-nuxt/app/stores/usage.store'
import { TauriWindowService } from '#src-core/services/TauriWindowService'

definePageMeta({
  layout: 'home',
})

const copy: typeof CONSUMPTION_PAGE_COPY = CONSUMPTION_PAGE_COPY
const store: ReturnType<typeof useUsageStore> = useUsageStore()
const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
const trialStore: ReturnType<typeof useTrialStore> = useTrialStore()

onMounted(async (): Promise<void> => {
  authStore.restoreSession()
  trialStore.refresh()
  await TauriWindowService.configureMainWindow()
  await store.load()
})
</script>
