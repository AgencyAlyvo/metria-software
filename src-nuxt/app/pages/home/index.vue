<template>
  <div class="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
    <div class="flex flex-col gap-3">
      <h1 class="text-2xl font-semibold tracking-tight text-white">Metria</h1>
      <p class="max-w-md text-sm text-[#9ba3bd]">Shell authentifié. Accédez aux réglages IA et à la consommation.</p>
    </div>

    <nav class="flex flex-wrap items-center justify-center gap-4 text-sm" aria-label="Réglages">
      <NuxtLink to="/ai" class="text-[#9a65d5] underline-offset-4 hover:underline">Choix de l’IA</NuxtLink>
      <NuxtLink to="/consommation" class="text-[#9a65d5] underline-offset-4 hover:underline"> Consommation </NuxtLink>
      <NuxtLink to="/pricing" class="text-[#9a65d5] underline-offset-4 hover:underline">Tarifs</NuxtLink>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'
import { useTrialStore } from '#src-nuxt/app/stores/trial.store'

definePageMeta({
  layout: 'home',
})

const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
const trialStore: ReturnType<typeof useTrialStore> = useTrialStore()

onMounted((): void => {
  authStore.restoreSession()
  trialStore.refresh()
})
</script>
