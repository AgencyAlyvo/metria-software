<template>
  <main class="flex h-screen flex-col items-center justify-center bg-[#060b12] px-8 text-white">
    <img class="mb-10 w-36 select-none" src="/logo-metria.png" alt="Metria" draggable="false" />

    <AutoUpdateLoader />

    <p class="mt-6 text-center font-sans text-lg font-medium">{{ updateStatus }}</p>

    <div v-if="updateAvailable" class="mt-5 h-3 w-56 overflow-hidden rounded-full bg-white/15">
      <div class="h-full bg-[#2fb7ff] transition-all duration-200" :style="{ width: `${downloadProgress}%` }"></div>
    </div>

    <p v-if="updateStatusDownload" class="mt-4 text-center font-sans text-sm text-white/75">
      {{ updateStatusDownload }}
    </p>
  </main>
</template>

<script lang="ts" setup>
import { relaunch } from '@tauri-apps/plugin-process'
import type { DownloadEvent, Update } from '@tauri-apps/plugin-updater'
import { check } from '@tauri-apps/plugin-updater'
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'

import { TauriWindowService } from '#src-core/services/TauriWindowService'
import { applyDownloadProgress, createDownloadProgressState, shouldCheckForUpdates } from '#src-core/utils/auto-update'
import type { DownloadProgressState } from '#src-core/utils/auto-update'
import { isTauriRuntime } from '#src-core/utils/tauri-runtime'
import { useWindowTransitionStore } from '#src-nuxt/app/stores/windowTransition.store'

definePageMeta({
  layout: false,
})

/**
 * Runtime config public utile pour l'écran d'auto-update.
 */
type PublicRuntimeConfig = {
  appEnv?: string
}

const runtimeConfig: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig()
const publicRuntimeConfig: PublicRuntimeConfig = runtimeConfig.public
const appEnv: string = publicRuntimeConfig.appEnv || 'development'
const windowTransitionStore: ReturnType<typeof useWindowTransitionStore> = useWindowTransitionStore()

const updateStatus: Ref<string> = ref('Checking for updates...')
const updateStatusDownload: Ref<string> = ref('')
const downloadProgress: Ref<number> = ref(0)
const updateAvailable: Ref<boolean> = ref(false)

let progressState: DownloadProgressState = createDownloadProgressState()

/**
 * Configure la fenêtre login puis redirige.
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

/**
 * Met à jour l'UI pendant le téléchargement de l'update.
 * @param {DownloadEvent} downloadEvent - Événement plugin updater.
 * @returns {void}
 */
const onDownloadProgress: (downloadEvent: DownloadEvent) => void = (downloadEvent: DownloadEvent): void => {
  progressState = applyDownloadProgress(progressState, downloadEvent)
  updateStatusDownload.value = progressState.statusDownload
  downloadProgress.value = progressState.progressPercentage
}

/**
 * Vérifie, télécharge et installe une update si nécessaire.
 * Gate : check en prod/staging, skip en development.
 * @returns {Promise<void>}
 */
const autoUpdateApplication: () => Promise<void> = async (): Promise<void> => {
  if (isTauriRuntime()) {
    await TauriWindowService.configureUpdateWindow()
  }

  if (!shouldCheckForUpdates(appEnv)) {
    updateStatus.value = 'Development mode.'
    await goToLogin()
    return
  }

  if (!isTauriRuntime()) {
    updateStatus.value = 'Skipping update check (non-Tauri runtime).'
    await goToLogin()
    return
  }

  try {
    const update: Update | null = await check()

    if (update?.available) {
      updateAvailable.value = true
      updateStatus.value = `Update v${update.version} found.`

      await update.downloadAndInstall(onDownloadProgress)
      await relaunch()
      return
    }

    updateStatus.value = 'Application already up to date.'
    await goToLogin()
  } catch (error: unknown) {
    console.error('Update error:', error)
    updateStatus.value = 'Error checking for updates.'
    updateStatusDownload.value = 'Please restart the application or try again later.'
  }
}

onMounted((): void => {
  void autoUpdateApplication()
})
</script>
