import { useAuthStore } from '#src-nuxt/app/stores/auth.store'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const requiresAuth: boolean = to.path.startsWith('/home') || to.path === '/pricing'

  if (!requiresAuth) {
    return
  }

  const authStore: ReturnType<typeof useAuthStore> = useAuthStore()
  authStore.restoreSession()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
