<template>
  <div class="flex h-screen flex-col bg-[#0a1120] text-slate-200">
    <WindowBar>
      <img class="h-5 select-none" src="/logo-metria.png" alt="Metria" draggable="false" />
    </WindowBar>

    <div
      v-if="trialStore.showBanner && trialStore.bannerLabel"
      class="flex items-center justify-center border-b border-[#2f3d67] bg-[rgba(154,101,213,0.12)] px-4 py-2"
    >
      <NuxtLink
        to="/pricing"
        class="text-sm font-medium tracking-wide text-[#e8ddff] underline-offset-4 hover:text-white hover:underline"
      >
        {{ trialStore.bannerLabel }}
      </NuxtLink>
    </div>

    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useTrialStore } from '#src-nuxt/app/stores/trial.store'

const trialStore: ReturnType<typeof useTrialStore> = useTrialStore()

onMounted((): void => {
  trialStore.refresh()
})
</script>
