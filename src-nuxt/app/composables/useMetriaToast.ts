/**
 * Toast Metria typé — toasts in-app Nuxt UI.
 */
type MetriaToastApi = {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  primary: (title: string, description?: string) => void
}

/**
 * Wrapper notifications Metria.
 * @returns {MetriaToastApi} API notifications typée.
 */
export const useMetriaToast: () => MetriaToastApi = (): MetriaToastApi => {
  const toast: ReturnType<typeof useToast> = useToast()

  /**
   * Affiche un toast Nuxt UI.
   * @param {string} title - Titre.
   * @param {string | undefined} description - Description optionnelle.
   * @param {'success' | 'error' | 'warning' | 'info' | 'primary'} color - Couleur du toast.
   * @param {number} duration - Durée d'affichage en ms.
   * @returns {void}
   */
  const push: (
    title: string,
    description: string | undefined,
    color: 'success' | 'error' | 'warning' | 'info' | 'primary',
    duration: number,
  ) => void = (
    title: string,
    description: string | undefined,
    color: 'success' | 'error' | 'warning' | 'info' | 'primary',
    duration: number,
  ): void => {
    toast.add({ title, description, color, duration })
  }

  return {
    /**
     * Affiche une notification de succès.
     * @param {string} title - Titre.
     * @param {string | undefined} description - Description optionnelle.
     * @returns {void}
     */
    success: (title: string, description?: string): void => {
      push(title, description, 'success', 3000)
    },
    /**
     * Affiche une notification d'erreur.
     * @param {string} title - Titre.
     * @param {string | undefined} description - Description optionnelle.
     * @returns {void}
     */
    error: (title: string, description?: string): void => {
      push(title, description, 'error', 5000)
    },
    /**
     * Affiche une notification d'avertissement.
     * @param {string} title - Titre.
     * @param {string | undefined} description - Description optionnelle.
     * @returns {void}
     */
    warning: (title: string, description?: string): void => {
      push(title, description, 'warning', 4000)
    },
    /**
     * Affiche une notification informative.
     * @param {string} title - Titre.
     * @param {string | undefined} description - Description optionnelle.
     * @returns {void}
     */
    info: (title: string, description?: string): void => {
      push(title, description, 'info', 3000)
    },
    /**
     * Affiche une notification primary Metria.
     * @param {string} title - Titre.
     * @param {string | undefined} description - Description optionnelle.
     * @returns {void}
     */
    primary: (title: string, description?: string): void => {
      push(title, description, 'primary', 4000)
    },
  }
}
