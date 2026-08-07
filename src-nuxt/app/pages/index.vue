<template>
  <div class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
    <h1 class="text-3xl font-bold tracking-tight text-white">Metria</h1>
    <p class="max-w-md text-sm text-[#9ba3bd]">
      Base desktop Tauri 2 + Nuxt 4. Les écrans auth, shell et monétisation arriveront dans les prochaines slices.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { useSettingsStore } from '#src-nuxt/app/stores/settings.store'

const settingsStore: ReturnType<typeof useSettingsStore> = useSettingsStore()

onMounted((): void => {
  void settingsStore.ensureLoaded()
})
</script>
