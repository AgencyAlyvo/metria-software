import { defineStore } from 'pinia'
import type { Ref } from 'vue'

/**
 * État et actions exposés par le store de transition fenêtre.
 */
type WindowTransitionStore = {
  isLoading: boolean
  setLoading: (value: boolean) => void
}

/**
 * État et actions retournés par le setup store avant unwrap Pinia.
 */
type WindowTransitionStoreSetup = {
  isLoading: Ref<boolean>
  setLoading: (value: boolean) => void
}

/**
 * Définition callable du store de transition fenêtre.
 */
type UseWindowTransitionStore = () => WindowTransitionStore

/**
 * Store gérant le loader global pendant les transitions de fenêtre.
 */
export const useWindowTransitionStore: UseWindowTransitionStore = defineStore(
  'windowTransition',
  (): WindowTransitionStoreSetup => {
    const isLoading: Ref<boolean> = ref(false)

    /**
     * Active ou désactive le loader global.
     * @param {boolean} value - État du loader.
     * @returns {void}
     */
    const setLoading: (value: boolean) => void = (value: boolean): void => {
      isLoading.value = value
    }

    return {
      isLoading,
      setLoading,
    }
  },
)
