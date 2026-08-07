import { AuthApiService } from '#src-core/services/AuthApiService'
import { HttpClientService } from '#src-core/services/HttpClientService'
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'

/**
 * Plugin client-side qui injecte apiBaseUrl (+ getter token) dans les services core-api.
 * Doit s'exécuter avant tout appel AuthApiService / HttpClientService.
 */
export default defineNuxtPlugin((): void => {
  const runtimeConfig: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig()
  const apiBaseUrl: string = String(runtimeConfig.public.apiBaseUrl || '')

  AuthApiService.configure(apiBaseUrl)

  HttpClientService.configure({
    apiBaseUrl,
    /**
     * Lit le token bearer depuis le store auth Pinia.
     * @returns {string | undefined} Token courant.
     */
    getAuthToken: (): string | undefined => {
      const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
      return authStore.authToken
    },
  })
})
