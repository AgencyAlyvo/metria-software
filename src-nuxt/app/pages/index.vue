<template>
  <div class="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
    <p class="text-sm text-[#9ba3bd]">Redirection…</p>
  </div>
</template>

<script lang="ts" setup>
import { TauriWindowService } from '#src-core/services/TauriWindowService'
import { isTauriRuntime } from '#src-core/utils/tauri-runtime'
import { useWindowTransitionStore } from '#src-nuxt/app/stores/windowTransition.store'

definePageMeta({
  layout: false,
})

const windowTransitionStore: ReturnType<typeof useWindowTransitionStore> = useWindowTransitionStore()

/**
 * Slice (b) : l'écran update (slice c) n'est pas encore branché — on enchaîne vers /login.
 * @returns {Promise<void>}
 */
const goToLogin: () => Promise<void> = async (): Promise<void> => {
  windowTransitionStore.setLoading(true)

  try {
    if (isTauriRuntime()) {
      await TauriWindowService.configureLoginWindow()
    }

    await navigateTo('/login')
  } finally {
    windowTransitionStore.setLoading(false)
  }
}

onMounted((): void => {
  void goToLogin()
})
</script>
