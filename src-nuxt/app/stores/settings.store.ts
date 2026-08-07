import { defineStore } from 'pinia'
import type { Ref } from 'vue'

import { SettingsStorageService } from '#src-core/services/SettingsStorageService'
import type { AppSettings } from '#src-core/types/domain/settings.types'
import { DEFAULT_SETTINGS } from '#src-core/types/domain/settings.types'
import { isTauriRuntime } from '#src-core/utils/tauri-runtime'

/**
 * Clé localStorage utilisée hors Tauri (dev navigateur uniquement).
 */
const BROWSER_STORAGE_KEY: string = 'metria_settings'

/**
 * Store réglages exposé après unwrap Pinia.
 */
type SettingsStore = {
  settings: AppSettings
  isLoaded: boolean
  ensureLoaded: () => Promise<void>
  save: (next: AppSettings) => Promise<void>
}

/**
 * Store réglages interne basé sur des refs.
 */
type SettingsStoreSetup = {
  settings: Ref<AppSettings>
  isLoaded: Ref<boolean>
  ensureLoaded: () => Promise<void>
  save: (next: AppSettings) => Promise<void>
}

/**
 * Type callable du store réglages.
 */
type UseSettingsStore = () => SettingsStore

/**
 * Store des réglages persistés génériques.
 */
export const useSettingsStore: UseSettingsStore = defineStore('settings', (): SettingsStoreSetup => {
  const settings: Ref<AppSettings> = ref({ ...DEFAULT_SETTINGS })
  const isLoaded: Ref<boolean> = ref(false)

  /**
   * Charge les réglages depuis le stockage local (fichier Tauri ou localStorage en dev web).
   * @returns {Promise<void>}
   */
  const ensureLoaded: () => Promise<void> = async (): Promise<void> => {
    if (isLoaded.value) {
      return
    }

    if (isTauriRuntime()) {
      const stored: AppSettings | null = await SettingsStorageService.load()

      if (stored) {
        settings.value = stored
      }
    } else if (import.meta.client) {
      try {
        const raw: string | null = localStorage.getItem(BROWSER_STORAGE_KEY)

        if (raw) {
          settings.value = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) }
        }
      } catch {
        // Stockage navigateur corrompu — on repart des défauts.
      }
    }

    isLoaded.value = true
  }

  /**
   * Applique et persiste de nouveaux réglages.
   * @param {AppSettings} next - Réglages complets à sauvegarder.
   * @returns {Promise<void>}
   */
  const save: (next: AppSettings) => Promise<void> = async (next: AppSettings): Promise<void> => {
    settings.value = { ...next }

    if (isTauriRuntime()) {
      await SettingsStorageService.save(settings.value)
      return
    }

    if (import.meta.client) {
      localStorage.setItem(BROWSER_STORAGE_KEY, JSON.stringify(settings.value))
    }
  }

  return {
    settings,
    isLoaded,
    ensureLoaded,
    save,
  }
})
