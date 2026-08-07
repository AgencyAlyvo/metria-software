import { AuthApiService } from '#src-core/services/AuthApiService'
import { HttpClientService } from '#src-core/services/HttpClientService'
import { useAuthStore } from '#src-nuxt/app/stores/auth.store'

/**
 * Plugin client-side qui injecte apiBaseUrl (+ getter token) dans les services core-api.
 * Doit s'exécuter avant tout appel AuthApiService / HttpClientService.
 * Sur HTTP 402, navigue vers `/pricing` via callback (pas d'import Nuxt dans src-core).
 */
export default defineNuxtPlugin((): void => {
  const runtimeConfig: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig()
  const apiBaseUrl: string = String(runtimeConfig.public.apiBaseUrl || '')
  const router: ReturnType<typeof useRouter> = useRouter()

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
    /**
     * Redirect pricing quand core-api renvoie 402 (essai/abonnement inactif).
     * @returns {void}
     */
    onPaymentRequired: (): void => {
      if (router.currentRoute.value.path === '/pricing') {
        return
      }

      void navigateTo('/pricing')
    },
  })
})
