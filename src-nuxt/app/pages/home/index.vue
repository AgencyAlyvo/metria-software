<template>
  <div class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
    <h1 class="text-2xl font-semibold tracking-tight text-white">Metria</h1>
    <p class="max-w-md text-sm text-[#9ba3bd]">
      Shell authentifié. Consultez
      <NuxtLink to="/pricing" class="text-[#9a65d5] underline-offset-4 hover:underline">les tarifs</NuxtLink>
      ou le bandeau d’essai. Le choix IA arrive dans la slice suivante.
    </p>
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
