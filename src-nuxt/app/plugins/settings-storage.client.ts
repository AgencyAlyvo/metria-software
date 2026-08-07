import { SettingsStorageService } from '#src-core/services/SettingsStorageService'

/**
 * Plugin client-side qui injecte l'identifiant d'application dans le SettingsStorageService.
 * Doit s'exécuter avant tout chargement des réglages (stores, pages).
 */
export default defineNuxtPlugin((): void => {
  const runtimeConfig: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig()

  SettingsStorageService.configure(runtimeConfig.public.appIdentifier as string)
})
