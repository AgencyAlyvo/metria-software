<template>
  <div class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
    <h1 class="text-2xl font-semibold tracking-tight text-white">Metria</h1>
    <p class="max-w-md text-sm text-[#9ba3bd]">
      Shell authentifié. Pricing / essai et choix IA arriveront dans les slices suivantes.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'

definePageMeta({
  layout: 'home',
})

const authStore: ReturnType<typeof useAuthStore> = useAuthStore()

onMounted((): void => {
  authStore.restoreSession()
})
</script>
