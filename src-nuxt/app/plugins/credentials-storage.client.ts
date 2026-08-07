import { CredentialsStorageService } from '#src-core/services/CredentialsStorageService'

/**
 * Plugin client-side qui injecte l'identifiant d'application dans le CredentialsStorageService.
 * Doit s'exécuter avant tout appel au service (login, auto-login).
 */
export default defineNuxtPlugin((): void => {
  const runtimeConfig: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig()

  CredentialsStorageService.configure(runtimeConfig.public.appIdentifier as string)
})
